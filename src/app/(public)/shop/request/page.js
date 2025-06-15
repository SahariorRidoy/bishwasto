"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LuStore, LuMapPin, LuChevronDown, LuMenu } from "react-icons/lu"
import axios from "axios"
import Cookies from "js-cookie"

export default function ShopRegistrationForm() {
  const initialFormState = {
    shop_name: "",
    location: "",
    category: "",
  };
  
  const [formData, setFormData] = useState(initialFormState)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState({ type: "", message: "" })
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [shopCategories, setShopCategories] = useState([])
  const dropdownRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const accessToken = Cookies.get("accessToken");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}shop/categories/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        )
        
        const fetchNextPages = async (nextUrl) => {
          try {
            const response = await axios.get(nextUrl, {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            });
            
            if (response.data && response.data.results) {
              setShopCategories(prevCategories => {
                const existingIds = new Set(prevCategories.map(cat => cat.id));
                const newCategories = response.data.results.filter(cat => !existingIds.has(cat.id));
                return [...prevCategories, ...newCategories];
              });
              
              if (response.data.next) {
                fetchNextPages(response.data.next);
              }
            }
          } catch (error) {
            console.error("Failed to fetch additional categories:", error);
          }
        };
        
        if (response.data && response.data.results) {
          setShopCategories(response.data.results);
          if (response.data.next) {
            fetchNextPages(response.data.next);
          }
        } else {
          const categoriesData = Array.isArray(response.data) ? response.data : response.data.categories || [];
          setShopCategories(categoriesData);
        }
      } catch (error) {
        console.error("Failed to fetch shop categories:", error)
        setSubmitMessage({
          type: "error",
          message: "Failed to load shop categories. Please refresh the page."
        })
      } 
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
  }

  const handleCategorySelect = (categoryId) => {
    setFormData({ ...formData, category: categoryId })

    if (errors.category) {
      setErrors({ ...errors, category: "" })
    }

    setDropdownOpen(false)
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.shop_name || formData.shop_name.length < 3) {
      newErrors.shop_name = "Shop name must be at least 3 characters"
    }

    if (!formData.location || formData.location.length < 3) {
      newErrors.location = "Location must be at least 3 characters"
    }

    if (!formData.category) {
      newErrors.category = "Please select a category for your shop"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitMessage({ type: "", message: "" })

    try {
      const accessToken = Cookies.get("accessToken");
      
      const payload = {
        shop_name: formData.shop_name,
        location: formData.location,
        category: formData.category
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}shop/request/`, 
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      )

      const createdShopRequest = response.data
      sessionStorage.setItem("initialShopData", JSON.stringify(createdShopRequest))
      Cookies.set("shopRequestStatus", createdShopRequest.status || "pending")
      setFormData(initialFormState)
      
      setSubmitMessage({
        type: "success",
        message: "Your shop request has been created. Redirecting to subscription page...",
      })

      // Redirect to subscription page after successful submission
      setTimeout(() => {
        router.push("/subscription")
      }, 2000)
      
    } catch (error) {
      setSubmitMessage({
        type: "error",
        message: error.response?.data?.message || "Your shop could not be registered. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedCategory = shopCategories.find(cat => cat.id === formData.category);

  return (
    <div className="max-w-3xl mt-28 mb-10 bg-white dark:bg-gray-800 mx-auto dark:border-2 px-4 sm:px-6 md:px-8 rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b dark:border-gray-700">
        <h2 className="text-2xl font-semibold text-[var(--color-background-teal)] dark:text-blue-500">Provide Your Shop Information</h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
          Fill the details about your shop to get started
        </p>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="shop_name" className="block text-sm font-medium text-[var(--color-background-teal)] dark:text-blue-500">
              Shop Name
            </label>
            <div className="flex items-center space-x-2">
              <LuStore className="h-5 w-5 text-gray-400 dark:text-gray-300" />
              <input
                id="shop_name"
                name="shop_name"
                type="text"
                value={formData.shop_name}
                onChange={handleChange}
                placeholder="Enter Shop Name"
                className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white ${
                  errors.shop_name ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                } focus:outline-none focus:ring-2 focus:ring-[var(--color-background-teal)] dark:focus:ring-blue-500`}
              />
            </div>
            {errors.shop_name && <p className="text-red-500 text-xs mt-1">{errors.shop_name}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="location" className="block text-sm font-medium text-[var(--color-background-teal)] dark:text-blue-500">
              Location
            </label>
            <div className="flex items-center space-x-2">
              <LuMapPin className="h-5 w-5 text-gray-400 dark:text-gray-300" />
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter Shop Address"
                className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white ${
                  errors.location ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                } focus:outline-none focus:ring-2 focus:ring-[var(--color-background-teal)] dark:focus:ring-blue-500`}
              />
            </div>
            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="block text-sm font-medium text-[var(--color-background-teal)] dark:text-blue-500">
              Shop Category
            </label>
            <div className="relative flex items-center space-x-2" ref={dropdownRef}>
              <LuMenu className="h-5 w-5 text-gray-400 dark:text-gray-300" />
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`w-full px-3 py-2 bg-white dark:bg-gray-800 dark:text-white border rounded-md flex items-center justify-between ${
                  errors.category ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                } focus:outline-none focus:ring-2 focus:ring-[var(--color-background-teal)] dark:focus:ring-blue-500`}
              >
                <span className={formData.category ? "text-black dark:text-white" : "text-gray-400"}>
                  {selectedCategory ? selectedCategory.name : "Select a category"}
                </span>
                <LuChevronDown className="h-5 w-5 text-gray-400 dark:text-gray-300" />
              </button>

              {dropdownOpen && (
                <div className="fixed inset-0 bg-transparent z-20" style={{ pointerEvents: "none" }}>
                  <div 
                    style={{ 
                      pointerEvents: "auto",
                      position: "absolute",
                      top: dropdownRef.current?.getBoundingClientRect().bottom + window.scrollY + "px",
                      left: dropdownRef.current?.getBoundingClientRect().left + window.scrollX + "px",
                      width: dropdownRef.current?.offsetWidth + "px"
                    }}
                    className="z-50 py-2 bg-white dark:bg-gray-800 border border-[var(--color-background-teal)] dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto"
                  >
                    {shopCategories.length > 0 ? (
                      shopCategories.map((category) => (
                        <div
                          key={`category-${category.id}`}
                          onClick={() => handleCategorySelect(category.id)}
                          className="px-3 py-2 cursor-pointer hover:bg-[var(--color-background-teal)] hover:text-white dark:hover:bg-blue-400 transition-colors"
                        >
                          {category.name}
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-gray-500">No categories available</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 font-medium dark:bg-blue-500 rounded-md text-white"
              style={{
                backgroundColor: "var(--color-background-teal)",
                opacity: isSubmitting ? 0.6 : 1,
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? "Registering..." : "Register Shop"}
            </button>
          </div>

          {submitMessage.message && (
            <div
              className={`p-3 rounded-md ${
                submitMessage.type === "success"
                  ? "bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              {submitMessage.message}
            </div>
          )}
        </form>
      </div>

      <div className="px-6 py-4 border-t dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          By registering a shop, you agree to our Bishwasto&#39;s{" "}
          <a className="text-blue-600 underline underline-offset-2">
            Terms of Service
          </a>{" "}
          and{" "}
          <a className="text-blue-600 underline underline-offset-2">
            Privacy Policy
          </a>. <span className="font-semibold">After submitting, you will be limited to shop-related pages until approval.</span>
        </p>
      </div>
    </div>
  )
}