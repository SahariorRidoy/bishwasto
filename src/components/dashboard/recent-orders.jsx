"use client"
import { cn } from "@/lib/utils"

const recentOrders = [
  { id: "ORD001", phone: "01712345678", amount: "1,200", status: "Completed", date: "2023-04-15" },
  { id: "ORD002", phone: "01712345678", amount: "950", status: "Processing", date: "2023-04-15" },
  { id: "ORD003", phone: "01712345678", amount: "2,300", status: "Completed", date: "2023-04-14" },
  { id: "ORD004", phone: "01712345678", amount: "1,750", status: "Processing", date: "2023-04-14" },
  { id: "ORD005", phone: "01712345678", amount: "3,200", status: "Completed", date: "2023-04-13" },
]

const getStatusColor = (status) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "Pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    case "Processing":
      return "bg-teal-100 text-teal-800 dark:bg-blue-900 dark:text-blue-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
  }
}

export default function RecentOrders() {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
        <h3 className="text-base font-semibold">Recent Orders</h3>
        <button className="text-xs text-[#00ADB5] dark:text-blue-500 font-medium hover:underline">
          View All
        </button>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                Date
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {recentOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">{order.id}</td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                  {order.phone}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                  {order.date}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                  BDT {order.amount}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className={cn(
                    "px-2 py-0.5 text-[10px] font-medium rounded-full",
                    getStatusColor(order.status)
                  )}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}