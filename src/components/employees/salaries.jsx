"use client"

import { useState } from "react"
import { Card } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Select } from "../../components/ui/select"
import { Search, DollarSign, Calendar, Download } from "lucide-react"
import { AddSalaryModal } from "./modals/add-salary-modal"
import PageTabs from "./page-tabs"

export default function Salaries({ shopId = "1" }) {
  const [isAddSalaryOpen, setIsAddSalaryOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1)
  const [filterYear, setFilterYear] = useState(new Date().getFullYear())

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

  // Sample salary data - would be fetched from API
  const [salaryRecords, setSalaryRecords] = useState([
    {
      id: 1,
      employee_id: 1,
      employee_name: "Saharior Ridoy",
      month: 5,
      year: 2025,
      basic_salary: 25000,
      bonus: 5000,
      deduction: 0,
      total: 30000,
      status: "paid",
      payment_date: "2025-05-01",
    },
    {
      id: 2,
      employee_id: 2,
      employee_name: "Adnan Nahid",
      month: 5,
      year: 2025,
      basic_salary: 18000,
      bonus: 2000,
      deduction: 500,
      total: 19500,
      status: "paid",
      payment_date: "2025-05-01",
    },
    {
      id: 3,
      employee_id: 3,
      employee_name: "Tushar Ahmed",
      month: 5,
      year: 2025,
      basic_salary: 15000,
      bonus: 1000,
      deduction: 0,
      total: 16000,
      status: "pending",
      payment_date: null,
    },
    {
      id: 4,
      employee_id: 4,
      employee_name: "Ashish Paul",
      month: 5,
      year: 2025,
      basic_salary: 18000,
      bonus: 1500,
      deduction: 0,
      total: 19500,
      status: "pending",
      payment_date: null,
    },
    {
      id: 5,
      employee_id: 5,
      employee_name: "Maliha Khan",
      month: 5,
      year: 2025,
      basic_salary: 20000,
      bonus: 2000,
      deduction: 0,
      total: 22000,
      status: "paid",
      payment_date: "2025-05-01",
    },
    {
      id: 6,
      employee_id: 1,
      employee_name: "Saharior Ridoy",
      month: 4,
      year: 2025,
      basic_salary: 25000,
      bonus: 5000,
      deduction: 0,
      total: 30000,
      status: "paid",
      payment_date: "2025-04-01",
    },
    {
      id: 7,
      employee_id: 2,
      employee_name: "Adnan Nahid",
      month: 4,
      year: 2025,
      basic_salary: 18000,
      bonus: 2000,
      deduction: 0,
      total: 20000,
      status: "paid",
      payment_date: "2025-04-01",
    },
  ])

  // Filter salary records based on search, month and year
  const filteredRecords = salaryRecords.filter((record) => {
    const matchesSearch = record.employee_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMonth = record.month === filterMonth
    const matchesYear = record.year === filterYear

    return matchesSearch && matchesMonth && matchesYear
  })

  const handleAddSalary = (newRecord) => {
    setSalaryRecords([
      ...salaryRecords,
      {
        ...newRecord,
        id: salaryRecords.length + 1,
        employee_name:
          employees.find((e) => e.id === newRecord.employee_id)?.first_name +
          " " +
          employees.find((e) => e.id === newRecord.employee_id)?.last_name,
      },
    ])
  }

  const handleUpdateSalaryStatus = (salaryId, newStatus) => {
    setSalaryRecords(
      salaryRecords.map((record) =>
        record.id === salaryId
          ? {
              ...record,
              status: newStatus,
              payment_date: newStatus === "paid" ? new Date().toISOString().split("T")[0] : null,
            }
          : record,
      ),
    )
  }

  // Calculate total salary for the selected month and year
  const totalSalary = filteredRecords.reduce((sum, record) => sum + record.total, 0)
  const paidSalary = filteredRecords
    .filter((record) => record.status === "paid")
    .reduce((sum, record) => sum + record.total, 0)
  const pendingSalary = filteredRecords
    .filter((record) => record.status === "pending")
    .reduce((sum, record) => sum + record.total, 0)

  return (
    <div className="space-y-6">
      {/* Page tabs navigation */}
      <PageTabs />

      {/* Header with action buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Salary Management</h1>
        <div className="flex flex-wrap gap-2">
          <Button
            className="bg-[#00ADB5] hover:bg-[#00ADB5]/90 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
            onClick={() => setIsAddSalaryOpen(true)}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Add Salary
          </Button>
          <Button
            variant="outline"
            className="border-[#00ADB5] text-[#00ADB5] hover:bg-[#00ADB5] hover:text-white dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500 dark:hover:text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-gray-800 shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Salary</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">BDT {totalSalary.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-[#00ADB5] dark:text-blue-500" />
          </div>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Paid</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">BDT {paidSalary.toLocaleString()}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                BDT {pendingSalary.toLocaleString()}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </Card>
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
            <Calendar size={18} className="text-gray-400" />
            <Select
              value={filterYear}
              onChange={(e) => setFilterYear(Number.parseInt(e.target.value))}
              className="w-full"
            >
              <option value="2023">2023</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Salary records */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Basic Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Bonus
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Deduction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total
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
                        BDT {record.basic_salary.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">BDT {record.bonus.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        BDT {record.deduction.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        BDT {record.total.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.status === "paid"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {record.status === "pending" && (
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 text-white"
                          onClick={() => handleUpdateSalaryStatus(record.id, "paid")}
                        >
                          Pay Now
                        </Button>
                      )}
                      {record.status === "paid" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#00ADB5] text-[#00ADB5] hover:bg-[#00ADB5] hover:text-white dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500 dark:hover:text-white"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Receipt
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No salary records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddSalaryModal
        isOpen={isAddSalaryOpen}
        onClose={() => setIsAddSalaryOpen(false)}
        shopId={shopId}
        employees={employees}
        onSalaryAdded={handleAddSalary}
      />
    </div>
  )
}
