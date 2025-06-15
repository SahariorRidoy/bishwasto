"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle } from "lucide-react"
import toast from "react-hot-toast"

export function EmployeeCreateDialog({ children }) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    mobile: "",
    password: "",
    confirmPassword: "",
    role: "",
    department: "",
    startDate: ""
  })
  const [errors, setErrors] = useState({
    password: "",
    role: "",
    department: ""
  })

  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
    
    // Clear the specific error when user starts typing
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: "" }))
    }
  }

  const handleSelectChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }))
    
    // Clear the specific error when user selects an option
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: "" }))
    }
  }

  const validateForm = () => {
    let isValid = true
    const newErrors = { ...errors }

    // Validate passwords
    if (formData.password !== formData.confirmPassword) {
      newErrors.password = "Passwords do not match"
      isValid = false
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
      isValid = false
    } else {
      newErrors.password = ""
    }

    // Validate role selection
    if (!formData.role) {
      newErrors.role = "Please select a role"
      isValid = false
    } else {
      newErrors.role = ""
    }

    // Validate department selection
    if (!formData.department) {
      newErrors.department = "Please select a department"
      isValid = false
    } else {
      newErrors.department = ""
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Please provide all information.", {
        duration: 3000,
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      })
      return
    }
    
    // Handle form submission logic here
    console.log("Creating account with:", formData)
    // API call would go here
    
    // Show success toast
    toast.success("Employee account has been successfully created", {
      duration: 3000,
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
      
    })
    
    setOpen(false)
    // Reset form
    setFormData({
      mobile: "",
      password: "",
      confirmPassword: "",
      role: "",
      department: "",
      startDate: ""
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="text-white cursor-pointer bg-[#00ADB5] hover:bg-[#589ba0] dark:bg-blue-500 dark:hover:bg-blue-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="text-[#00ADB5] dark:text-blue-500">Create Employee Account</DialogTitle>
          <DialogDescription>
            Create account credentials for the employee. 
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-[#00ADB5] dark:text-blue-500" htmlFor="mobile">Mobile Number</Label>
              <Input 
                id="mobile" 
                type="tel" 
                placeholder="(+88) 0123456789" 
                value={formData.mobile}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[#00ADB5] dark:text-blue-500" htmlFor="password">Login Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[#00ADB5] dark:text-blue-500" htmlFor="confirmPassword">Confirm Login Password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#00ADB5] dark:text-blue-500" htmlFor="role">Role</Label>
                <Select 
                  onValueChange={(value) => handleSelectChange("role", value)}
                  value={formData.role}
                >
                  <SelectTrigger id="role" className={errors.role ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Store Manager</SelectItem>
                    <SelectItem value="assistant">Assistant Manager</SelectItem>
                    <SelectItem value="sales">Sales Associate</SelectItem>
                    <SelectItem value="cashier">Cashier</SelectItem>
                    <SelectItem value="inventory">Inventory Specialist</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-[#00ADB5] dark:text-blue-500" htmlFor="department">Department</Label>
                <Select
                  onValueChange={(value) => handleSelectChange("department", value)}
                  value={formData.department}
                >
                  <SelectTrigger id="department" className={errors.department ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="management">Management</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="frontend">Front End</SelectItem>
                    <SelectItem value="inventory">Inventory</SelectItem>
                    <SelectItem value="customer-service">Customer Service</SelectItem>
                  </SelectContent>
                </Select>
                {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-[#00ADB5] dark:text-blue-500" htmlFor="startDate">Start Date</Label>
              <Input 
                id="startDate" 
                type="date" 
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button className="cursor-pointer" type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button className="text-white cursor-pointer bg-[#00ADB5] hover:bg-[#589ba0] dark:bg-blue-500 dark:hover:bg-blue-700" type="submit">
              Create Account
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}