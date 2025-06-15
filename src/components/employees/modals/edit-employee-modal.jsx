"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { Dialog } from "../../../components/ui/dialog"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { X, Loader2 } from "lucide-react"
import Swal from "sweetalert2" // Import SweetAlert2

export function EditEmployeeModal({ isOpen, onClose, shopId, employee, onEmployeeUpdated }) {
  
  const [formData, setFormData] = useState({
    id: "",
    department_id: "",
    first_name: "",
    last_name: "",
    email: "",
    image: null,
    address: "",
    gender: "M",
    date_of_birth: "",
    is_manager: false,
    is_active: false,
  })
  const [departments, setDepartments] = useState([])
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false)

  // Initialize form data with employee prop
  useEffect(() => {
    if (employee) {
      setFormData({
        id: employee.id || "",
        department_id: employee.department_id?.toString() || "2",
        first_name: employee.first_name || "",
        last_name: employee.last_name || "",
        email: employee.email || "",
        image: null,
        address: employee.address || "",
        gender: employee.gender || "M",
        date_of_birth: employee.date_of_birth || "",
        is_manager: employee.is_manager || false,
        is_active: employee.is_active || false,
      })
    }
  }, [employee])

  // Fetch departments when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchDepartments = async () => {
        try {
          setIsLoadingDepartments(true)
          const accessToken = Cookies.get("accessToken")
          if (!accessToken) {
            throw new Error("No access token found")
          }
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}employee/departments/`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          )
          setDepartments(Array.isArray(response.data.data) ? response.data.data : [])
        } catch (err) {
          setError("Error fetching departments: " + (err.response?.data?.message || err.message))
        } finally {
          setIsLoadingDepartments(false)
        }
      }
      fetchDepartments()
    }
  }, [isOpen])

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
  
    try {
      const accessToken = Cookies.get("accessToken")
      if (!accessToken) {
        throw new Error("No access token found")
      }
      const payload = new FormData()
      payload.append("shop_id", shopId)
  
      const deptId = Number.parseInt(formData.department_id)
      if (isNaN(deptId) || !formData.department_id) {
        setError("Please select a valid department")
        setIsLoading(false)
        return
      }
      payload.append("department_id", deptId)
  
      if (formData.first_name) payload.append("first_name", formData.first_name)
      if (formData.last_name) payload.append("last_name", formData.last_name)
      if (formData.email) payload.append("email", formData.email)
      if (formData.image) payload.append("image", formData.image)
      if (formData.address) payload.append("address", formData.address)
      payload.append("gender", formData.gender)
      if (formData.date_of_birth) payload.append("date_of_birth", formData.date_of_birth)
      payload.append("is_manager", formData.is_manager ? "true" : "false")
      payload.append("is_active", formData.is_active ? "true" : "false")
  
      // Log payload for debugging
      for (let [key, value] of payload.entries()) {
        console.log(`${key}: ${value}`)
      }
  
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}employee/${shopId}/employees/${employee.id}/update/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
  
      let updatedEmployeeData = response.data?.data || response.data
      const departmentName = departments.find(
        (d) => d.id === deptId
      )?.name || "Unknown"
      const updatedEmployee = {
        ...updatedEmployeeData,
        id: employee.id,
        department_name: departmentName,
      }
      
      // Show success alert with SweetAlert2
      Swal.fire({
        title: 'Success!',
        text: 'Employee updated successfully',
        icon: 'success',
        confirmButtonColor: '#00ADB5',
        timer: 2000,
        timerProgressBar: true
      })
      
      onEmployeeUpdated(updatedEmployee)
      onClose()
    } catch (err) {
      console.error("Error updating employee:", err)
      if (err.response) {
        console.log("Server response:", err.response.data)
        setError("Error updating employee: " + (err.response.data.message || JSON.stringify(err.response.data)))
        
        // Show error alert with SweetAlert2
        Swal.fire({
          title: 'Error!',
          text: 'Failed to update employee: ' + (err.response.data.message || 'Unknown error'),
          icon: 'error',
          confirmButtonColor: '#00ADB5'
        })
      } else {
        setError("Error updating employee: " + err.message)
        
        // Show error alert with SweetAlert2
        Swal.fire({
          title: 'Error!',
          text: 'Failed to update employee: ' + err.message,
          icon: 'error',
          confirmButtonColor: '#00ADB5'
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-auto">
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Employee</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  maxLength={50}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  maxLength={50}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department_id">Department</Label>
              {isLoadingDepartments ? (
                <p className="text-sm text-gray-500">Loading departments...</p>
              ) : departments.length === 0 ? (
                <p className="text-sm text-red-500">No departments available</p>
              ) : (
                <select
                  id="department_id"
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  required
                  disabled={isLoading || isLoadingDepartments}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00ADB5] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  style={{ appearance: "menulist" }}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                maxLength={254}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                maxLength={100}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00ADB5] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  style={{ appearance: "menulist" }}
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="is_manager"
                name="is_manager"
                type="checkbox"
                checked={formData.is_manager}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-[#00ADB5] focus:ring-[#00ADB5] dark:border-gray-600 dark:text-blue-500 dark:focus:ring-blue-500"
              />
              <Label htmlFor="is_manager" className="text-sm">
                Is Manager
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="is_active"
                name="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-[#00ADB5] focus:ring-[#00ADB5] dark:border-gray-600 dark:text-blue-500 dark:focus:ring-blue-500"
              />
              <Label htmlFor="is_active" className="text-sm">
                Is Active
              </Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#00ADB5] hover:bg-[#00ADB5]/90 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Employee"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  )
}