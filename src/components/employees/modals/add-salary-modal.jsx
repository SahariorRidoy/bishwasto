"use client"

import { useState } from "react"
import { Dialog } from "../../ui/dialog"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Select } from "../../ui/select"
import { Label } from "../../ui/label"
import { X } from "lucide-react"

export function AddSalaryModal({ isOpen, onClose, shopId, employees = [], onSalaryAdded }) {
  const [formData, setFormData] = useState({
    employee_id: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basic_salary: "",
    bonus: "0",
    deduction: "0",
    status: "pending",
  })

  const handleChange = (e) => {
    const { name, value } = e.target

    // Calculate total when any of the salary fields change
    if (name === "basic_salary" || name === "bonus" || name === "deduction") {
      const basic =
        name === "basic_salary" ? Number.parseFloat(value) || 0 : Number.parseFloat(formData.basic_salary) || 0
      const bonus = name === "bonus" ? Number.parseFloat(value) || 0 : Number.parseFloat(formData.bonus) || 0
      const deduction =
        name === "deduction" ? Number.parseFloat(value) || 0 : Number.parseFloat(formData.deduction) || 0

      setFormData({
        ...formData,
        [name]: value,
        total: basic + bonus - deduction,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // In a real app, this would call the API to create the salary record
    // For now, we'll just pass the data to the parent component
    onSalaryAdded({
      ...formData,
      employee_id: Number.parseInt(formData.employee_id),
      month: Number.parseInt(formData.month),
      year: Number.parseInt(formData.year),
      basic_salary: Number.parseFloat(formData.basic_salary),
      bonus: Number.parseFloat(formData.bonus) || 0,
      deduction: Number.parseFloat(formData.deduction) || 0,
      total:
        Number.parseFloat(formData.basic_salary) +
        Number.parseFloat(formData.bonus || 0) -
        Number.parseFloat(formData.deduction || 0),
    })

    // Reset form and close modal
    setFormData({
      employee_id: "",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      basic_salary: "",
      bonus: "0",
      deduction: "0",
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add Salary</h2>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <Select id="month" name="month" value={formData.month} onChange={handleChange} required>
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

              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select id="year" name="year" value={formData.year} onChange={handleChange} required>
                  <option value="2023">2023</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="basic_salary">Basic Salary</Label>
              <Input
                id="basic_salary"
                name="basic_salary"
                type="number"
                value={formData.basic_salary}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bonus">Bonus</Label>
                <Input
                  id="bonus"
                  name="bonus"
                  type="number"
                  value={formData.bonus}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deduction">Deduction</Label>
                <Input
                  id="deduction"
                  name="deduction"
                  type="number"
                  value={formData.deduction}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Total Salary</Label>
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md text-lg font-bold text-gray-900 dark:text-white">
                BDT{" "}
                {(
                  Number.parseFloat(formData.basic_salary || 0) +
                  Number.parseFloat(formData.bonus || 0) -
                  Number.parseFloat(formData.deduction || 0)
                ).toLocaleString()}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#00ADB5] hover:bg-[#00ADB5]/90 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Save Salary
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  )
}
