"use client"

import { useState } from "react"
import { Dialog } from "../../../components/ui/dialog"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Select } from "../../../components/ui/select"
import { Label } from "../../../components/ui/label"
import { Textarea } from "../../../components/ui/textarea"
import { X } from "lucide-react"

export function AddLeaveModal({ isOpen, onClose, shopId, employees = [], onLeaveAdded }) {
  const [formData, setFormData] = useState({
    employee_id: "",
    start_date: "",
    end_date: "",
    reason: "",
    type: "casual",
    status: "pending",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // In a real app, this would call the API to create the leave record
    // For now, we'll just pass the data to the parent component
    onLeaveAdded({
      ...formData,
      employee_id: Number.parseInt(formData.employee_id),
    })

    // Reset form and close modal
    setFormData({
      employee_id: "",
      start_date: "",
      end_date: "",
      reason: "",
      type: "casual",
      status: "pending",
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Request Leave</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employee_id">Employee</Label>
              <Select id="employee_id" name="employee_id" value={formData.employee_id} onChange={handleChange} required>
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id.toString()}>
                    {emp.first_name} {emp.last_name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Leave Type</Label>
              <Select id="type" name="type" value={formData.type} onChange={handleChange} required>
                <option value="casual">Casual Leave</option>
                <option value="medical">Medical Leave</option>
                <option value="annual">Annual Leave</option>
                <option value="unpaid">Unpaid Leave</option>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea id="reason" name="reason" value={formData.reason} onChange={handleChange} required rows={3} />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#00ADB5] hover:bg-[#00ADB5]/90 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Submit Request
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  )
}