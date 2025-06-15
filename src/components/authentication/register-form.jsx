"use client";

import { useState } from "react";
import { Smartphone, Lock, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { OtpVerificationForm } from "@/components/authentication/otp-verification-form";

export function RegisterForm() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const validatePassword = (password) => {
    // Password must be at least 6 characters with at least 1 uppercase, 1 lowercase, 
    // 1 number and 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\#+\-=\[\]{}|;:,.<>])[A-Za-z\d@$!%*?&\#+\-=\[\]{}|;:,.<>]{6,}$/;
return passwordRegex.test(password);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^01[0-9]{9}$/;
    return phoneRegex.test(phone.trim());
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    // Clear any error when typing, validation will happen on submit
    setPasswordError("");
  };

  const handlePhoneChange = (e) => {
    const newPhone = e.target.value;
    setPhoneNumber(newPhone);
    // Clear any error when typing, validation will happen on submit
    setPhoneError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let hasErrors = false;

    // Validate phone number
    if (!validatePhone(phoneNumber)) {
      setPhoneError("Phone number must start with 01 and be 11 digits");
      toast.error("Phone number must start with 01 and be 11 digits");
      hasErrors = true;
    } else {
      setPhoneError("");
    }

    // Validate password
    if (!validatePassword(password)) {
      // Set the error message to display under the password field
      if (password.length < 6) {
        setPasswordError("Password must be at least 6 characters long");
      } else {
        setPasswordError("Password must have 1 uppercase, 1 lowercase letter, 1 number and 1 special character");
      }
      // Also show a toast message
      toast.error("Invalid password format");
      hasErrors = true;
    } else {
      setPasswordError("");
    }

    if (hasErrors) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}auth/register/`,
        {
          phone_number: phoneNumber.trim(),
          password: password.trim(),
          referral_code: referralCode.trim(),
        }
      );
      setShowOtpForm(true);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (showOtpForm) {
    return (
      <OtpVerificationForm
        phoneNumber={phoneNumber}
        password={password}
        onBack={() => setShowOtpForm(false)}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>
          Create a new account with your phone number
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <label className="block mb-1">Phone Number</label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="01XXXXXXXXX"
                className={`pl-10 ${phoneError ? "border-red-500 focus:ring-red-500" : ""}`}
                value={phoneNumber}
                onChange={handlePhoneChange}
                disabled={isLoading}
              />
            </div>
            {phoneError && (
              <p className="text-sm text-red-500 mt-1">{phoneError}</p>
            )}
          </div>

          <div>
            <label className="block mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`pl-10 ${passwordError ? "border-red-500 focus:ring-red-500" : ""}`}
                value={password}
                onChange={handlePasswordChange}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-1/2 right-2 transform -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </Button>
            </div>
            {passwordError && (
              <p className="text-sm text-red-500 mt-1">{passwordError}</p>
            )}
          </div>

          <div>
            <label className="block mb-1">Referral Code (optional)</label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Referral Code"
                className="pl-3"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            className="w-full bg-[#00ADB5] cursor-pointer hover:bg-[#00ADB5]/90 hover:scale-105 dark:bg-blue-600 dark:text-white mt-7"
            disabled={isLoading}
          >
            {isLoading ? "Registering..." : "Register"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}