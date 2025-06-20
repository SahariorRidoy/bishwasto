'use client';

import { useState, useMemo, useEffect } from 'react';
import SendReminderButton from '@/components/reminder-button/send-reminder-button';
import classNames from 'classnames';
import { ChevronUp, ChevronDown, Edit2, Save, X, Search } from 'lucide-react';
import Swal from 'sweetalert2';
import { useSelector } from "react-redux";
import axios from "axios";
import Cookies from "js-cookie";

export default function DueListPage() {
  const [asc, setAsc] = useState(false);
  const [consolidatedDueList, setConsolidatedDueList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTablet, setIsTablet] = useState(false);

  const selectedShop = useSelector((state) => state.shop.selectedShop);
  const shopId = selectedShop?.id;

  useEffect(() => {
    const fetchDueList = async () => {
      try {
        setLoading(true);
        const accessToken = Cookies.get("accessToken");
        if (!accessToken) {
          throw new Error("Authentication required");
        }
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}due/list/${shopId}/`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        const dueList = response.data;
        // Group by customer ID and calculate total due
        const grouped = dueList.reduce((acc, item) => {
          const key = item.customer;
          if (!acc[key]) {
            acc[key] = {
              customer_id: key,
              customer_name: item.customer_name || `Customer #${item.customer}`,
              customer_phone_number: item.customer_phone_number,
              total_due: 0,
              due_items: [],
            };
          }
          acc[key].total_due += parseFloat(item.due_amount);
          acc[key].due_items.push(item);
          return acc;
        }, {});
        setConsolidatedDueList(Object.values(grouped));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching due list:", err);
        setError(err.response?.data?.message || err.message || "Failed to load due list");
        setLoading(false);
      }
    };

    if (shopId) {
      fetchDueList();
    } else {
      setLoading(false);
      setError("No shop selected");
    }
  }, [shopId]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const filteredDueList = useMemo(() => {
    if (!searchTerm) return consolidatedDueList;
    const searchLower = searchTerm.toLowerCase();
    return consolidatedDueList.filter(customer =>
      (customer.customer_name.toLowerCase().includes(searchLower)) ||
      (customer.customer_phone_number.toLowerCase().includes(searchLower))
    );
  }, [consolidatedDueList, searchTerm]);

  const sortedDueList = useMemo(() => {
    return [...filteredDueList].sort((a, b) => {
      const da = parseFloat(a.total_due);
      const db = parseFloat(b.total_due);
      return asc ? da - db : db - da;
    });
  }, [asc, filteredDueList]);

  const handleEdit = (customer) => {
    setEditingId(customer.customer_id);
    setPaymentAmount('');
  };

  const handleSave = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to save the changes?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#EF4444",
      confirmButtonText: "Yes, save it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const accessToken = Cookies.get("accessToken");
        const customer = consolidatedDueList.find(c => c.customer_id === editingId);
        if (customer) {
          let paymentLeft = parseFloat(paymentAmount);
          if (isNaN(paymentLeft) || paymentLeft <= 0) {
            throw new Error("Invalid payment amount");
          }
          const updatedDueItems = customer.due_items.map(item => {
            if (paymentLeft <= 0) return item;
            const dueAmount = parseFloat(item.due_amount);
            const paymentToApply = Math.min(dueAmount, paymentLeft);
            const newDueAmount = dueAmount - paymentToApply;
            paymentLeft -= paymentToApply;
            return { ...item, due_amount: newDueAmount.toString() };
          });
          // Update each modified due item via API
          for (const item of updatedDueItems) {
            const originalItem = customer.due_items.find(i => i.id === item.id);
            if (item.due_amount !== originalItem.due_amount) {
              await axios.patch(
                `${process.env.NEXT_PUBLIC_API_URL}due/retrieve/${shopId}/${item.id}/`,
                { due_amount: item.due_amount },
                { headers: { Authorization: `Bearer ${accessToken}` } }
              );
            }
          }
          // Update local state
          setConsolidatedDueList(prevList =>
            prevList.map(c =>
              c.customer_id === editingId
                ? { ...c, total_due: c.total_due - parseFloat(paymentAmount), due_items: updatedDueItems }
                : c
            )
          );
          Swal.fire({
            title: "Updated!",
            text: "The due has been updated.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
        }
      } catch (err) {
        console.error("Error updating due:", err);
        Swal.fire({
          title: "Error!",
          text: err.message || "Failed to update the due.",
          icon: "error",
        });
      }
    }
    setEditingId(null);
    setPaymentAmount('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setPaymentAmount('');
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500 dark:border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="font-medium">Error loading due list</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const renderMobileView = () => {
    return (
      <div className="sm:hidden space-y-3">
        {sortedDueList.length > 0 ? (
          sortedDueList.map((customer) => (
            <div
              key={customer.customer_id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate pr-2">
                  {customer.customer_name}
                </h3>
                <div className="text-sm text-red-600 dark:text-red-300">
                  {editingId === customer.customer_id ? (
                    <div>
                      <div>Due: ৳ {customer.total_due}</div>
                      <div className="flex items-center mt-1">
                        <span className="mr-1">Payment: ৳</span>
                        <input
                          type="text"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          className="w-16 px-1 py-0.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          autoFocus
                        />
                      </div>
                    </div>
                  ) : (
                    <>৳ {customer.total_due}</>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="text-gray-500 dark:text-gray-400 truncate pr-2">
                  {customer.customer_phone_number}
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <SendReminderButton customer={{ ...customer, due_amount: customer.total_due }} />
                  {editingId === customer.customer_id ? (
                    <div className="flex space-x-1">
                      <button
                        onClick={handleSave}
                        className="p-1 text-green-600 cursor-pointer hover:text-green-800 dark:text-green-500 dark:hover:text-green-300"
                        title="Save"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-1 text-red-600 cursor-pointer hover:text-red-800 dark:text-red-500 dark:hover:text-red-300"
                        title="Cancel"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(customer)}
                      className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-300"
                      title="Edit Due"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="w-full py-8 flex flex-col items-center justify-center text-center">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-3 mb-2">
              <Search className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-1">No dues found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchTerm
                ? "Try changing your search query or check for typos"
                : "There are no outstanding dues recorded"}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#00ADB5] dark:text-blue-500">
            Outstanding Dues
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400">
            List of customers with pending payments
          </p>
        </div>
        <div className="relative w-full sm:w-64 lg:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name or phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-teal-500 focus:border-teal-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      {renderMobileView()}

      <div className="hidden sm:block overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="w-1/4 px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Name
                </th>
                <th className="w-1/4 px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Mobile
                </th>
                <th className="w-1/4 px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">
                  <div className="flex items-center">
                    <span>Due Amount</span>
                    <div className="flex flex-col ml-2">
                      <ChevronUp
                        onClick={() => setAsc(true)}
                        className={classNames(
                          'cursor-pointer h-3 w-3 sm:h-4 sm:w-4',
                          asc ? 'text-teal-500' : 'text-gray-300 dark:text-gray-500'
                        )}
                        title="Sort ascending"
                      />
                      <ChevronDown
                        onClick={() => setAsc(false)}
                        className={classNames(
                          'cursor-pointer h-3 w-3 sm:h-4 sm:w-4',
                          !asc ? 'text-teal-500' : 'text-gray-300 dark:text-gray-500'
                        )}
                        title="Sort descending"
                      />
                    </div>
                  </div>
                </th>
                <th className="w-1/6 px-4 py-3 text-center text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Send Message
                </th>
                <th className="w-1/6 px-4 py-3 text-right text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Update
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedDueList.length > 0 ? (
                sortedDueList.map((customer) => (
                  <tr
                    key={customer.customer_id}
                    className={classNames(
                      'hover:bg-gray-50 dark:hover:bg-gray-700/50',
                      customer.customer_id % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'
                    )}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
                      {customer.customer_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {customer.customer_phone_number}
                    </td>
                    <td className={classNames(
                      "px-4 py-3 whitespace-nowrap text-xs sm:text-sm font-semibold text-red-600 dark:text-red-300",
                      editingId === customer.customer_id ? 'bg-yellow-100 dark:bg-yellow-900' : ''
                    )}>
                      {editingId === customer.customer_id ? (
                        <div>
                          <div>Due: ৳ {customer.total_due}</div>
                          <div className="flex items-center mt-1">
                            <span className="mr-1">Payment: ৳</span>
                            <input
                              type="text"
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              className="w-16 sm:w-24 px-1 sm:px-2 py-0.5 sm:py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                              autoFocus
                            />
                          </div>
                        </div>
                      ) : (
                        <>৳ {customer.total_due}</>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-xs sm:text-sm">
                      <SendReminderButton customer={{ ...customer, due_amount: customer.total_due }} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-xs sm:text-sm">
                      {editingId === customer.customer_id ? (
                        <div className="flex justify-end items-center space-x-1 sm:space-x-2">
                          <button
                            onClick={handleSave}
                            className="p-1 text-green-600 cursor-pointer hover:text-green-800 dark:text-green-500 dark:hover:text-green-300"
                            title="Save"
                          >
                            <Save className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1 text-red-600 cursor-pointer hover:text-red-800 dark:text-red-500 dark:hover:text-red-300"
                            title="Cancel"
                          >
                            <X className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(customer)}
                          className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-300"
                          title="Edit Due"
                        >
                          <Edit2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No dues found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {sortedDueList.length > 0 && (
          <div className="bg-white dark:bg-gray-800 px-4 py-3 sm:px-6 sm:py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{sortedDueList.length}</span> of{" "}
                <span className="font-medium">{sortedDueList.length}</span> results
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button disabled className="cursor-pointer hover:bg-teal-500 dark:hover:bg-blue-500 hover:text-white px-2 sm:px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                  Previous
                </button>
                <button className="px-2 sm:px-3 py-1 rounded-md bg-teal-500 dark:bg-blue-500 text-white text-xs sm:text-sm">1</button>
                <button disabled className="cursor-pointer hover:bg-teal-500 dark:hover:bg-blue-500 hover:text-white px-2 sm:px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}