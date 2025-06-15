"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Search, Filter, Plus } from "lucide-react"
import Link from "next/link"
import CreateReturnModal from "@/components/returnProduct/CreateReturnModal"

export default function ProductReturnsPage() {
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState("All")

  // Mock data for demonstration
  const mockReturns = [
    { id: 1, product: 101, shop: 1, return_reason: "damaged", description: "Product arrived with broken parts", status: "pending", date: "2025-04-20", user: 1 },
    { id: 2, product: 205, shop: 2, return_reason: "wrong_item", description: "Received wrong color", status: "approved", date: "2025-04-18", user: 2 },
    { id: 3, product: 130, shop: 1, return_reason: "defective", description: "Not functioning as expected", status: "completed", date: "2025-04-15", user: 1 },
    { id: 4, product: 422, shop: 3, return_reason: "damaged", description: "Package damaged during shipping", status: "rejected", date: "2025-04-12", user: 3 },
    { id: 5, product: 155, shop: 1, return_reason: "no_longer_needed", description: "Changed my mind", status: "pending", date: "2025-04-10", user: 1 }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setReturns(mockReturns)
      setLoading(false)
    }, 800)
  }, [])

  const handleCreateReturn = (newReturnData) => {
    const newReturn = {
      id: returns.length + 1,
      ...newReturnData,
      status: "pending",
      date: new Date().toISOString().split('T')[0]
    }
    
    setReturns([newReturn, ...returns])
    setIsModalOpen(false)
  }

  const filteredReturns = returns.filter(item => {
    const matchesSearch = 
      item.product.toString().includes(searchTerm) || 
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterStatus === "All") return matchesSearch
    return matchesSearch && item.status === filterStatus.toLowerCase()
  })

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": 
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "approved": 
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "completed": 
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "rejected": 
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "received":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "in_transit":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
      default: 
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  const getReasonDisplay = (reason) => {
    const reasons = {
      "damaged": "Damaged",
      "defective": "Defective",
      "wrong_item": "Wrong Item",
      "no_longer_needed": "No Longer Needed"
    }
    return reasons[reason] || reason
  }

  return (
    <div className="p-2 sm:p-4 md:p-6 lg:p-8 w-full max-w-[calc(100vw-4rem)] md:max-w-[calc(100vw-16rem)] xl:max-w-[calc(100vw-20rem)] mx-auto transition-all duration-300">
      {/* Header with back button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 md:mb-8 gap-3">
        <div className="flex items-center gap-2">
          <Link href="/inventory/products" className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Product Returns</h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Manage product returns and refund requests</p>
          </div>
        </div>
        <div className="mt-3 sm:mt-0">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 bg-[#00ADB5] dark:bg-blue-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg hover:bg-[#02888f] dark:hover:bg-blue-600 transition-colors touch-manipulation"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>New Return</span>
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type="text"
            placeholder="Search by ID or description..."
            className="pl-9 sm:pl-10 pr-3 py-2 w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00ADB5] dark:focus:ring-blue-500 touch-manipulation"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 min-w-[120px] sm:min-w-[140px]">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          <select 
            className="py-2 px-3 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00ADB5] dark:focus:ring-blue-500 flex-1 touch-manipulation"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option>All</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Completed</option>
            <option>Rejected</option>
            <option>Received</option>
            <option>In_transit</option>
          </select>
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        {/* Mobile view (card-based layout) */}
        <div className="block md:hidden">
          {loading ? (
            <div className="p-4 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00ADB5] dark:border-blue-500"></div>
            </div>
          ) : filteredReturns.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              No return requests found
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredReturns.map((item) => (
                <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-sm font-medium">#{item.id}</span>
                      <h3 className="text-base font-medium">Product #{item.product}</h3>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                    <div className="text-gray-500 dark:text-gray-400">Shop:</div>
                    <div>Shop {item.shop}</div>
                    <div className="text-gray-500 dark:text-gray-400">Reason:</div>
                    <div>{getReasonDisplay(item.return_reason)}</div>
                    <div className="text-gray-500 dark:text-gray-400">Date:</div>
                    <div>{item.date}</div>
                  </div>
                  <div className="text-sm mt-2">
                    <span className="text-gray-500 dark:text-gray-400">Description: </span>
                    <span className="break-words">{item.description}</span>
                  </div>
                  <div className="flex justify-end mt-2">
                    <button className="text-sm text-[#00ADB5] dark:text-blue-400 hover:text-[#02888f] dark:hover:text-blue-300 touch-manipulation">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Tablet and above view (table layout) */}
        <div className="hidden md:block max-h-[60vh] overflow-y-auto">
          <table className="min-w-[640px] w-full">
            <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 z-10">
              <tr>
                <th className="px-3 py-2.5 md:px-4 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[80px]">
                  ID
                </th>
                <th className="px-3 py-2.5 md:px-4 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                  Product ID
                </th>
                <th className="px-3 py-2.5 md:px-4 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[80px]">
                  Shop
                </th>
                <th className="px-3 py-2.5 md:px-4 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                  Return Reason
                </th>
                <th className="px-3 py-2.5 md:px-4 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[200px] hidden xl:table-cell">
                  Description
                </th>
                <th className="px-3 py-2.5 md:px-4 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                  Status
                </th>
                <th className="px-3 py-2.5 md:px-4 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                  Date
                </th>
                <th className="px-3 py-2.5 md:px-4 md:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[80px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-3 py-4 md:px-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00ADB5] dark:border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-3 py-4 md:px-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No return requests found
                  </td>
                </tr>
              ) : (
                filteredReturns.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-3 py-2.5 md:px-4 md:py-3 whitespace-nowrap text-sm font-medium">
                      #{item.id}
                    </td>
                    <td className="px-3 py-2.5 md:px-4 md:py-3 whitespace-nowrap text-sm">
                      {item.product}
                    </td>
                    <td className="px-3 py-2.5 md:px-4 md:py-3 whitespace-nowrap text-sm">
                      Shop {item.shop}
                    </td>
                    <td className="px-3 py-2.5 md:px-4 md:py-3 text-sm">
                      {getReasonDisplay(item.return_reason)}
                    </td>
                    <td className="px-3 py-2.5 md:px-4 md:py-3 text-sm max-w-[200px] truncate hidden xl:table-cell">
                      {item.description}
                    </td>
                    <td className="px-3 py-2.5 md:px-4 md:py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 md:px-4 md:py-3 whitespace-nowrap text-sm">
                      {item.date}
                    </td>
                    <td className="px-3 py-2.5 md:px-4 md:py-3 whitespace-nowrap text-right text-sm">
                      <button className="text-[#00ADB5] dark:text-blue-400 hover:text-[#02888f] dark:hover:text-blue-300 touch-manipulation">
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for creating new return */}
      {isModalOpen && (
        <CreateReturnModal 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={handleCreateReturn}
        />
      )}
    </div>
  )
}