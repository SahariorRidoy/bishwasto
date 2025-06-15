"use client"

import { useState } from "react"
import { Card } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Select } from "../../components/ui/select"
import { Calendar, Search, Filter, Clock, Check, X } from "lucide-react"
import { AddLeaveModal } from "../../components/employees/modals/add-leave-modal"
import PageTabs from "./page-tabs"

export default function Leave({ shopId = "1" }) {
  const [isAddLeaveOpen, setIsAddLeaveOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1)

  // Sample employees - would be fetched from API
  const employees = [
    {
      id: 1,
      first_name: "Saharior",
      last_name: "Ridoy",
      department_name: "Management",
    },
    {
      id: 2,
      first_name: "Adnan",
      last_name: "Nahid",
      department_name: "Sales",
    },
    {
      id: 3,
      first_name: "Tushar",
      last_name: "Ahmed",
      department_name: "Inventory",
    },
    {
      id: 4,
      first_name: "Ashish",
      last_name: "Paul",
      department_name: "Sales",
    },
    {
      id: 5,
      first_name: "Maliha",
      last_name: "Khan",
      department_name: "Customer Service",
    },
  ]

  // Sample leave data - would be fetched from API
  const [leaveRecords, setLeaveRecords] = useState([
    {
      id: 1,
      employee_id: 1,
      employee_name: "Saharior Ridoy",
      start_date: "2025-05-10",
      end_date: "2025-05-12",
      reason: "Family event",
      status: "approved",
      type: "casual",
    },
    {
      id: 2,
      employee_id: 3,
      employee_name: "Tushar Ahmed",
      start_date: "2025-05-15",
      end_date: "2025-05-20",
      reason: "Medical leave",
      status: "pending",
      type: "medical",
    },
    {
      id: 3,
      employee_id: 5,
      employee_name: "Maliha Khan",
      start_date: "2025-05-25",
      end_date: "2025-05-26",
      reason: "Personal work",
      status: "rejected",
      type: "casual",
    },
  ])

  // Filter leave records based on search, month and status
  const filteredRecords = leaveRecords.filter((record) => {
    const matchesSearch = record.employee_name.toLowerCase().includes(searchTerm.toLowerCase())

    const startDate = new Date(record.start_date)
    const startMonth = startDate.getMonth() + 1
    const matchesMonth = filterMonth === 0 || startMonth === filterMonth

    const matchesStatus = filterStatus === "all" || record.status === filterStatus

    return matchesSearch && matchesMonth && matchesStatus
  })

  const handleAddLeave = (newRecord) => {
    setLeaveRecords([
      ...leaveRecords,
      {
        ...newRecord,
        id: leaveRecords.length + 1,
        employee_name:
          employees.find((e) => e.id === newRecord.employee_id)?.first_name +
          " " +
          employees.find((e) => e.id === newRecord.employee_id)?.last_name,
      },
    ])
  }

  const handleUpdateLeaveStatus = (leaveId, newStatus) => {
    setLeaveRecords(leaveRecords.map((record) => (record.id === leaveId ? { ...record, status: newStatus } : record)))
  }

  return (
    <div className="space-y-6">
      {/* Page tabs navigation */}
      <PageTabs />

      {/* Header with action buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Management</h1>
        <Button
          className="bg-[#00ADB5] hover:bg-[#00ADB5]/90 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
          onClick={() => setIsAddLeaveOpen(true)}
        >
          <Clock className="h-4 w-4 mr-2" />
          Request Leave
        </Button>
      </div>

      {/* Filters and search */}
      <Card className="bg-white dark:bg-gray-800 shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search employees..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Calendar size={18} className="text-gray-400" />
            <Select
              value={filterMonth}
              onChange={(e) => setFilterMonth(Number.parseInt(e.target.value))}
              className="w-full"
            >
              <option value="0">All Months</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-gray-400" />
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Leave records */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{record.employee_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {record.start_date} to {record.end_date}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {calculateDays(record.start_date, record.end_date)} days
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white capitalize">{record.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{record.reason}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.status === "approved"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : record.status === "pending"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {record.status === "pending" && (
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateLeaveStatus(record.id, "approved")}
                            className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateLeaveStatus(record.id, "rejected")}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No leave records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddLeaveModal
        isOpen={isAddLeaveOpen}
        onClose={() => setIsAddLeaveOpen(false)}
        shopId={shopId}
        employees={employees}
        onLeaveAdded={handleAddLeave}
      />
    </div>
  )
}

// Helper function to calculate days between two dates
function calculateDays(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  return diffDays
}
