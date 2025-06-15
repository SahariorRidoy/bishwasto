"use client"

import { useState } from "react"

export default function CreateReturnModal({ onClose, onSubmit }) {
  // Form state matching the API requirements
  const [formData, setFormData] = useState({
    product: "",
    shop: "",
    return_reason: "damaged",
    description: "",
    user: "1",
    status: "pending" // Default status
  })

  const [errors, setErrors] = useState({})

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.product) {
      newErrors.product = "Product ID is required"
    } else if (isNaN(Number(formData.product))) {
      newErrors.product = "Product ID must be a number"
    }
    
    if (!formData.shop) {
      newErrors.shop = "Shop ID is required"
    } else if (isNaN(Number(formData.shop))) {
      newErrors.shop = "Shop ID must be a number"
    }
    
    if (!formData.description || formData.description.trim().length === 0) {
      newErrors.description = "Description is required"
    }
    
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate form
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    // Format data for API submission
    const apiData = {
      ...formData,
      product: Number(formData.product),
      shop: Number(formData.shop),
      user: Number(formData.user)
    }
    
    // Submit form
    onSubmit(apiData)
  }

  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-2 sm:p-4 overflow-y-auto z-10">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-auto my-4 sm:my-8 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-4 sm:px-6 pt-4 sm:pt-6 pb-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-base sm:text-lg font-semibold">Create New Return Request</h3>
            <button 
              onClick={onClose}
              className="text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Product ID *</label>
              <input
                type="text"
                name="product"
                value={formData.product}
                onChange={handleInputChange}
                className={`w-full p-1.5 sm:p-2 text-xs sm:text-sm border ${errors.product ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00ADB5] dark:focus:ring-blue-500`}
              />
              {errors.product && (
                <p className="mt-1 text-xs text-red-500">{errors.product}</p>
              )}
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Shop ID *</label>
              <input
                type="text"
                name="shop"
                value={formData.shop}
                onChange={handleInputChange}
                className={`w-full p-1.5 sm:p-2 text-xs sm:text-sm border ${errors.shop ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00ADB5] dark:focus:ring-blue-500`}
              />
              {errors.shop && (
                <p className="mt-1 text-xs text-red-500">{errors.shop}</p>
              )}
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Return Reason *</label>
              <select
                name="return_reason"
                value={formData.return_reason}
                onChange={handleInputChange}
                className="w-full p-1.5 sm:p-2 text-xs sm:text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00ADB5] dark:focus:ring-blue-500"
              >
                <option value="damaged">Damaged</option>
                <option value="defective">Defective</option>
                <option value="wrong_item">Wrong Item</option>
                <option value="no_longer_needed">No Longer Needed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={`w-full p-1.5 sm:p-2 text-xs sm:text-sm border ${errors.description ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-md bg-white dark:bg-gray-800 h-16 sm:h-24 focus:outline-none focus:ring-2 focus:ring-[#00ADB5] dark:focus:ring-blue-500`}
                placeholder="Provide details about the return request"
              ></textarea>
              {errors.description && (
                <p className="mt-1 text-xs text-red-500">{errors.description}</p>
              )}
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full p-1.5 sm:p-2 text-xs sm:text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00ADB5] dark:focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="received">Received</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="in_transit">In Transit</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            {/* Hidden user field - would typically be set automatically based on the logged-in user */}
            <input type="hidden" name="user" value={formData.user} />
          </div>
          
          <div className="mt-4 sm:mt-6 flex justify-end gap-2 sm:gap-3 border-t border-gray-200 dark:border-gray-700 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm border border-gray-200 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-[#00ADB5] dark:bg-blue-500 text-white rounded-md hover:bg-[#02888f] dark:hover:bg-blue-600"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  ) 
}