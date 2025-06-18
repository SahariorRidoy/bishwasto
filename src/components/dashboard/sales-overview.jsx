"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Cookies from "js-cookie";
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subWeeks } from "date-fns";

export default function SalesOverview() {
  const [selectedRange, setSelectedRange] = useState("today");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [salesData, setSalesData] = useState({ revenue: 0, profit: 0, totalDues: 0 });
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

  // Calculate start and end dates based on selected range
  const calculateDates = () => {
    const today = new Date();
    let start, end;
    switch (selectedRange) {
      case "today":
        start = today;
        end = today;
        break;
      case "yesterday":
        start = subDays(today, 1);
        end = subDays(today, 1);
        break;
      case "thisWeek":
        start = startOfWeek(today, { weekStartsOn: 1 });
        end = endOfWeek(today, { weekStartsOn: 1 });
        break;
      case "lastWeek":
        start = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
        end = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
        break;
      case "thisMonth":
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      case "thisYear":
        start = startOfYear(today);
        end = endOfYear(today);
        break;
      case "custom":
        start = startDate ? parseISO(startDate) : today;
        end = endDate ? parseISO(endDate) : today;
        break;
      default:
        start = today;
        end = today;
    }
    return { start: format(start, "yyyy-MM-dd"), end: format(end, "yyyy-MM-dd") };
  };

  // Fetch sales data from API
  useEffect(() => {
    if (!isAuthenticated || !shopId) {
      setLoading(false);
      return;
    }

    const { start, end } = calculateDates();
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
          `${process.env.NEXT_PUBLIC_API_URL}reports/sales/${shopId}/?start_date=${start}&end_date=${end}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        setSalesData({
          revenue: parseFloat(response.data.revenue || 0),
          profit: parseFloat(response.data.profit || 0),
          totalDues: parseFloat(response.data.total_dues || 0),
        });
        setError(null);
      } catch (err) {
        console.error("Error fetching sales data:", err);
        if (err?.response?.status === 401) {
          setIsAuthenticated(false);
          setError("Authentication error. Please login again.");
        } else {
          setError("Failed to fetch sales data. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedRange, startDate, endDate, shopId, isAuthenticated]);

  // Render authentication or shop selection prompts
  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 text-yellow-900 dark:text-yellow-200 rounded-xl shadow-lg">
        <p className="text-sm font-medium">Please log in to view sales overview.</p>
      </div>
    );
  }

  if (!shopId && !loading) {
    return (
      <div className="p-6 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-900 dark:text-blue-200 rounded-xl shadow-lg">
        <p className="text-sm font-medium">Please select a shop to view sales overview.</p>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-2xl shadow-xl transition-all duration-300 ${isDark ? "bg-gray-900/80 backdrop-blur-sm" : "bg-white"}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className={`text-2xl font-bold ${isDark ? "text-white" : "text-[#00ADB5]"}`}>Sales Overview</h3>
        <select
          value={selectedRange}
          onChange={(e) => setSelectedRange(e.target.value)}
          className={`text-sm font-medium rounded-lg px-4 py-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isDark
              ? "bg-gray-800 text-gray-200 border-gray-700 hover:bg-teal-700 focus:ring-blue-500"
              : "bg-gray-100 text-gray-900 border-gray-300 hover:bg-teal-100 focus:ring-teal-400"
          }`}
        >
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="thisWeek">This Week</option>
          <option value="lastWeek">Last Week</option>
          <option value="thisMonth">This Month</option>
          <option value="thisYear">This Year</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {selectedRange === "custom" && (
        <div className="mb-6 flex gap-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={`text-sm rounded-lg px-4 py-2 w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isDark
                ? "bg-gray-800 text-gray-200 border-gray-700 focus:ring-blue-500"
                : "bg-gray-100 text-gray-900 border-gray-300 focus:ring-teal-400"
            }`}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={`text-sm rounded-lg px-4 py-2 w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isDark
                ? "bg-gray-800 text-gray-200 border-gray-700 focus:ring-blue-500"
                : "bg-gray-100 text-gray-900 border-gray-300 focus:ring-teal-400"
            }`}
          />
        </div>
      )}

      {loading ? (
        <div className="p-6 text-center">
          <div className="animate-pulse flex space-x-4">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
          </div>
        </div>
      ) : error ? (
        <div className="p-6 bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 text-red-900 dark:text-red-200 rounded-xl">
          <p className="text-sm font-medium">{error}</p>
        </div>
      ) : salesData.revenue === 0 && salesData.profit === 0 && salesData.totalDues === 0 ? (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm font-medium">No data available for the selected range.</p>
        </div>
      ) : (
        <div className="p-6 bg-[#00ADB5] dark:from-blue-900/20 dark:to-teal-900/20 rounded-xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-md transition-transform hover:scale-105 flex-1">
              <p className={`text- font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>Revenue</p>
              <p className={`text-3xl font-bold ${isDark ? "text-blue-400" : "text-blue-500"}`}>
                BDT {salesData.revenue.toLocaleString()}
              </p>
            </div>
            <div className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-md transition-transform hover:scale-105 flex-1">
              <p className={`text-lg font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>Profit</p>
              <p className={`text-3xl font-bold ${isDark ? "text-green-400" : "text-green-500"}`}>
                BDT {salesData.profit.toLocaleString()}
              </p>
            </div>
            <div className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-md transition-transform hover:scale-105 flex-1">
              <p className={`text-lg font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>Total Dues</p>
              <p className={`text-3xl font-bold ${isDark ? "text-red-400" : "text-red-500"}`}>
                BDT {salesData.totalDues.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}