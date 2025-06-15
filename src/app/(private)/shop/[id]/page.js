'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import classNames from 'classnames';
import axios from 'axios';
import Cookies from 'js-cookie';
import {  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Calendar, DollarSign, ShoppingBag, Users, TrendingUp, Building } from 'lucide-react';
import ShopUpdateForm from '../../../../components/updateShop/ShopUpdateForm';
import Link from 'next/link';
import Swal from 'sweetalert2';

const COLORS = ['#00ADB5', '#393E46', '#2E8BC0', '#6A7FDB'];

export default function ShopDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [activeTab, setActiveTab] = useState('overview');
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shopCategories, setShopCategories] = useState([]);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Fetch shop details when component mounts
  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        setLoading(true);
        const accessToken = Cookies.get('accessToken');
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}shop/${id}/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        // Normalize the API response to match the expected structure
        const shopData = {
          id: response.data.id,
          name: response.data.name || response.data.shop_name,
          category: response.data.category_name || response.data.category,
          status: response.data.is_active ? 'active' : response.data.status || 'inactive',
          stats: {
            orders: response.data.stats?.orders || 0,
            income: response.data.stats?.income || 0,
            expense: response.data.stats?.expense || 0,
            employees: response.data.stats?.employees || 0,
            profit: response.data.stats?.profit || 0,
            monthlyOrders: response.data.stats?.monthlyOrders || [
              { month: 'Jan', orders: 0 },
              { month: 'Feb', orders: 0 },
              { month: 'Mar', orders: 0 },
              { month: 'Apr', orders: 0 },
              { month: 'May', orders: 0 },
              { month: 'Jun', orders: 0 },
            ],
            productCategories: response.data.stats?.productCategories || [
              { name: 'Unknown', value: 100 },
            ],
            monthlySales: response.data.stats?.monthlySales || [
              { month: 'Jan', sales: 0 },
              { month: 'Feb', sales: 0 },
              { month: 'Mar', sales: 0 },
              { month: 'Apr', sales: 0 },
              { month: 'May', sales: 0 },
              { month: 'Jun', sales: 0 },
            ],
          },
        };

        setShop(shopData);
        setError(null);
      } catch (err) {
        console.error('Error fetching shop details:', err);
        setError('Failed to load shop details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchShopDetails();
    }
  }, [id]);

  // Fetch categories to map category IDs to names
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const accessToken = Cookies.get('accessToken');
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}shop/categories/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const fetchNextPages = async (nextUrl) => {
          try {
            const accessToken = Cookies.get('accessToken');
            const response = await axios.get(nextUrl, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (response.data && response.data.results) {
              setShopCategories((prevCategories) => {
                const existingIds = new Set(prevCategories.map((cat) => cat.id));
                const newCategories = response.data.results.filter((cat) => !existingIds.has(cat.id));
                return [...prevCategories, ...newCategories];
              });
              if (response.data.next) {
                fetchNextPages(response.data.next);
              }
            }
          } catch (error) {
            console.error('Failed to fetch additional categories:', error);
          }
        };

        if (response.data && response.data.results) {
          setShopCategories(response.data.results);
          if (response.data.next) {
            fetchNextPages(response.data.next);
          }
        } else {
          const categoriesData = Array.isArray(response.data) ? response.data : response.data.categories || [];
          setShopCategories(categoriesData);
        }
      } catch (error) {
        console.error('Failed to fetch shop categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Function to handle shop deactivation
  const handleDeactivate = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, deactivate it!"
    });
  
    if (!result.isConfirmed) return;
  
    try {
      setIsDeactivating(true);
      const accessToken = Cookies.get('accessToken');
  
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}shop/${id}/deactivate/`,
        { 
          is_active: false,
          status: 'deactivated' // Optional: depending on your backend logic
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
  
      setShop((prevShop) => ({
        ...prevShop,
        status: 'deactivated',
      }));
  
      await Swal.fire({
        title: "Deactivated!",
        text: "Your shop has been deactivated and set to deactivated.",
        icon: "success"
      });
    } catch (err) {
      console.error('Error deactivating shop:', err);
      await Swal.fire({
        title: "Error!",
        text: "Failed to deactivate shop. Please try again later.",
        icon: "error"
      });
    } finally {
      setIsDeactivating(false);
    }
  };
  

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="rounded-lg bg-white p-6 text-center text-gray-700 shadow-lg dark:bg-gray-800 dark:text-gray-300">
          Loading shop details...
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="rounded-lg bg-white p-6 text-center text-gray-700 shadow-lg dark:bg-gray-800 dark:text-gray-300">
          {error || 'Shop not found'}
          <Button
            onClick={() => router.back()}
            className="mt-4 rounded-lg bg-[#00ADB5] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#00989f] dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Back to Shops
          </Button>
        </div>
      </div>
    );
  }

  // Map category ID to name if category is an ID
  const categoryName =
    typeof shop.category === 'number'
      ? shopCategories.find((cat) => cat.id === shop.category)?.name || 'Unknown'
      : shop.category;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-900 md:px-8">
      {showUpdateForm && (
        <ShopUpdateForm 
          shop={shop} 
          shopId={id} 
          onCancel={() => setShowUpdateForm(false)} 
        />
      )}
      
      <div className="mx-auto max-w-6xl">
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              {shop.name}
            </h1>
           
          </div>
          <div className="mt-4 flex flex-wrap gap-2 md:mt-0">
            <Button
              onClick={() => setShowUpdateForm(true)}
              className="rounded-lg bg-[#db7235] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#f5b886] dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Update Shop Info
            </Button>
            {shop.status === 'active' && (
              <Button
                onClick={handleDeactivate}
                disabled={isDeactivating}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
              >
                {isDeactivating ? 'Deactivating...' : 'Deactivate Shop'}
              </Button>
            )}
            <Button
              onClick={() => router.back()}
              className="rounded-lg bg-[#00ADB5] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#00989f] dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Back to Shops 
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={classNames(
              'px-4 py-2 font-medium cursor-pointer',
              activeTab === 'overview'
                ? 'border-b-2 border-[#00ADB5] text-[#00ADB5] dark:border-[#00ADB5] dark:text-[#00ADB5]'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            )}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={classNames(
              'px-4 py-2 font-medium cursor-pointer',
              activeTab === 'analytics'
                ? 'border-b-2 border-[#00ADB5] text-[#00ADB5] dark:border-[#00ADB5] dark:text-[#00ADB5]'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            )}
          >
            Analytics
          </button>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Shop Details Card */}
            <div className="mb-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Building className="h-5 w-5 text-[#00ADB5]" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Shop Information
                </h2>
              </div>
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                
                <div className="flex items-center justify-between">
                  <p>
                    <strong className="font-medium text-gray-900 dark:text-gray-200">
                      Category:
                    </strong>{' '}
                    {categoryName}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p>
                    <strong className="font-medium text-gray-900 dark:text-gray-200">
                      Status:
                    </strong>{' '}
                    <span
                      className={classNames(
                        'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
                        shop.status === 'active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                          : shop.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                      )}
                    >
                      {shop.status.charAt(0).toUpperCase() + shop.status.slice(1)}
                    </span>
                    
                  </p>
                </div>
              </div>
            </div>

            {/* Statistics Card */}
            <div className="mb-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-[#00ADB5]" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Key Statistics
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50 flex flex-col items-center">
                  <ShoppingBag className="h-8 w-8 text-[#00ADB5] mb-2" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Orders
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {shop.stats.orders}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50 flex flex-col items-center">
                  <DollarSign className="h-8 w-8 text-[#00ADB5] mb-2" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Income
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    ৳ {shop.stats.income.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50 flex flex-col items-center">
                  <Calendar className="h-8 w-8 text-[#00ADB5] mb-2" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Expense
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    ৳ {shop.stats.expense.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50 flex flex-col items-center">
                  <Users className="h-8 w-8 text-[#00ADB5] mb-2" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Employees
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {shop.stats.employees}
                  </p>
                </div>
              </div>
            </div>

            {/* Charts Preview */}
            <Button
              className="bg-[#00ADB5] text-white border dark:bg-blue-500 hover:bg-[#00989f] dark:hover:bg-blue-600"
              onClick={() => setActiveTab('analytics')}
            >
              View Detailed Analytics
            </Button>
          </>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Financial Summary */}
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Financial Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-700/50 flex flex-col items-center">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Income
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    ৳ {shop.stats.income.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-700/50 flex flex-col items-center">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Expense
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    ৳ {shop.stats.expense.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-green-50 p-6 dark:bg-green-900/20 flex flex-col items-center">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    Total Profit
                  </p>
                  <p className="text-2xl font-semibold text-green-700 dark:text-green-300">
                    ৳ {shop.stats.profit.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Monthly Sales Chart */}
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Monthly Sales
              </h2>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={shop.stats.monthlySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="sales" stroke="#00ADB5" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Product Categories */}
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Product Categories
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={shop.stats.productCategories}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {shop.stats.productCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col justify-center">
                  <div className="space-y-4">
                    {shop.stats.productCategories.map((category, index) => (
                      <div key={index} className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-2"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-gray-700 dark:text-gray-300">
                          {category.name}: {category.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}