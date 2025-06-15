"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useSelector } from "react-redux";
import axios from "axios";
import Cookies from "js-cookie";

const CustomTooltip = ({ active, payload, isDark }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md">
        <p className="font-medium text-sm">{payload[0].name}</p>
        <p className="font-medium text-sm" style={{ color: payload[0].color }}>
          {`Orders: ${payload[0].value}`}
        </p>
      </div>
    );
  }
  return null;
};

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function OrderStatus() {
  const [orderData, setOrderData] = useState([
    { name: "Completed", value: 0 },
    { name: "Pending", value: 0 },
  ]);
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

        // Fetch all orders for the shop
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}order/list/${shopId}/`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        console.log("API Response:", response.data); // Debug API response

        const orders = Array.isArray(response.data) ? response.data : [];
        const completedCount = orders.filter(order => parseFloat(order.due) === 0).length;
        const pendingCount = orders.length - completedCount;

        console.log("Order Counts:", { completedCount, pendingCount }); // Debug counts

        const chartData = [
          { name: "Completed", value: completedCount },
          { name: "Pending", value: pendingCount },
        ];

        setOrderData(chartData);
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

  const COLORS = isDark
    ? ["#3B82F6", "#71717a"]
    : ["#00ADB5", "#71717a"];

  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-lg">
        Please log in to view order status.
      </div>
    );
  }

  if (!shopId && !loading) {
    return (
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg">
        Please select a shop to view order status.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Order Status</h3>
      </div>

      {loading ? (
        <div className="p-4 text-center text-gray-600 dark:text-gray-400">
          <svg className="animate-spin h-5 w-5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">{error}</div>
      ) : orderData[0].value === 0 && orderData[1].value === 0 ? (
        <div className="p-4 text-center text-gray-600 dark:text-gray-400">No orders available.</div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={orderData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              labelLine={false}
              label={renderCustomizedLabel}
              fill="#8884d8"
            >
              {orderData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={(props) => <CustomTooltip {...props} isDark={isDark} />} />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              formatter={(value) => <span className="text-sm font-medium">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}