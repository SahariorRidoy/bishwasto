'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { TrendingUp, ShoppingBag, DollarSign, Calendar } from 'lucide-react';
import { useSelector } from 'react-redux';

export default function StatsCards() {
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  
  // Get selected shop from Redux store
  const selectedShop = useSelector(state => state.shop?.selectedShop);
  
  // Use shop ID from Redux
  const shopId = selectedShop?.id?.toString();

  // Check if user is authenticated
  useEffect(() => {
    const accessToken = Cookies.get('accessToken');
    setIsAuthenticated(!!accessToken);
  }, []);

  useEffect(() => {
    const fetchSalesData = async () => {
      // Skip fetch if not authenticated or no shop selected
      if (!isAuthenticated || !shopId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const accessToken = Cookies.get('accessToken');
        
        // Double check token is available
        if (!accessToken) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}reports/sales/${shopId}/`, 
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        
        setSalesData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching sales data:', err);
        
        // Handle authentication errors
        if (err?.response?.status === 401) {
          setIsAuthenticated(false);
          setError('Authentication error. Please login again.');
        } else {
          setError('Failed to load sales data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [shopId, isAuthenticated]);

  // Calculate stats
  const calculateStats = () => {
    if (!salesData || !salesData.sales_details || salesData.sales_details.length === 0) {
      return { revenue: 0, orders: 0 };
    }
    
    // Total orders is simply the length of the sales_details array
    const totalOrders = salesData.sales_details.length;
    
    // For demonstration, we're still calculating today's revenue
    // In a real implementation, you would need date information to filter today's orders
    const todaysRevenue = 0; // Simplified as we don't have date information in the sample data

    return {
      revenue: todaysRevenue,
      orders: totalOrders
    };
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `BDT ${parseFloat(amount || 0).toLocaleString()}`;
  };

  // Prepare stats data
  const prepareStatsData = () => {
    if (!salesData) return [];

    const stats = calculateStats();
    
    return [
      {
        title: "Total Revenue",
        value: formatCurrency(salesData.revenue || 0),
        lightGradient: "bg-[#00ADB5]",
        darkGradient: "bg-blue-500",
        lightText: "text-teal-100",
        darkText: "text-blue-100",
        icon: <p className="h-6 w-6 text-2xl font-bold opacity-70" >৳</p>
      },
      {
        title: "Total Orders",
        value: stats.orders.toString(),
        lightGradient: "bg-[#00ADB5]",
        darkGradient: "bg-blue-500",
        lightText: "text-teal-100",
        darkText: "text-blue-100",
        icon: <ShoppingBag className="h-6 w-6 opacity-70" />
      },
      {
        title: "Total Profit",
        value: formatCurrency(salesData.profit || 0),
        lightGradient: "bg-[#00ADB5]",
        darkGradient: "bg-blue-500",
        lightText: "text-teal-100",
        darkText: "text-blue-100",
        icon: <TrendingUp className="h-6 w-6 opacity-70" />
      },
      {
        title: "Total Dues",
        value: formatCurrency(salesData.total_dues || 0),
        lightGradient: "bg-[#00ADB5]",
        darkGradient: "bg-blue-500",
        lightText: "text-teal-100",
        darkText: "text-blue-100",
        icon: <Calendar className="h-6 w-6 opacity-70" />
      },
    ];
  };

  // Handle not authenticated state
  if (!isAuthenticated) {
    return (
      <div className="p-4 md:p-6 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-lg">
        <p>Please log in to view sales statistics.</p>
      </div>
    );
  }

  // Handle no shop selected state
  if (!shopId && !loading) {
    return (
      <div className="p-4 md:p-6 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg">
        <p>Please select a shop to view sales statistics.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 p-4 md:p-6">
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 text-white p-4 md:p-5 rounded-2xl shadow-md animate-pulse"
          >
            <div className="flex flex-col space-y-1 h-16">
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mt-2"></div>
              <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mt-1"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  const statsData = prepareStatsData();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 p-4 md:p-6">
      {statsData.map((stat, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br ${stat.lightGradient} dark:${stat.darkGradient} text-white p-4 md:p-5 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 ease-in-out`}
        >
          <div className="flex justify-between items-start">
            <div className="flex flex-col space-y-1">
              <p className={`text-[0.7rem] md:text-xs font-semibold uppercase tracking-wide ${stat.lightText} dark:${stat.darkText}`}>
                {stat.title}
              </p>
              <h2 className="text-xl md:text-2xl font-bold">{stat.value}</h2>
              
            </div>
            <div>{stat.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}