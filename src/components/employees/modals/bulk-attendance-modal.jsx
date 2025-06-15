"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog"
import { Button } from "../../../components/ui/button"
import { Label } from "../../../components/ui/label"
import { Input } from "../../../components/ui/input"
import { Loader2, AlertTriangle, Info } from "lucide-react"
import Swal from "sweetalert2"

export function BulkAttendanceModal({
  isOpen,
  onClose,
  shopId,
  employees,
  selectedDate,
  onBulkAttendanceAdded
}) {
  const [date, setDate] = useState(selectedDate)
  const [defaultTime, setDefaultTime] = useState({
    time_in: "09:00",
    time_out: "18:00"
  })
  const [attendanceData, setAttendanceData] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [selectAll, setSelectAll] = useState(true)
  const [existingAttendances, setExistingAttendances] = useState([])
  const [dateSpecificAttendances, setDateSpecificAttendances] = useState([])

  useEffect(() => {
    if (employees.length > 0 && isOpen) {
      fetchExistingAttendance(date || selectedDate)
    }
  }, [employees, isOpen, selectedDate, date])

  useEffect(() => {
    if (employees.length > 0) {
      // Filter existing attendances for the specific date
      const filteredAttendances = existingAttendances.filter(attendance => {
        const attendanceDate = attendance.date && attendance.date.split('T')[0];
        return attendanceDate === date;
      });
      
      setDateSpecificAttendances(filteredAttendances);
      
      // Create initial data based on employees, excluding those who already have attendance records
      const initialData = employees.map(employee => {
        // Check if this employee has an existing attendance record for this date
        const hasExisting = filteredAttendances.some(
          attendance => {
            // First try to match by employee.id with attendance.employee.id if it's an object
            if (attendance.employee && typeof attendance.employee === 'object') {
              return String(attendance.employee.id) === String(employee.id);
            } 
            // Then try to match by employee.id with attendance.employee if it's a primitive
            else {
              return String(attendance.employee) === String(employee.id);
            }
          }
        )
        return {
          employee: employee.id,
          date: date,
          is_present: true,
          time_in: defaultTime.time_in,
          time_out: defaultTime.time_out,
          isSelected: !hasExisting, // Auto-deselect employees with existing records
          hasExisting: hasExisting
        }
      })
      setAttendanceData(initialData)
      
      // Update selectAll state based on whether any eligible employees are available
      const eligibleEmployees = initialData.filter(item => !item.hasExisting);
      setSelectAll(eligibleEmployees.length > 0 && eligibleEmployees.every(item => item.isSelected));
    }
  }, [employees, date, defaultTime, existingAttendances])

  const fetchExistingAttendance = async (selectedDate) => {
    try {
      const accessToken = getAuthToken()
      
      console.log(`Fetching attendance for date: ${selectedDate}`)
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}employee/${shopId}/attendance/`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { date: selectedDate }
        }
      )
      
      let attendances = []
      
      // Handle different API response formats
      if (response.data?.data) {
        attendances = response.data.data
      } else if (Array.isArray(response.data)) {
        attendances = response.data
      }
      
      console.log('Fetched attendances:', attendances)
      
      setExistingAttendances(attendances)
    } catch (err) {
      console.error("Error fetching existing attendance:", err)
    }
  }

  const handleDateChange = (e) => {
    const newDate = e.target.value
    setDate(newDate)
    fetchExistingAttendance(newDate)
  }

  const handleDefaultTimeChange = (e) => {
    const { name, value } = e.target
    setDefaultTime(prev => ({ ...prev, [name]: value }))
    
    // Only update time for employees without existing records
    setAttendanceData(prev =>
      prev.map(record => {
        if (record.hasExisting) return record;
        return { ...record, [name]: value };
      })
    )
  }

  const handleEmployeeStatusChange = (index, value) => {
    const updated = [...attendanceData]
    // Don't modify employees with existing records
    if (updated[index].hasExisting) return;
    
    if (value === "absent") {
      updated[index] = {
        ...updated[index],
        is_present: false,
        time_in: "",
        time_out: ""
      }
    } else {
      updated[index] = {
        ...updated[index],
        is_present: true,
        status: value,
        time_in: updated[index].time_in || defaultTime.time_in,
        time_out: updated[index].time_out || defaultTime.time_out
      }
    }
    setAttendanceData(updated)
  }

  const handleEmployeeTimeChange = (index, field, value) => {
    // Don't modify employees with existing records
    const updated = [...attendanceData]
    if (updated[index].hasExisting) return;
    
    updated[index][field] = value
    setAttendanceData(updated)
  }

  const toggleSelectEmployee = (index) => {
    const updated = [...attendanceData]
    // Don't allow selection of employees with existing records
    if (updated[index].hasExisting) return;
    
    updated[index].isSelected = !updated[index].isSelected
    setAttendanceData(updated)
    
    // Update selectAll based on eligible employees only
    const eligibleEmployees = updated.filter(item => !item.hasExisting);
    setSelectAll(eligibleEmployees.length > 0 && eligibleEmployees.every(item => item.isSelected));
  }

  const toggleSelectAll = () => {
    const newVal = !selectAll
    setSelectAll(newVal)
    
    // Only toggle selection for employees without existing records
    setAttendanceData(prev =>
      prev.map(record => {
        if (record.hasExisting) return record;
        return { ...record, isSelected: newVal };
      })
    )
  }

  const getAuthToken = () => {
    const token = Cookies.get("accessToken")
    if (!token) throw new Error("Authentication token not found")
    return token
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const selectedRecords = attendanceData.filter(r => r.isSelected && !r.hasExisting)
    
    if (selectedRecords.length === 0) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Please select at least one employee without existing attendance',
        icon: 'error',
        confirmButtonColor: '#00ADB5'
      })
      return
    }
    
    await submitAttendance()
  }

  const submitAttendance = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Only submit records for employees without existing attendance
      const selectedRecords = attendanceData
        .filter(r => r.isSelected && !r.hasExisting)
        .map(r => ({
          employee: r.employee,
          date: r.date,
          is_present: r.is_present,
          time_in: r.is_present ? r.time_in : null,
          time_out: r.is_present ? r.time_out : null
        }))

      if (selectedRecords.length === 0) {
        throw new Error("Please select at least one employee without existing attendance")
      }

      const accessToken = getAuthToken()
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}employee/${shopId}/attendance/bulk/`,
        { attendances: selectedRecords },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )

      if (response.data?.attendances) {
        Swal.fire({
          title: 'Success!',
          text: `Successfully processed attendance records for ${response.data.attendances.length} employees.`,
          icon: 'success',
          confirmButtonColor: '#00ADB5'
        })
        onBulkAttendanceAdded(response.data.attendances)
        onClose()
      } else {
        setError("Failed to process attendance records.")
      }
    } catch (err) {
      console.error("Submission error:", err)
      const message = err.response?.data?.message || err.message
      Swal.fire({
        title: 'Error',
        text: message || "Failed to process attendance records.",
        icon: 'error',
        confirmButtonColor: '#00ADB5'
      })
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusDisplay = (r) => (!r.is_present ? "absent" : r.status === "late" ? "late" : "present")

  // Count employees available for selection (no existing records)
  const availableEmployeesCount = attendanceData.filter(r => !r.hasExisting).length
  const selectedEmployeesCount = attendanceData.filter(r => r.isSelected && !r.hasExisting).length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Bulk Attendance</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={handleDateChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_time_in">Default Time In</Label>
              <Input id="default_time_in" name="time_in" type="time" value={defaultTime.time_in} onChange={handleDefaultTimeChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_time_out">Default Time Out</Label>
              <Input id="default_time_out" name="time_out" type="time" value={defaultTime.time_out} onChange={handleDefaultTimeChange} />
            </div>
          </div>

          {dateSpecificAttendances.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 p-3 rounded-md text-sm flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 mt-0.5" />
              <span>
                {dateSpecificAttendances.length} attendance record(s) already exist for this date.
              </span>
            </div>
          )}
          
          {availableEmployeesCount === 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-3 rounded-md text-sm flex items-start gap-2">
              <Info className="h-5 w-5 mt-0.5" />
              <span>
                All employees already have attendance records for this date.
              </span>
            </div>
          )}

          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 text-[#00ADB5] mr-2"
                        disabled={availableEmployeesCount === 0}
                      />
                      Employee
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Time In</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Time Out</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {attendanceData.length ? (
                  attendanceData.map((record, index) => {
                    const employee = employees.find(e => e.id === record.employee)
                    const statusValue = getStatusDisplay(record)
                    const hasExisting = record.hasExisting

                    return (
                      <tr key={index} className={`
                        ${!record.isSelected ? "bg-gray-50 dark:bg-gray-900/20" : ""}
                        ${hasExisting ? "bg-amber-50 dark:bg-amber-900/10 opacity-70" : ""}
                      `}>
                        <td className="px-4 py-2">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={record.isSelected}
                              onChange={() => toggleSelectEmployee(index)}
                              disabled={hasExisting}
                              className="h-4 w-4 text-[#00ADB5] mr-2"
                            />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {employee ? `${employee.first_name} ${employee.last_name}` : "Unknown"}
                              {hasExisting && (
                                <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                  Already Recorded
                                </span>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <select
                            value={statusValue}
                            onChange={e => handleEmployeeStatusChange(index, e.target.value)}
                            disabled={!record.isSelected || hasExisting}
                            className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-700"
                          >
                            <option value="present">Present</option>
                            <option value="late">Late</option>
                            <option value="absent">Absent</option>
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            type="time"
                            value={record.time_in || ""}
                            onChange={e => handleEmployeeTimeChange(index, "time_in", e.target.value)}
                            disabled={!record.isSelected || !record.is_present || hasExisting}
                            className="h-8 text-sm"
                            required={record.isSelected && record.is_present && !hasExisting}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            type="time"
                            value={record.time_out || ""}
                            onChange={e => handleEmployeeTimeChange(index, "time_out", e.target.value)}
                            disabled={!record.isSelected || !record.is_present || hasExisting}
                            className="h-8 text-sm"
                            required={record.isSelected && record.is_present && !hasExisting}
                          />
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-2 text-center text-sm text-gray-500 dark:text-gray-400">
                      No employees available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#00ADB5] hover:bg-[#00ADB5]/90 text-white"
              disabled={isSubmitting || selectedEmployeesCount === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Attendance...
                </>
              ) : (
                `Save Attendance (${selectedEmployeesCount})`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}