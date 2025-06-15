"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { Card } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Calendar, Search, Filter, UserCheck, Loader2, Store } from "lucide-react"
import { AddAttendanceModal } from "./modals/add-attendance-modal"
import { BulkAttendanceModal } from "./modals/bulk-attendance-modal"
import PageTabs from "../../components/employees/page-tabs"
import { useSelector } from "react-redux"

export default function Attendance() {
  // Today's date formatted as YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0]
  
  const [isAddAttendanceOpen, setIsAddAttendanceOpen] = useState(false)
  const [isBulkAttendanceOpen, setIsBulkAttendanceOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(today) // Default to today
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [allAttendanceRecords, setAllAttendanceRecords] = useState([]) // All records from API
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

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

  // Fetch employees data from API
  useEffect(() => {
    // Only fetch if we have a valid shop ID
    if (!shopId) {
      setError("No shop selected. Please select a shop from the shops page.")
      setIsLoading(false)
      return
    }
    
    const fetchEmployees = async () => {
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
              is_active: employeeData.is_active
            };
          });
          setEmployees(formattedEmployees);
        }
      } catch (err) {
        console.error("Failed to fetch employees:", err);
        setError("Failed to load employees. Please try again later.");
      }
    };

    fetchEmployees();
  }, [shopId]);

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

  // Fetch all attendance records
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!shopId) {
        setError("No shop selected");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const accessToken = getAuthToken();
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}employee/${shopId}/attendance/`, 
          {
            headers: { Authorization: `Bearer ${accessToken}` }
          }
        );
        // Process data from API
        if (response.data && Array.isArray(response.data)) {
          const formattedRecords = response.data.map(record => {
            // Determine status based on presence and check-in time
            let status = "absent";
            if (record.is_present) {
              if (record.time_in) {
                // Check if check-in time is after 9 AM (late)
                const checkInTime = new Date(`${record.date}T${record.time_in}`);
                const nineAM = new Date(`${record.date}T09:00:00`);
                status = checkInTime > nineAM ? "late" : "present";
              } else {
                status = "present";
              }
            }
            
            return {
              id: record.id,
              employee_id: record.employee,
              date: record.date,
              status: status,
              check_in: record.time_in || null,
              check_out: record.time_out || null
            };
          });
          
          setAllAttendanceRecords(formattedRecords);
        } else {
          setAllAttendanceRecords([]);
        }
      } catch (err) {
        console.error("Error fetching attendance:", err);
        setError("Failed to load attendance data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAttendanceData();
  }, [shopId]);

  // Filter records for the selected date
  const attendanceRecords = allAttendanceRecords.filter(record => 
    record.date === selectedDate
  );

  // Filter attendance records based on search and status filters
  const filteredRecords = attendanceRecords.filter((record) => {
    const employee = employees.find(emp => emp.id === record.employee_id);
    
    // If employee not found, don't include in results
    if (!employee) return false;
    
    const employeeName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
    const matchesSearch = searchTerm === "" || employeeName.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || record.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const refreshAttendanceData = async () => {
    if (!shopId) return;
    
    setIsLoading(true);
    try {
      const accessToken = getAuthToken();
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}employee/${shopId}/attendance/`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      
      if (response.data && Array.isArray(response.data)) {
        const formattedRecords = response.data.map(record => {
          let status = "absent";
          if (record.is_present) {
            if (record.time_in) {
              const checkInTime = new Date(`${record.date}T${record.time_in}`);
              const nineAM = new Date(`${record.date}T09:00:00`);
              status = checkInTime > nineAM ? "late" : "present";
            } else {
              status = "present";
            }
          }
          
          return {
            id: record.id,
            employee_id: record.employee,
            date: record.date,
            status: status,
            check_in: record.time_in || null,
            check_out: record.time_out || null
          };
        });
        setAllAttendanceRecords(formattedRecords);
      } else {
        setAllAttendanceRecords([]);
      }
    } catch (err) {
      console.error("Failed to refresh attendance records:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAttendance = () => {
    refreshAttendanceData();
  };

  const handleBulkAttendance = () => {
    refreshAttendanceData();
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : "Unknown Employee";
  };

  // Check if we have any records for the selected date
  const hasRecordsForDate = allAttendanceRecords.some(record => record.date === selectedDate);

  return (
    <div className="space-y-6">
      {/* Selected Shop Information from Redux
      <Card className="bg-white dark:bg-gray-800 shadow p-5">
        <div className="flex items-center gap-4">
          <Store className="h-8 w-8 text-[#00ADB5] dark:text-blue-500" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {selectedShop ? `Selected Shop: ${selectedShop.name}` : 'No Shop Selected'}
            </h2>
            {selectedShop && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Category: {selectedShop.category_name} {selectedShop.is_active ? '(Active)' : '(Pending)'}
              </p>
            )}
          </div>
        </div>
      </Card> */}

      {/* Page tabs navigation */}
      <PageTabs />

      {/* Header with action buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {selectedDate === today ? "Today's Attendance" : `Attendance for ${selectedDate}`}
        </h1>
        <div className="flex flex-wrap gap-2">
          <Button
            className="bg-[#00ADB5] hover:bg-[#00ADB5]/90 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
            onClick={() => setIsAddAttendanceOpen(true)}
            disabled={!selectedShop}
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Mark Attendance
          </Button>
          <Button
            variant="outline"
            className="border-[#00ADB5] text-[#00ADB5] hover:bg-[#00ADB5] hover:text-white dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500 dark:hover:text-white"
            onClick={() => setIsBulkAttendanceOpen(true)}
            disabled={!selectedShop}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Bulk Attendance
          </Button>
        </div>
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

          {/* Date Picker */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-10 w-full"
            />
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
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Quick action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          onClick={() => setSelectedDate(today)}
          className="text-sm"
        >
          Today
        </Button>
        <Button 
          variant="outline" 
          onClick={() => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            setSelectedDate(yesterday.toISOString().split('T')[0]);
          }}
          className="text-sm"
        >
          Yesterday
        </Button>
        <Button 
          variant="outline" 
          onClick={() => {
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);
            setSelectedDate(lastWeek.toISOString().split('T')[0]);
          }}
          className="text-sm"
        >
          Last Week
        </Button>
      </div>

      {/* Attendance records */}
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
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Check In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Check Out
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading attendance records...</div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-red-500 dark:text-red-400">
                    {error}
                  </td>
                </tr>
              ) : !hasRecordsForDate ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No attendance records found for {selectedDate}
                  </td>
                </tr>
              ) : filteredRecords.length > 0 ? (
                filteredRecords.map((record) => {
                  const employee = employees.find(emp => emp.id === record.employee_id);
                  return (
                    <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-[#00ADB5] dark:bg-blue-500 flex items-center justify-center text-white">
                            {employee ? employee.first_name.charAt(0) + employee.last_name.charAt(0) : "??"}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {getEmployeeName(record.employee_id)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {employee ? employee.department_name : "Unknown"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{record.date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            record.status === "present"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : record.status === "late"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {record.status === "present" ? "Present" : 
                           record.status === "late" ? "Late" : "Absent"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {record.check_in || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {record.check_out || "-"}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No attendance records match your filters for {selectedDate}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddAttendanceModal
        isOpen={isAddAttendanceOpen}
        onClose={() => setIsAddAttendanceOpen(false)}
        shopId={shopId}
        employees={employees.filter(emp => emp.is_active)}
        selectedDate={selectedDate}
        onAttendanceAdded={handleAddAttendance}
      />

      <BulkAttendanceModal
        isOpen={isBulkAttendanceOpen}
        onClose={() => setIsBulkAttendanceOpen(false)}
        shopId={shopId}
        employees={employees.filter(emp => emp.is_active)}
        selectedDate={selectedDate}
        onBulkAttendanceAdded={handleBulkAttendance}
      />
    </div>
  )
}