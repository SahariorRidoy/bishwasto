// NewShopModal.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Cookies from "js-cookie";

// Modal component defined within this file
function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900 flex justify-center items-center transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg relative max-w-md w-full border shadow-lg">
        <button
          className="absolute cursor-pointer top-2 right-2 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
          onClick={onClose}
        >
          X
        </button>
        {children}
      </div>
    </div>
  );
}

export default function NewShopModal({ 
  isOpen, 
  onClose, 
  shopCategories, 
  onShopCreated
}) {
  // Form state
  const [shopName, setShopName] = useState("");
  const [location, setLocation] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: "", message: "" });

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!shopName || shopName.length < 3) {
      newErrors.shopName = "Shop name must be at least 3 characters";
    }

    if (!location || location.length < 3) {
      newErrors.location = "Shop location must be at least 3 characters";
    }

    if (!categoryId) {
      newErrors.category = "Please select a category for your shop";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCategorySelect = (id) => {
    setCategoryId(id);
    if (formErrors.category) {
      setFormErrors({ ...formErrors, category: "" });
    }
    setDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitMessage({ type: "", message: "" });

    try {
      const accessToken = Cookies.get("accessToken");

      const payload = {
        shop_name: shopName,
        category: categoryId,
        location: location,
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}shop/request/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      Cookies.set("shopRequestStatus", "pending");

      setSubmitMessage({
        type: "success",
        message: "Your shop request has been created successfully!",
      });

      setShopName("");
      setLocation("");
      setCategoryId("");

      setTimeout(() => {
        onClose();
        setSubmitMessage({ type: "", message: "" });
        onShopCreated(); // Trigger parent component to refresh shop list
      }, 2000);
    } catch (error) {
      console.error("Error submitting shop request:", error);
      setSubmitMessage({
        type: "error",
        message:
          error.response?.data?.message ||
          "Your shop could not be registered. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find the selected category name
  const selectedCategory = shopCategories.find((cat) => cat.id === categoryId);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-semibold mb-4 dark:text-white">
        New Shop Request
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Shop Name
          </label>
          <input
            type="text"
            value={shopName}
            onChange={(e) => {
              setShopName(e.target.value);
              if (formErrors.shopName) {
                setFormErrors({ ...formErrors, shopName: "" });
              }
            }}
            className={`mt-1 block w-full border rounded-md p-2 dark:bg-gray-700 dark:text-white ${
              formErrors.shopName
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            }`}
            placeholder="Your Shop Name"
          />
          {formErrors.shopName && (
            <p className="text-red-500 text-xs mt-1">{formErrors.shopName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Shop Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              if (formErrors.location) {
                setFormErrors({ ...formErrors, location: "" });
              }
            }}
            className={`mt-1 block w-full border rounded-md p-2 dark:bg-gray-700 dark:text-white ${
              formErrors.location
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            }`}
            placeholder="Shop Address or Location"
          />
          {formErrors.location && (
            <p className="text-red-500 text-xs mt-1">{formErrors.location}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category
          </label>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`mt-1 w-full border rounded-md p-2 bg-white dark:bg-gray-700 text-left flex items-center justify-between ${
                formErrors.category
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } dark:text-white`}
            >
              <span
                className={
                  categoryId ? "text-black dark:text-white" : "text-gray-400"
                }
              >
                {selectedCategory
                  ? selectedCategory.name
                  : "Select a category"}
              </span>
              <svg
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                {shopCategories.length > 0 ? (
                  shopCategories.map((category) => (
                    <div
                      key={`category-${category.id}`}
                      onClick={() => handleCategorySelect(category.id)}
                      className="px-3 py-2 cursor-pointer hover:bg-[#00ADB5] hover:text-white dark:hover:bg-blue-500 transition-colors"
                    >
                      {category.name}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-gray-500">
                    No categories available
                  </div>
                )}
              </div>
            )}
          </div>
          {formErrors.category && (
            <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>
          )}
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

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            onClick={onClose}
            className="bg-gray-500 text-white cursor-pointer hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[#00ADB5] cursor-pointer text-white hover:bg-[#60aaad] dark:bg-blue-500 dark:hover:bg-blue-700"
            disabled={isSubmitting}
            style={{
              opacity: isSubmitting ? 0.6 : 1,
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}