"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog"
import { Button } from "../../../components/ui/button"
import { Label } from "../../../components/ui/label"
import { Input } from "../../../components/ui/input"
import { Loader2, AlertCircle } from "lucide-react"
import Swal from "sweetalert2"

export function AddAttendanceModal({
  isOpen,
  onClose,
  shopId,
  employees,
  onAttendanceAdded = () => {} // Provide default empty function
}) {
  const [formData, setFormData] = useState({
    employee: "",
    is_present: true,
    time_in: "09:00",
    time_out: "18:00"
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [attendanceStatus, setAttendanceStatus] = useState("present")

  // Update form data when status changes
  useEffect(() => {
    if (attendanceStatus === "absent") {
      setFormData(prev => ({
        ...prev,
        is_present: false,
        time_in: null,
        time_out: null
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        is_present: true,
        time_in: attendanceStatus === "late" ? prev.time_in : "09:00",
        time_out: "18:00"
      }))
    }
  }, [attendanceStatus])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    if (name === "status") {
      setAttendanceStatus(value)
    } else if (name === "employee") {
      setFormData({
        ...formData,
        employee: value
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const getAuthToken = () => {
    const accessToken = Cookies.get("accessToken")
    if (!accessToken) {
      throw new Error("Authentication token not found")
    }
    return accessToken
  }

  const checkExistingAttendance = async (employeeId) => {
    try {
      const accessToken = getAuthToken();
      const today = new Date().toISOString().split('T')[0]; // e.g., "2023-10-17"
  
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}employee/${shopId}/attendance/`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
  
      const attendances = response.data.data || response.data;
  
      
      const todayAttendances = attendances.filter((attendance) => {
        // Extract employee ID (adjust based on actual structure)
        const attendanceEmployeeId = String(attendance.employee?.id || attendance.employee);
        const checkEmployeeId = String(employeeId);
  
        // Extract date (assuming 'date' field from payload; adjust if different)
        const attendanceDate = attendance.date ? attendance.date.split('T')[0] : null;
  
        const isMatch = attendanceEmployeeId === checkEmployeeId && attendanceDate === today;
        console.log(
          `Checking: employee ${attendanceEmployeeId} vs ${checkEmployeeId}, ` +
          `date ${attendanceDate} vs ${today} -> ${isMatch ? 'MATCH' : 'NO MATCH'}`
        );
        return isMatch;
      });
      return todayAttendances.length > 0;
    } catch (err) {
      throw err; // Let handleSubmit handle the error
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
  
    try {
      if (!formData.employee) {
        setError('Please select an employee');
        setIsSubmitting(false);
        return;
      }
  
      const accessToken = getAuthToken();
      const hasExistingAttendance = await checkExistingAttendance(formData.employee);
  
      if (hasExistingAttendance) {
        Swal.fire({
          icon: 'error',
          title: 'Duplicate Entry',
          text: 'Attendance for this employee has already been recorded today.',
          confirmButtonColor: '#00ADB5',
          timer: 1000,
          timerProgressBar: true,
        }).then(() => {
          onClose(); // Close the modal after alert is dismissed
        });
        setIsSubmitting(false);
        return;
      }
      
      const today = new Date().toISOString().split('T')[0];
      const payload = {
        employee: formData.employee,
        is_present: formData.is_present,
        time_in: formData.is_present ? formData.time_in : null,
        time_out: formData.is_present ? formData.time_out : null,
        date: today,
      };
  
      console.log('Submitting attendance payload:', payload);
  
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}employee/${shopId}/attendance/create/`,
        payload,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
  
      if (response.status >= 200 && response.status < 300) {
        const attendanceData = response.data.data || response.data;
        
        // Only call if it's a function
        if (typeof onAttendanceAdded === 'function') {
          onAttendanceAdded(attendanceData);
        }
        
        resetForm();
        
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Attendance has been recorded successfully.',
          confirmButtonColor: '#00ADB5',
          timer: 1000,
          timerProgressBar: true,
        });
        
        onClose();  
      }
    } catch (err) {
      console.error('Error adding attendance:', err);
      let errorMessage = 'Failed to add attendance. Please try again.';
      if (
        err.response?.data?.message?.includes('duplicate') ||
        err.response?.data?.message?.includes('already exists')
      ) {
        errorMessage = 'Attendance for this employee has already been recorded today.';
        Swal.fire({
          icon: 'error',
          title: 'Duplicate Entry',
          text: errorMessage,
          confirmButtonColor: '#00ADB5',
        });

      } else {
        errorMessage = err.response?.data?.message || errorMessage;
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      employee: "",
      is_present: true,
      time_in: "09:00",
      time_out: "18:00"
    })
    setAttendanceStatus("present")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Mark Attendance</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm flex items-center">
              <AlertCircle className="mr-2 h-4 w-4" />
              {error}
            </div>
          )}
          
          {/* Employee Selection */}
          <div className="space-y-2">
            <Label htmlFor="employee">Employee</Label>
            <select
              id="employee"
              name="employee"
              value={formData.employee}
              onChange={handleInputChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-sm"
              required
            >
              <option value="">Select Employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.first_name} {employee.last_name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Check In */}
          <div className="space-y-2">
            <Label htmlFor="time_in">Check In</Label>
            <Input
              id="time_in"
              name="time_in"
              type="time"
              value={formData.time_in || ""}
              onChange={handleInputChange}
              disabled={!formData.is_present}
              required={formData.is_present}
            />
          </div>
          
          {/* Check Out */}
          <div className="space-y-2">
            <Label htmlFor="time_out">Check Out</Label>
            <Input
              id="time_out"
              name="time_out"
              type="time"
              value={formData.time_out || ""}
              onChange={handleInputChange}
              disabled={!formData.is_present}
              required={formData.is_present}
            />
          </div>
          
          <DialogFooter className="mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-[#00ADB5] hover:bg-[#00ADB5]/90 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Attendance"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}