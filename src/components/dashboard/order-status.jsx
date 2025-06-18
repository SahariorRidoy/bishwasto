"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Cookies from "js-cookie";

export default function OrderStatus() {
  const [orderData, setOrderData] = useState({ completed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const selectedShop = useSelector((state) => state.shop?.selectedShop);
  const shopId = selectedShop?.id?.toString();
  const isDark = useSelector((state) => state.theme.isDark);

  // Check authentication status
  useEffect(() => {
    const accessToken = Cookies.get("accessToken");
    setIsAuthenticated(!!accessToken);
  }, []);

  // Fetch order data from API
  useEffect(() => {
    if (!isAuthenticated || !shopId) {
      setLoading(false);
      setError(!isAuthenticated ? "Please log in to view order status." : "Please select a shop to view order status.");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const accessToken = Cookies.get("accessToken");
        if (!accessToken) {
          setIsAuthenticated(false);
          setError("Authentication error. Please login again.");
          return;
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}order/list/${shopId}/`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const orders = Array.isArray(response.data) ? response.data : [];
        const completedCount = orders.filter(order => parseFloat(order.due) === 0).length;
        const pendingCount = orders.length - completedCount;

        setOrderData({
          completed: completedCount,
          pending: pendingCount,
        });
        setError(null);
      } catch (err) {
        console.error("Error fetching order data:", err);
        if (err?.response?.status === 401) {
          setIsAuthenticated(false);
          setError("Authentication error. Please login again.");
        } else if (err?.response?.status === 404) {
          setError("No orders found for this shop.");
        } else {
          setError(`Failed to fetch order data: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [shopId, isAuthenticated]);

  // Render authentication or shop selection prompts
  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 text-yellow-900 dark:text-yellow-200 rounded-xl shadow-lg">
        <p className="text-sm font-medium">Please log in to view order status.</p>
      </div>
    );
  }

  if (!shopId && !loading) {
    return (
      <div className="p-6 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-900 dark:text-blue-200 rounded-xl shadow-lg">
        <p className="text-sm font-medium">Please select a shop to view order status.</p>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-2xl shadow-xl transition-all duration-300 ${isDark ? "bg-gray-900/80 backdrop-blur-sm" : "bg-white"}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className={`text-2xl font-bold ${isDark ? "text-white" : "text-[#00ADB5]"}`}>Order Status</h3>
      </div>

      {loading ? (
        <div className="p-6 text-center">
          <div className="animate-pulse flex space-x-4">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      ) : error ? (
        <div className="p-6 bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 text-red-900 dark:text-red-200 rounded-xl">
          <p className="text-sm font-medium">{error}</p>
        </div>
      ) : orderData.completed === 0 && orderData.pending === 0 ? (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm font-medium">No orders available.</p>
        </div>
      ) : (
        <div className="p-6 bg-[#00ADB5] to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 rounded-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-md transition-transform hover:scale-105 flex-1">
              <p className={`text-lg font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>Completed Orders</p>
              <p className={`text-3xl font-bold ${isDark ? "text-blue-400" : "text-blue-500"}`}>
                {orderData.completed.toLocaleString()}
              </p>
            </div>
            <div className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-md transition-transform hover:scale-105 flex-1">
              <p className={`text-lg font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>Pending Orders</p>
              <p className={`text-3xl font-bold ${isDark ? "text-yellow-400" : "text-yellow-500"}`}>
                {orderData.pending.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}