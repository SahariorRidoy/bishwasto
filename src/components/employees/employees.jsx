"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { Card } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { UserPlus, Search, Filter, Edit, Trash, Loader2, Store } from "lucide-react"
import { AddEmployeeModal } from "./modals/add-employee-modal"
import { EditEmployeeModal } from "./modals/edit-employee-modal"
import PageTabs from "../../components/employees/page-tabs"
import { useSelector } from "react-redux"

export default function Employees() {
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false)
  const [isEditEmployeeOpen, setIsEditEmployeeOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Get selected shop from Redux store
  const selectedShop = useSelector(state => state.shop?.selectedShop)
  
  // Use shop ID from Redux
  const shopId = selectedShop?.id?.toString()

  // Get authentication token from cookies
  const getAuthToken = () => {
    const accessToken = Cookies.get("accessToken")
    if (!accessToken) {
      throw new Error("Authentication token not found")
    }
    return accessToken
  }

  // Create a reusable fetch function
  const fetchEmployees = useCallback(async () => {
    if (!shopId) {
      setError("No shop selected. Please select a shop from the shops page.")
      setIsLoading(false)
      return
    }
    
    setIsLoading(true)
    try {
      const accessToken = getAuthToken()
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}employee/${shopId}/employees/`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )
      
      if (response.data && response.data.data) {
        const formattedEmployees = response.data.data.map(item => {
          const employeeData = item.data || item;
          return {
            id: employeeData.id,
            first_name: employeeData.first_name,
            last_name: employeeData.last_name,
            department_id: employeeData.department_id,
            department_name: employeeData.department_name,
            number: employeeData.number,
            email: employeeData.email,
            gender: employeeData.gender,
            is_manager: employeeData.is_manager,
            is_active: employeeData.is_active,
            address: employeeData.address,
            date_of_birth: employeeData.date_of_birth,
          };
        });
        setEmployees(formattedEmployees);
      }
      setError(null);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      setError("Failed to load employees. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [shopId]);

  // Fetch employees data when component mounts or refreshTrigger changes
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees, refreshTrigger]);

  // Extract departments from employees data
  useEffect(() => {
    if (employees.length > 0) {
      const uniqueDepartments = [...new Set(employees.map(emp => emp.department_id))]
        .map(deptId => {
          const emp = employees.find(e => e.department_id === deptId);
          return {
            id: deptId,
            name: emp ? emp.department_name : `Department ${deptId}`
          };
        });
      setDepartments(uniqueDepartments);
    }
  }, [employees]);

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.number && employee.number.includes(searchTerm))

    const matchesDepartment = filterDepartment === "all" || 
      (employee.department_id && employee.department_id.toString() === filterDepartment)
      
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && employee.is_active) ||
      (filterStatus === "inactive" && !employee.is_active)

    return matchesSearch && matchesDepartment && matchesStatus
  })

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee)
    setIsEditEmployeeOpen(true)
  }

  // Handle employee update by triggering a refetch
  const handleEmployeeUpdated = (updatedEmployee) => {
    // Trigger a refetch by incrementing refreshTrigger
    setRefreshTrigger(prev => prev + 1)
    
    // Close the modal
    setIsEditEmployeeOpen(false)
    
    // Clear the selected employee
    setSelectedEmployee(null)
  }

  return (
    <div className="space-y-6">
      {/* Page tabs navigation */}
      <PageTabs />

      {/* Header with action buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employees</h1>
        <Button
          className="bg-[#00ADB5] hover:bg-[#00ADB5]/90 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
          onClick={() => setIsAddEmployeeOpen(true)}
          disabled={!selectedShop}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Filters and search */}
      <Card className="bg-white dark:bg-gray-800 shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search employees..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Department Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="pl-10 w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-sm"
            >
              <option value="all">All Departments</option>
              {departments.map((dept,idx) => (
                <option key={idx} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

        </div>
      </Card>


      {/* Employees list */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Contact
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
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading employees...</div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-red-500 dark:text-red-400">
                    {error}
                  </td>
                </tr>
              ) : filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee,idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-[#00ADB5] dark:bg-blue-500 flex items-center justify-center text-white">
                          {employee.first_name && employee.first_name.charAt(0)}
                          {employee.last_name && employee.last_name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {employee.first_name} {employee.last_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {employee.is_manager ? "Manager" : "Staff"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{employee.department_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{employee.number}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{employee.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          employee.is_active
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {employee.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditEmployee(employee)}
                          className="text-[#00ADB5] hover:text-[#00ADB5]/80 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddEmployeeModal
        isOpen={isAddEmployeeOpen}
        onClose={() => setIsAddEmployeeOpen(false)}
        shopId={shopId}
        departments={departments}
        onEmployeeAdded={(newEmployee) => {
          setEmployees([...employees, newEmployee])
        }}
      />

      {selectedEmployee && (
        <EditEmployeeModal
          isOpen={isEditEmployeeOpen}
          onClose={() => {
            setIsEditEmployeeOpen(false)
            setSelectedEmployee(null)
          }}
          shopId={shopId}
          employee={selectedEmployee}
          departments={departments}
          onEmployeeUpdated={handleEmployeeUpdated}
        />
      )}
    </div>
  )
}