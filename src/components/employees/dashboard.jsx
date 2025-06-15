"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { Card } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { UserPlus, Calendar, Loader2, Store } from "lucide-react"
import { AddEmployeeModal } from "./modals/add-employee-modal"
import { AddAttendanceModal } from "./modals/add-attendance-modal"
import Link from "next/link"
import PageTabs from "../../components/employees/page-tabs"
import { useSelector } from "react-redux"

export default function Dashboard() {
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false)
  const [isAddAttendanceOpen, setIsAddAttendanceOpen] = useState(false)
  const [employees, setEmployees] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [departments, setDepartments] = useState([])
  const [refreshTrigger, setRefreshTrigger] = useState(0) // For triggering refreshes

  // Get selected shop from Redux store
  const selectedShop = useSelector(state => state.shop?.selectedShop)
  
  // Use shop ID from props or from Redux if available
  const effectiveShopId = selectedShop?.id?.toString()

  // Get authentication token from cookies
  const getAuthToken = () => {
    const accessToken = Cookies.get("accessToken")
    if (!accessToken) {
      throw new Error("Authentication token not found")
    }
    return accessToken
  }

  // Fetch employees data from API
  const fetchEmployees = async () => {
    // Only fetch if we have a valid shop ID
    if (!effectiveShopId) {
      setError("No shop selected. Please select a shop from the shops page.")
      setIsLoading(false)
      return
    }
    
    setIsLoading(true)
    try {
      const accessToken = getAuthToken()
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}employee/${effectiveShopId}/employees/`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )
      console.log(response.data);
      
      if (response.data && response.data.data) {
        const formattedEmployees = response.data.data.map(item => {
          const employeeData = item.data || item;
          return {
            id: employeeData.id,
            first_name: employeeData.first_name || "",
            last_name: employeeData.last_name || "",
            department_id: employeeData.department_id,
            department_name: employeeData.department?.name || "Unknown",
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
  };

  // Call fetchEmployees when component mounts or when refreshTrigger changes
  useEffect(() => {
    fetchEmployees();
  }, [effectiveShopId, refreshTrigger]);

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

  // Handle new employee added
  const handleEmployeeAdded = (newEmployee) => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Calculate employee stats
  const employeeStats = {
    total: employees.length,
    active: employees.filter(emp => emp.is_active).length,
    onLeave: employees.filter(emp => !emp.is_active).length,
  }

  // Mock attendance stats - would be fetched from API in real implementation
  const attendanceStats = {
    present: Math.floor(employeeStats.active * 0.8),
    absent: Math.floor(employeeStats.active * 0.1),
    late: Math.floor(employeeStats.active * 0.1),
    percentage: employeeStats.total > 0 ? 
      `${Math.round((Math.floor(employeeStats.active * 0.8) / employeeStats.total) * 100)}%` : 
      "0%",
  }

  // Mock attendance data - would be fetched from API
  const todayAttendance = employees.slice(0, 4).map(emp => ({
    id: emp.id,
    employee_name: `${emp.first_name} ${emp.last_name}`,
    status: Math.random() > 0.2 ? (Math.random() > 0.3 ? "present" : "late") : "absent",
    time: Math.random() > 0.2 ? 
      `${Math.floor(Math.random() * 3) + 9}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} AM` : 
      "-"
  }));

  return (
    <div className=" mx-auto space-y-6">
      {/* Page tabs navigation */}
      <PageTabs />

      {/* Header with action buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 border-[#00ADB5] text-[#00ADB5] hover:bg-[#00ADB5] hover:text-white dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500 dark:hover:text-white"
            onClick={() => setIsAddEmployeeOpen(true)}
            disabled={!selectedShop}
          >
            <UserPlus className="h-4 w-4" />
            Add Employee
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 border-[#00ADB5] text-[#00ADB5] hover:bg-[#00ADB5] hover:text-white dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500 dark:hover:text-white"
            onClick={() => setIsAddAttendanceOpen(true)}
            disabled={!selectedShop}
          >
            <Calendar className="h-4 w-4" />
            Mark Attendance
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Employees"
          icon={<UserPlus className="h-8 w-8 text-[#00ADB5] dark:text-blue-500" />}
          stats={[
            { label: "Total", value: employeeStats.total },
            { label: "Active", value: employeeStats.active },
            { label: "On Leave", value: employeeStats.onLeave },
          ]}
          isLoading={isLoading}
        />
        <StatCard
          title="Today's Attendance"
          icon={<Calendar className="h-8 w-8 text-[#00ADB5] dark:text-blue-500" />}
          stats={[
            { label: "Present", value: attendanceStats.present },
            { label: "Absent", value: attendanceStats.absent },
            { label: "Late", value: attendanceStats.late },
            { label: "Attendance", value: attendanceStats.percentage },
          ]}
          isLoading={isLoading}
        />
      </div>

      {/* Recent Employees */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Employees</h2>
        {isLoading ? (
          <div className="flex justify-center p-6">
            <Loader2 className="h-10 w-10 animate-spin text-gray-500 dark:text-gray-400" />
          </div>
        ) : error ? (
          <Card className="bg-white dark:bg-gray-800 p-4 text-center text-red-500">
            {error}
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {employees.slice(0, 4).map((employee, idx) => (
              <EmployeeCard key={employee.id || idx} employee={employee} />
            ))}
          </div>
        )}
      </div>
      {/* Modals */}
      <AddEmployeeModal 
        isOpen={isAddEmployeeOpen} 
        onClose={() => setIsAddEmployeeOpen(false)} 
        onEmployeeAdded={handleEmployeeAdded}
      />
      <AddAttendanceModal
        isOpen={isAddAttendanceOpen}
        onClose={() => setIsAddAttendanceOpen(false)}
        shopId={effectiveShopId}
        employees={employees}
      />
    </div>
  )
}

function StatCard({ title, icon, stats, isLoading }) {
  return (
    <Card className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          {icon}
        </div>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500 dark:text-gray-400" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

function EmployeeCard({ employee }) {
  // Fix: Handle potentially undefined first_name and last_name
  const firstName = employee?.first_name || "";
  const lastName = employee?.last_name || "";
  
  // Get first characters safely
  const firstInitial = firstName.length > 0 ? firstName.charAt(0) : "";
  const lastInitial = lastName.length > 0 ? lastName.charAt(0) : "";
  
  // If both are empty, use a default
  const initials = (firstInitial + lastInitial) || "EE";

  return (
    <Card className="bg-white dark:bg-gray-800 shadow hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-[#00ADB5] dark:bg-blue-500 flex items-center justify-center text-white text-lg font-semibold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {firstName} {lastName}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate"> Dept: {" "}
              {employee?.department_name || "Unknown Department"}
            </p>
            <div className="flex items-center mt-1">
              <span
                className={`h-2 w-2 rounded-full ${employee?.is_active ? "bg-green-500" : "bg-red-500"} mr-1`}
              ></span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {employee?.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}