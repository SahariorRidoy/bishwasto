"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Subscription() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [subscriptionsList, setSubscriptionsList] = useState([])
  const [subscriptionId, setSubscriptionId] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [submitMessage, setSubmitMessage] = useState({ type: "", message: "" })

  useEffect(() => {
    const fetchSubscriptionList = async () => {
      try {
        const token = Cookies.get("accessToken")
        if (!token) {
          console.error("No access token found")
          setSubmitMessage({
            type: "error",
            message: "Please log in to view subscription plans.",
          })
          return
        }

        console.log("Fetching plans from:", `${process.env.NEXT_PUBLIC_API_URL}subscriptions/plans`)
        console.log("Using token:", token)

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}subscriptions/plans`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        )
        console.log("Subscriptions list:", response.data)
        setSubscriptionsList(response.data)
      } catch (error) {
        console.error("Error fetching subscription list:", error)
        console.log("Error response:", error.response?.data)
        setSubmitMessage({
          type: "error",
          message: error.response?.data?.message || "Failed to load subscription plans. Please try again.",
        })
      }
    }
    fetchSubscriptionList()
  }, [])

  const validateForm = (phone_number, transaction_id) => {
    const errors = {}

    // Validate subscriptionId
    if (!subscriptionId) {
      errors.subscriptionId = "Please select a subscription plan."
    }

    // Validate paymentMethod
    if (!paymentMethod) {
      errors.paymentMethod = "Please select a payment method."
    }

    // Validate phone_number (at least 11 digits, allow optional +)
    if (!phone_number || !/^\+?\d{11,}$/.test(phone_number)) {
      errors.phone_number = "Phone number must be at least 11 digits (optional + prefix)."
    }

    // Validate transaction_id
    if (!transaction_id) {
      errors.transaction_id = "Transaction ID is required."
    } else if (transaction_id.length < 6) {
      errors.transaction_id = "Transaction ID must be at least 6 characters."
    } else if (!/^[a-zA-Z0-9\-_]+$/.test(transaction_id)) {
      errors.transaction_id = "Transaction ID can only contain letters, numbers, hyphens, or underscores."
    }

    return errors
  }

  const handleSubRequest = async (e) => {
    e.preventDefault()
    const phone_number = e.target.phone_number.value
    const transaction_id = e.target.transaction_id.value
    const data = { phone_number, transaction_id }

    // Validate form
    const errors = validateForm(phone_number, transaction_id)
    if (Object.keys(errors).length > 0) {
      setSubmitMessage({
        type: "error",
        message: Object.values(errors)[0],
      })
      return
    }

    try {
      const token = Cookies.get("accessToken")
      if (!token) {
        setSubmitMessage({
          type: "error",
          message: "Please log in to submit a subscription request.",
        })
        return
      }

      // Format payload to match common server expectations
      const formattedPaymentMethod = paymentMethod.toLowerCase().replace(" ", "_")
      const formattedPhoneNumber = phone_number.startsWith("+") ? phone_number : `+${phone_number}`

      console.log("Request payload:", {
        plan: subscriptionId,
        payment_method: formattedPaymentMethod,
        phone_number: formattedPhoneNumber,
        transaction_id,
      })
      console.log("API URL:", `${process.env.NEXT_PUBLIC_API_URL}subscriptions/request/`)
      console.log("Access Token:", token)

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}subscriptions/request/`,
        {
          plan: Number(subscriptionId), // Ensure integer
          payment_method: formattedPaymentMethod, // e.g., "bank_transfer"
          phone_number: formattedPhoneNumber, // e.g., "+8801712345678"
          transaction_id,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (res.status === 201) {
        setSubmitMessage({
          type: "success",
          message: "Subscription request sent successfully. Redirecting to status page...",
        })
        setStep(3)
        setTimeout(() => {
          router.push("/shop/status")
        }, 2000)
      }
    } catch (error) {
      console.error("Error submitting subscription request:", error)
      console.log("Response data:", error.response?.data)
      console.log("Response status:", error.response?.status)
      console.log("Response headers:", error.response?.headers)
      setSubmitMessage({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to submit subscription request. Please check your inputs and try again.",
      })
    }
  }

  return (
    <div className="container min-h-[calc(100vh-64px)] mx-auto py-6 px-4 mt-16 pt-40">
      {step === 1 && (
        <>
          <h1 className="text-4xl font-bold mb-12 text-center pt-16">
            Our Subscription Plans
          </h1>

          <div className="grid grid-cols-1 w-80 mx-auto gap-4">
            {subscriptionsList.length === 0 ? (
              <p className="text-center text-gray-600">Loading plans or no plans available...</p>
            ) : (
              subscriptionsList.map((sub) => (
                <Card
                  key={sub.id}
                  className="border hover:shadow-md transition-all"
                >
                  <CardHeader className="bg-[#00ADB5]/10">
                    <CardTitle className="pt-1">{sub.name}</CardTitle>
                  </CardHeader>

                  <CardContent className="pt-4">
                    <div className="flex justify-between items-end">
                      <div className="mb-4">
                        <span className="text-2xl font-bold">
                          {sub.price} <span className="font-normal">BDT</span>{" "}
                          <span className="text-base font-normal">for</span>
                        </span>
                      </div>
                      <div className="mb-4">
                        <span className="text-xl font-bold">
                          {sub.duration_type}
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-[#00ADB5]" />
                        <span>Full access to all features</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-[#00ADB5]" />
                        <span>Priority features</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-[#00ADB5]" />
                        <span>Full access to features</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-[#00ADB5]" />
                        <span>Feature support</span>
                      </li>
                    </ul>
                  </CardContent>

                  <CardFooter>
                    <Button
                      onClick={() => {
                        setStep(2)
                        setSubscriptionId(sub.id)
                      }}
                      type="button"
                      className="w-full cursor-pointer bg-[#00ADB5]/80 hover:bg-[#00ADB5]/90"
                    >
                      Subscribe Now
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
          {submitMessage.message && step === 1 && (
            <div
              className={`mt-4 p-3 rounded-md text-center w-80 mx-auto ${
                submitMessage.type === "success"
                  ? "bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              {submitMessage.message}
            </div>
          )}
        </>
      )}
      {step === 2 && (
        <Card className="text-center py-8 w-96 mx-auto mt-16">
          <div className="flex gap-2 items-center justify-start px-3">
            <Button
              onClick={() => setStep(1)}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <ArrowLeft />
            </Button>
            <CardTitle className="text-lg font-bold">
              Complete Your Subscription Payment
            </CardTitle>
          </div>
          <form onSubmit={handleSubRequest} className="space-y-6 px-6">
            <div className="space-y-2">
              <Label htmlFor="payment_method" className="text-sm font-medium">
                Payment Method
              </Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="payment_method" className="cursor-pointer w-full">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Mobile Payment">Mobile Payment</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number" className="text-sm font-medium">
                Phone Number
              </Label>
              <Input
                id="phone_number"
                name="phone_number"
                placeholder="Your phone number (e.g., +8801712345678)"
                type="tel"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction_id" className="text-sm font-medium">
                Transaction ID
              </Label>
              <Input
                id="transaction_id"
                name="transaction_id"
                placeholder="Your transaction ID (e.g., TXN123456)"
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              className="w-full cursor-pointer bg-[#00ADB5] hover:bg-[#00ADB5]/90 text-white"
            >
              Submit
            </Button>
          </form>
          {submitMessage.message && (
            <div
              className={`mt-4 p-3 rounded-md ${
                submitMessage.type === "success"
                  ? "bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              {submitMessage.message}
            </div>
          )}
        </Card>
      )}
      {step === 3 && (
        <Card className="text-center py-8 w-96 mx-auto mt-32">
          <h2 className="text-2xl font-bold mb-4">
            Subscription Request Sent!
          </h2>
          <p className="text-gray-600 mb-4 px-4">
            Your subscription request has been sent successfully. Redirecting to status page...
          </p>
        </Card>
      )}
    </div>
  )
}