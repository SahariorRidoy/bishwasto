"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { X, Loader2 } from "lucide-react"
import { toast } from "react-hot-toast"
import { useSelector } from "react-redux"

export function AddEmployeeModal({ isOpen, onClose, onEmployeeAdded = () => { } }) {
  // Use shop ID from Redux
  const selectedShop = useSelector(state => state.shop?.selectedShop)
  const shopId = selectedShop?.id?.toString()
  
  const [formData, setFormData] = useState({
    department_id: "",
    number: "",
    first_name: "",
    last_name: "",
    email: "",
    address: "",
    gender: "",
    date_of_birth: "",
    image: null,
    is_active: true,
    is_staff: true,
  })
  const [departments, setDepartments] = useState([])
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDepartmentsLoading, setIsDepartmentsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  // Fetch departments when modal opens
  useEffect(() => {
    if (isOpen && shopId) {
      const fetchDepartments = async () => {
        try {
          setIsDepartmentsLoading(true)
          const accessToken = Cookies.get("accessToken")

          if (!accessToken) {
            throw new Error("No access token found")
          }

          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}employee/departments/`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          )

          setDepartments(Array.isArray(response.data.data) ? response.data.data : [])
        } catch (err) {
          console.error("Error fetching departments:", err)
          setError("Error fetching departments: " + (err.response?.data?.message || err.message))
        } finally {
          setIsDepartmentsLoading(false)
        }
      }

      fetchDepartments()
      // Reset form data when modal opens
      setFormData({
        department_id: "",
        number: "",
        first_name: "",
        last_name: "",
        email: "",
        address: "",
        gender: "",
        date_of_birth: "",
        image: null,
        is_active: true,
        is_staff: true,
      })
      setValidationErrors({})
      setError(null)
    }
  }, [isOpen, shopId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null,
      })
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({
        ...formData,
        image: file
      })
    }
  }

  const validateForm = () => {
    const errors = {}

    // Required fields validation
    if (!formData.department_id) errors.department_id = "Department is required"
    if (!formData.number) errors.number = "Phone number is required"
    
    // Check if shop ID is available
    if (!shopId) errors.shop = "Shop ID is missing. Please select a shop first."

    // Format validation for phone number
    if (formData.number && !/^\+?[0-9\s-()]{7,15}$/.test(formData.number)) {
      errors.number = "Invalid phone number format"
    }

    // Optional email validation if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format"
    }

    // Date of birth validation if provided
    if (formData.date_of_birth) {
      const datePattern = /^\d{4}-\d{2}-\d{2}$/
      if (!datePattern.test(formData.date_of_birth)) {
        errors.date_of_birth = "Invalid date format. Use YYYY-MM-DD"
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validate form before submission
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const accessToken = Cookies.get("accessToken")
      if (!accessToken) {
        throw new Error("No access token found")
      }

      if (!shopId) {
        throw new Error("Shop ID is missing")
      }

      const url = `${process.env.NEXT_PUBLIC_API_URL}employee/${shopId}/employees/`
      
      // Prepare FormData
      const formDataToSend = new FormData()
      
      // Required fields
      formDataToSend.append("shop_id", shopId)
      formDataToSend.append("department_id", formData.department_id)
      formDataToSend.append("number", formData.number)
      
      // Boolean fields - convert to string "true" or "false"
      formDataToSend.append("is_active", formData.is_active.toString())
      formDataToSend.append("is_staff", formData.is_staff.toString())
      
      // Set default name if first_name and last_name are empty
      const firstName = formData.first_name || "Employee"
      const lastName = formData.last_name || "" 
      
      // Always send names (either provided or default)
      formDataToSend.append("first_name", firstName)
      if (lastName) formDataToSend.append("last_name", lastName)
      
      // Add other optional fields only if they have values
      if (formData.email) formDataToSend.append("email", formData.email)
      if (formData.address) formDataToSend.append("address", formData.address)
      if (formData.gender) formDataToSend.append("gender", formData.gender)
      if (formData.date_of_birth) formDataToSend.append("date_of_birth", formData.date_of_birth)
      if (formData.image) formDataToSend.append("image", formData.image)

      // Log the form data being sent (for debugging)
      console.log("Form data being sent:", {
        shop_id: shopId,
        department_id: formData.department_id,
        number: formData.number,
        first_name: firstName,
        last_name: lastName,
        is_active: formData.is_active.toString(),
        is_staff: formData.is_staff.toString(),
        // other fields...
      })

      // Attempt to create employee
      const response = await axios.post(url, formDataToSend, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      
      // Check if response indicates success
      if (response.status >= 200 && response.status < 300) {
        let departmentName = "Unknown"
        
        try {
          // Find department name if possible
          const matchingDept = departments.find(
            d => d.id === Number.parseInt(formData.department_id)
          )
          if (matchingDept) {
            departmentName = matchingDept.name
          }
        } catch (err) {
          console.log("Error finding department name:", err)
        }
        
        // Get employee data from response
        let newEmployee = {}
        try {
          newEmployee = response.data?.data || response.data || {}
        } catch (err) {
          console.log("Error extracting employee data:", err)
        }
        
        // Call the onEmployeeAdded callback with whatever data we have
        if (typeof onEmployeeAdded === 'function') {
          onEmployeeAdded({
            ...newEmployee,
            department_name: departmentName,
          })
        }
        
        // Show success toast
        toast.success("Employee created successfully", {
          description: `New employee added to ${departmentName} department`
        })
        
        // Close modal
        onClose()
      }
    } catch (err) {
      console.error("Error creating employee:", err);
      console.error("Error response data:", err.response?.data);

      // Check for response structure to handle validation errors
      if (err.response?.data?.errors) {
        const apiErrors = err.response.data.errors
        const formErrors = {}

        Object.keys(apiErrors).forEach((key) => {
          formErrors[key] = Array.isArray(apiErrors[key]) 
            ? apiErrors[key].join(", ")
            : apiErrors[key]
        })

        setValidationErrors(formErrors)
        toast.error("Validation Error", {
          description: "Please check the form for errors"
        })
      } else if (err.response?.data?.message) {
        // API returns a specific error message
        setError(err.response.data.message)
        toast.error("Error", {
          description: err.response.data.message
        })
      } else {
        // Generic error handling
        setError(`Error creating employee: ${err.message || 'Unknown error'}`)
        toast.error("Error Creating Employee", {
          description: err.message || 'Unknown error occurred'
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            Add New Employee
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="bg-red-50 p-3 rounded-md text-red-600 text-sm">
              {error}
            </div>
          )}
          
          {!shopId && (
            <div className="bg-yellow-50 p-3 rounded-md text-yellow-600 text-sm">
              Please select a shop before adding an employee
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="department_id">Department*</Label>
            {isDepartmentsLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading departments...
              </div>
            ) : (
              <select
                id="department_id"
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
                className={`w-full border rounded-md p-2 ${validationErrors.department_id ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="">Select department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </option>
                ))}
              </select>
            )}
            {validationErrors.department_id && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.department_id}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="number">Phone Number*</Label>
            <Input
              id="number"
              name="number"
              value={formData.number}
              onChange={handleChange}
              className={validationErrors.number ? "border-red-500" : ""}
              placeholder="Enter Phone Number"
            />
            {validationErrors.number && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.number}</p>
            )}
          </div>

          {/* Optional Fields */}
          <div className="flex gap-2">
            <div className="space-y-1 flex-1">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={validationErrors.first_name ? "border-red-500" : ""}
                placeholder="First Name"
              />
              {validationErrors.first_name && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.first_name}</p>
              )}
            </div>

            <div className="space-y-1 flex-1">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                placeholder="Last Name"
                onChange={handleChange}
                className={validationErrors.last_name ? "border-red-500" : ""}
              />
              {validationErrors.last_name && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.last_name}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={validationErrors.email ? "border-red-500" : ""}
            />
            {validationErrors.email && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={validationErrors.address ? "border-red-500" : ""}
            />
            {validationErrors.address && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.address}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`w-full border rounded-md p-2 ${validationErrors.gender ? "border-red-500" : "border-gray-300"}`}
            >
              <option value="">Select gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </select>
            {validationErrors.gender && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.gender}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={handleChange}
              className={validationErrors.date_of_birth ? "border-red-500" : ""}
            />
            {validationErrors.date_of_birth && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.date_of_birth}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="image">Profile Image</Label>
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={validationErrors.image ? "border-red-500" : ""}
            />
            {validationErrors.image && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.image}</p>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !shopId}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Employee
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}