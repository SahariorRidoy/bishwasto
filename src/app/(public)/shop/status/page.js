"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
// Fix: Import icons individually instead of using barrel imports
import { LuStore } from "react-icons/lu"
import { LuMapPin } from "react-icons/lu"
import { LuClock } from "react-icons/lu"
import { LuLoader } from "react-icons/lu"
import axios from "axios"
import Cookies from "js-cookie"
import Link from "next/link"
import { useDispatch } from "react-redux" // Import dispatch hook
import { setUserInfo } from "@/features/authSlice" // Import the action

export default function ShopRequestStatusPage() {
  const [requestData, setRequestData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [initialLoad, setInitialLoad] = useState(true)
  const router = useRouter()
  const dispatch = useDispatch() // Initialize dispatch

  useEffect(() => {
    // Check if there's initial data in sessionStorage first
    const checkInitialData = () => {
      const storedData = sessionStorage.getItem("initialShopData")
      
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData)
          setRequestData(parsedData)
          
          // Remove after using it once
          sessionStorage.removeItem("initialShopData")
          
          // Still set loading to false for first render
          setIsLoading(false)
          
          // Don't set initialLoad to false yet - let real data fetch complete
        } catch (error) {
          console.error("Failed to parse stored shop data:", error)
        }
      }
    }
    
    // Only try this once on initial load
    if (initialLoad) {
      checkInitialData()
    }
    
    const fetchShopRequest = async () => {
      try {
        setIsLoading(true)
        const accessToken = Cookies.get("accessToken")
        
        // First check shop request status
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}shop/request/`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        })

        const data = response.data
        const result = data?.results?.[0] || (!data.results && data)
        
        if (result) {
          setRequestData(result)
          Cookies.set("shopRequestStatus", result.status)
          
          // If approved, check if user has active shops
          if (result.status === "approved" || result.is_active) {
            try {
              // Fetch user's shops to confirm they're a shop owner
              const shopsResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}shop/all`, {
                headers: { Authorization: `Bearer ${accessToken}` }
              })
              
              const hasActiveShops = shopsResponse.data?.results?.some(shop => shop.is_active === true)
              
              if (hasActiveShops) {
                // Update Redux state to reflect shop owner status
                const currentUserInfo = JSON.parse(Cookies.get("userInfo") || "{}") 
                const updatedUserInfo = {
                  ...currentUserInfo,
                  is_shopOwner: true
                }
                
                // Update both Redux state and persistent storage
                dispatch(setUserInfo(updatedUserInfo))
                
                // Now redirect to dashboard
                router.push("/dashboard")
              }
            } catch (shopError) {
              console.error("Failed to fetch shops:", shopError)
            }
          }
        } else {
          setRequestData(null)
        }
      } catch (error) {
        console.error("Failed to fetch shop request:", error)
        setError("Failed to load your shop request information. Please try again.")
      } finally {
        setIsLoading(false)
        setInitialLoad(false)
      }
    }

    fetchShopRequest()
    const interval = setInterval(fetchShopRequest, 60000)
    return () => clearInterval(interval)
  }, [router, dispatch, initialLoad])

  if (isLoading && !requestData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="relative text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-teal-500 mb-4 mx-auto"></div>
          <LuLoader className="absolute top-3 left-1/2 -ml-3 h-6 w-6 text-teal-500 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-300 mt-4">Loading your shop request...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-32 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl transition-all duration-300">
        <div className="flex flex-col items-center text-center">
          <p className="text-lg font-semibold text-red-500">{error}</p>
          <Link
            href="/shop/register"
            className="mt-6 px-6 py-3 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-transform transform hover:scale-105"
          >
            Try Again
          </Link>
        </div>
      </div>
    )
  }

  if (!requestData) {
    return (
      <div className="max-w-4xl mx-auto mt-32 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl transition-all duration-300">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            No shop request found.
          </p>
          <Link
            href="/shop/register"
            className="inline-block mt-4 px-6 py-3 bg-teal-500 text-white rounded-full hover:bg-indigo-700 transition-transform transform hover:scale-105"
          >
            Register Your Shop
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-12 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300">
          {/* Header */}
          <div className="bg-[#00ADB5] p-8">
            <h2 className="text-3xl font-bold text-white">Shop Request Status</h2>
            <p className="mt-2 text-sm text-teal-100">
              Monitor the progress of your shop registration
            </p>
          </div>

          {/* Main Content */}
          <div className="p-8 space-y-8">
            {/* Loading Overlay when refreshing data */}
            {isLoading && !initialLoad && (
              <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-500"></div>
              </div>
            )}
            
            {/* Status Card */}
            <div
              className={`rounded-xl p-6 border-l-8 ${
                requestData.status === "pending"
                  ? "bg-yellow-50 border-yellow-500"
                  : "bg-green-50 border-green-500"
              } transition-all duration-300 hover:shadow-lg`}
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-md">
                  {requestData.status === "pending" ? (
                    <LuClock className="h-8 w-8 text-yellow-500 animate-pulse" />
                  ) : (
                    <LuStore className="h-8 w-8 text-green-500" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    {requestData.status === "pending" ? "Pending Review" : "Approved"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {requestData.status === "pending"
                      ? "Your shop request is being reviewed by our team."
                      : "Congratulations! Your shop is approved. Redirecting to dashboard..."}
                  </p>
                </div>
              </div>
            </div>

            {/* Shop Info Card */}
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md">
              <h4 className="text-lg font-semibold text-teal-600 dark:text-teal-400 mb-6">
                Shop Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InfoRow
                  icon={<LuStore className="h-6 w-6 text-teal-500" />}
                  label="Shop Name"
                  value={requestData.shop_name}
                />
                <InfoRow
                  icon={<LuMapPin className="h-6 w-6 text-teal-500" />}
                  label="Location"
                  value={requestData.location}
                />
                <InfoRow
                  icon={<LuLoader className="h-6 w-6 text-teal-500" />}
                  label="Category"
                  value={requestData.category_name}
                />
                <InfoRow
                  icon={<LuClock className="h-6 w-6 text-teal-500" />}
                  label="Requested On"
                  value={new Date(requestData.created_at).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                />
              </div>
            </div>

            {/* Footer Note */}
            <div className="bg-teal-50 dark:bg-teal-900 rounded-xl p-6 text-sm text-teal-800 dark:text-teal-200">
              <p className="font-semibold">What&apos;s Next?</p>
              <p>
                Our team is reviewing your request and will notify you within 1-2 business days. Stay tuned for updates on this page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-4 group">
      <div className="p-2 bg-teal-100 dark:bg-teal-800 rounded-full group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</p>
        <p className="text-base font-semibold text-gray-800 dark:text-gray-100">{value}</p>
      </div>
    </div>
  )
}