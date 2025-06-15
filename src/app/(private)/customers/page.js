"use client";
import { useState, useEffect, useMemo } from "react";
import SendReminderButton from "@/components/reminder-button/send-reminder-button";
import { useSelector } from "react-redux";
import axios from "axios";
import Cookies from "js-cookie";
import { Search } from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Get selected shop from Redux store
  const selectedShop = useSelector((state) => state.shop.selectedShop);
  const shopId = selectedShop?.id;
  
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const accessToken = Cookies.get("accessToken");
        
        if (!accessToken) {
          throw new Error("Authentication required");
        }
        
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}customers/list/${shopId}/`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        
        setCustomers(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching customers:", err);
        setError(err.response?.data?.message || err.message || "Failed to load customers");
        setLoading(false);
      }
    };
    
    if (shopId) {
      fetchCustomers();
    } else {
      setLoading(false);
      setError("No shop selected");
    }
  }, [shopId]);

  // Handle search input changes
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter customers based on search query
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    
    const query = searchQuery.toLowerCase();
    return customers.filter(customer => 
      (customer.name?.toLowerCase().includes(query)) || 
      (customer.phone_number?.toLowerCase().includes(query))
    );
  }, [customers, searchQuery]);

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
          <p className="font-medium">Error loading customers</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-2 sm:px-3 md:px-4 lg:px-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Customers</h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Manage your customers</p>
        </div>
        
        {/* Search input */}
        <div className="relative w-full sm:w-60 md:w-72">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 placeholder-gray-400 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-blue-500"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={handleSearch}
          />
          {searchQuery && (
            <button
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={() => setSearchQuery("")}
            >
              <span className="text-gray-400 hover:text-gray-500">✕</span>
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      {searchQuery && (
        <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          Found {filteredCustomers.length} {filteredCustomers.length === 1 ? "result" : "results"} for {searchQuery}
        </div>
      )}

      {/* No results message */}
      {filteredCustomers.length === 0 && (
        <div className="w-full py-8 flex flex-col items-center justify-center text-center">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-3 mb-2">
            <Search className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-1">No customers found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {searchQuery 
              ? "Try changing your search query or check for typos" 
              : "You don't have any customers yet"}
          </p>
        </div>
      )}

      {/* Card view for mobile (extra small devices) */}
      {filteredCustomers.length > 0 && (
        <div className="block sm:hidden">
          <div className="space-y-3">
            {filteredCustomers.map((customer) => (
              <div 
                key={customer.id} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 dark:from-blue-500 dark:to-blue-600 flex items-center justify-center text-white font-medium text-sm">
                      {customer.name ? customer.name.charAt(0) : customer.phone_number.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium">
                        {customer.name || `Customer #${customer.id}`}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{customer.phone_number}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Loyalty: <span className="font-semibold">{customer.loyalty_points} P</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-1">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Dues:</span>
                    <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${
                      customer.total_due === 0
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                    }`}>
                      {customer.total_due}
                    </span>
                  </div>
                  <div>
                    {customer.total_due > 0 && <SendReminderButton customer={customer} />}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Mobile pagination */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium">{filteredCustomers.length}</span> results
            </div>
            <div className="flex items-center space-x-1">
              <button className="px-2 py-1 text-xs rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-teal-500 dark:hover:bg-blue-500 hover:text-white">
                Previous
              </button>
              <button className="px-2 py-1 text-xs rounded-md bg-teal-500 dark:bg-blue-500 text-white">
                1
              </button>
              <button className="px-2 py-1 text-xs rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-teal-500 dark:hover:bg-blue-500 hover:text-white">
                2
              </button>
              <button className="px-2 py-1 text-xs rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-teal-500 dark:hover:bg-blue-500 hover:text-white">
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table view for larger screens */}
      {filteredCustomers.length > 0 && (
        <div className="hidden sm:block bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed md:table-auto">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/3 md:w-auto">
                    Name
                  </th>
                  <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/3 md:w-auto">
                    Phone
                  </th>
                  <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/6 md:w-auto">
                    Loyalty
                  </th>
                  <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/6 md:w-auto">
                    Dues
                  </th>
                  <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16 md:w-auto">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 dark:from-blue-500 dark:to-blue-600 flex items-center justify-center text-white font-medium text-xs sm:text-sm">
                          {customer.name ? customer.name.charAt(0) : customer.phone_number.charAt(0)}
                        </div>
                        <div className="ml-2 sm:ml-3 md:ml-4">
                          <div className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-[150px] md:max-w-none">
                            {customer.name || `Customer #${customer.id}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                      {customer.phone_number}
                    </td>
                    <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                      {customer.loyalty_points} P
                    </td>
                    <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full ${
                          customer.total_due === 0
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                        }`}>
                          {customer.total_due}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                      {customer.total_due > 0 && <SendReminderButton customer={customer} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-white dark:bg-gray-800 px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredCustomers.length}</span> of{" "}
                <span className="font-medium">{filteredCustomers.length}</span> results
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button className="px-2 sm:px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs sm:text-sm hover:bg-teal-500 dark:hover:bg-blue-500 hover:text-white">
                  Previous
                </button>
                <button className="px-2 sm:px-3 py-1 rounded-md bg-teal-500 dark:bg-blue-500 text-white text-xs sm:text-sm">
                  1
                </button>
                <button className="px-2 sm:px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs sm:text-sm hover:bg-teal-500 dark:hover:bg-blue-500 hover:text-white">
                  2
                </button>
                <button className="px-2 sm:px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs sm:text-sm hover:bg-teal-500 dark:hover:bg-blue-500 hover:text-white">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}