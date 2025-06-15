"use client";

import { useState } from "react";
import {
  Smartphone,
  KeyRound,
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const ForgotPasswordForm = ({ onBackToLogin }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [serverOtp, setServerOtp] = useState("");
  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber) return setError("Phone number is required");

    setIsLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_URL}auth/forget-password/`, {
        phone_number: phoneNumber,
      });
      setServerOtp(res.data.otp);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!otp) return setError("OTP is required");
    if (otp !== serverOtp) return setError("Invalid OTP");
    setStep(3);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const { new: newPass, confirm } = passwords;
    if (!newPass || !confirm)
      return setError("Both password fields are required");
    if (newPass !== confirm) return setError("Passwords don't match");

    setIsLoading(true);
    setError("");

    try {
      await axios.post(`${API_URL}auth/reset-password/`, {
        phone_number: phoneNumber,
        otp: serverOtp,
        new_password: newPass,
      });
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  const renderHeader = (title, description, backStep) => (
    <CardHeader>
      <div className="flex items-center">
        {backStep !== null && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setStep(backStep)}
            className="mr-2 h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </div>
    </CardHeader>
  );

  return (
    <Card>
      {step === 1 && (
        <form onSubmit={handleRequestOtp}>
          {renderHeader("Forgot Password", "Enter your phone number", null)}
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="relative">
              <Smartphone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="01XXXXXXXXX"
                className="pl-10"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="mt-4">
            <Button
              type="submit"
              className="w-full bg-[#00ADB5] hover:bg-[#00ADB5]/90 hover:scale-105 dark:bg-blue-600 dark:text-white mt-3"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send OTP"}
            </Button>
          </CardFooter>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp}>
          {renderHeader("Verify OTP", "Enter the OTP", 1)}
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="relative">
              <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="6-digit code"
                className="pl-10"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="mt-4">
            <Button
              type="submit"
              className="w-full bg-[#00ADB5] hover:bg-[#00ADB5]/90 hover:scale-105 dark:bg-blue-600 dark:text-white mt-3"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify"}
            </Button>
          </CardFooter>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword}>
          {renderHeader("Reset Password", "Set a new password", 2)}
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                className="pl-10 pr-10"
                value={passwords.new}
                onChange={(e) =>
                  setPasswords({ ...passwords, new: e.target.value })
                }
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
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm password"
                className="pl-10 pr-10"
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirm: e.target.value })
                }
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="absolute top-1/2 right-2 transform -translate-y-1/2"
              >
                {showConfirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="mt-4">
            <Button
              type="submit"
              className="w-full bg-[#00ADB5] hover:bg-[#00ADB5]/90 hover:scale-105 dark:bg-blue-600 dark:text-white mt-3"
              disabled={isLoading}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </CardFooter>
        </form>
      )}

      {step === 4 && (
        <div>
          <CardHeader>
            <CardTitle>Success</CardTitle>
            <CardDescription>Password has been reset</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="success">
              <AlertDescription>
                You can now log in with your new password.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="mt-4">
            <Button onClick={onBackToLogin} className="w-full bg-[#00ADB5] hover:bg-[#00ADB5]/90 hover:scale-105 dark:bg-blue-600 dark:text-white mt-3">
              Back to Login
            </Button>
          </CardFooter>
        </div>
      )}
    </Card>
  );
};
