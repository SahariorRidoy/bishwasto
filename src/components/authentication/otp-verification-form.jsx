"use client";

import React, { useEffect, useState } from "react";
import MultiStepForm from "./multi-step-form";
import axios from "axios";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { setAuthenticated } from "@/features/authSlice"; // Import from the new authSlice
import { Button } from "../ui/button";

export function OtpVerificationForm({ phoneNumber, password, onBack }) {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [showMultiStepForm, setShowMultiStepForm] = useState(false);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(150); // 2:30 min = 150 seconds
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length === 6) {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}auth/verify-otp/`,
          {
            phone_number: phoneNumber,
            otp: otp,
          }
        );

        if (res.status === 200) {
          const { access, refresh } = res.data.tokens;
          console.log(res.data);

          // Set access and refresh tokens in cookies
          Cookies.set("accessToken", access, {
            expires: 1, // ~1 Day
            secure: true,
            sameSite: "Strict",
            path: "/",
          });

          Cookies.set("refreshToken", refresh, {
            expires: 7, // 7 days
            secure: true,
            sameSite: "Strict",
            path: "/",
          });

          // Dispatch authentication action to update global state
          dispatch(setAuthenticated({})); // Initial empty user data - will be filled in MultiStepForm

          setShowMultiStepForm(true);
        } else {
          setMessage("Invalid OTP. Please try again.");
        }
      } catch (error) {
        console.error("OTP verification failed:", error);
        setMessage("An error occurred. Please try again.");
      }
    } else {
      setMessage("OTP must be 6 digits");
    }
  };

  useEffect(() => {
    if (!resendEnabled && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer); // cleanup
    } else if (timeLeft <= 0) {
      setResendEnabled(true);
    }
  }, [timeLeft, resendEnabled]);

  const handleResendOTP = async (e) => {
    e.preventDefault();
    if (!resendEnabled) return; // prevent click if not enabled

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}auth/register/`,
        {
          phone_number: phoneNumber,
          password: password,
        }
      );
      console.log(res);
      if (res.status === 200) {
        console.log("OTP resent successfully. Please check your messages.");
        setResendEnabled(false); // disable again
        setTimeLeft(150); // reset timer to 150 seconds
      } else {
        setMessage("Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      console.error("Resending OTP failed:", error);
    }
  };

  if (showMultiStepForm) {
    return <MultiStepForm />;
  }

  return (
    <div className="max-w-sm mx-auto mt-10 p-4 border rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Enter OTP</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full p-2 border rounded mb-2"
          placeholder="Enter 6-digit OTP"
        />
        <div className="flex justify-between items-center mt-2">
          <p>Don't receive the OTP</p>
          <Button
            onClick={handleResendOTP}
            className={`text-red-500 bg-white ${
              !resendEnabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!resendEnabled}
          >
            {resendEnabled
              ? "RESEND OTP"
              : `RESEND OTP (${Math.floor(timeLeft / 60)}:${(timeLeft % 60)
                  .toString()
                  .padStart(2, "0")})`}
          </Button>
        </div>
        <Button
          type="submit"
          className="w-full cursor-pointer bg-[#00ADB5] hover:bg-[#00ADB5]/90 hover:scale-105 dark:bg-blue-600 dark:text-white mt-7"
        >
          Submit
        </Button>
      </form>
      {message && (
        <p className="mt-2 text-sm text-center text-red-500">{message}</p>
      )}
    </div>
  );
}
