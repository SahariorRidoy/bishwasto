"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useSelector } from "react-redux";
import axios from "axios";
import Cookies from "js-cookie";
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subWeeks } from "date-fns";

const CustomTooltip = ({ active, payload, label, isDark }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md">
        <p className="font-medium text-sm">{label}</p>
        <p className={`font-medium text-sm ${isDark ? "text-blue-400" : "text-[#00ADB5]"}`}>
          {`BDT ${payload[0].value.toLocaleString()}`}
        </p>
      </div>
    );
  }
  return null;
};

export default function SalesOverview() {
  const [selectedRange, setSelectedRange] = useState("today");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [salesData, setSalesData] = useState([]);
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

        // Create chart data from revenue, profit, and total_dues
        const chartData = [
          { name: "Revenue", value: parseFloat(response.data.revenue || 0) },
          { name: "Profit", value: parseFloat(response.data.profit || 0) },
          { name: "Total Dues", value: parseFloat(response.data.total_dues || 0) },
        ];

        setSalesData(chartData);
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
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-lg">
        Please log in to view sales overview.
      </div>
    );
  }

  if (!shopId && !loading) {
    return (
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg">
        Please select a shop to view sales overview.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Sales Overview</h3>
        <select
          value={selectedRange}
          onChange={(e) => setSelectedRange(e.target.value)}
          className="text-xs border cursor-pointer border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 dark:bg-gray-700"
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
        <div className="mb-4 flex space-x-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-xs border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 dark:bg-gray-700"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-xs border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 dark:bg-gray-700"
          />
        </div>
      )}

      {loading ? (
        <div className="p-4 text-center text-gray-600 dark:text-gray-400">Loading...</div>
      ) : error ? (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">{error}</div>
      ) : salesData.length === 0 ? (
        <div className="p-4 text-center text-gray-600 dark:text-gray-400">No data available for the selected range.</div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesData} margin={{ top: 10, right: 10, left: 20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `BDT ${value.toLocaleString()}`}
            />
            <Tooltip content={(props) => <CustomTooltip {...props} isDark={isDark} />} />
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              barSize={80}
              fill={isDark ? "#3B82F6" : "#00ADB5"}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}