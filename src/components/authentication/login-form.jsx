"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Smartphone, Lock, EyeOff, Eye, Loader2 } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import { setAuthenticated, setUserInfo } from "@/features/authSlice";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ForgotPasswordForm } from "@/components/authentication/forgot-password-form";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { authAPI } from '@/lib/api';
import { useApiError } from '@/hooks/useApiError';
import { useLoading } from '@/hooks/useLoading';

const loginSchema = z.object({
  phone_number: z
    .string()
    .regex(
      /^01[0-9]{9}$/,
      "Phone number must start with 01 and be 11 digits long"
    ),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const LoginForm = () => {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const { isAuthenticated, userInfo } = useSelector((state) => state.auth);

  const { handleError } = useApiError();
  const { isLoading: apiLoading, withLoading } = useLoading();

  useEffect(() => {
    if (isAuthenticated) {
      if (userInfo?.is_shopOwner) {
        router.push("/dashboard");
      } else {
        router.push("/user-profile");
      }
    }
  }, [isAuthenticated, userInfo, router]);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone_number: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await withLoading(
        authAPI.login({
          phone_number: data.phone_number,
          password: data.password,
        })
      );

      if (response.status === 200) {
        const { access, refresh } = response.data.tokens;

        Cookies.set("accessToken", access, {
          expires: 1,
          secure: true,
          sameSite: "Strict",
          path: "/",
        });

        Cookies.set("refreshToken", refresh, {
          expires: 7,
          secure: true,
          sameSite: "Strict",
          path: "/",
        });

        const userData = {
          is_shopOwner: response.data.is_shopOwner,
          is_employee: response.data.is_employee,
        };

        if (typeof window !== 'undefined') {
          localStorage.removeItem('selectedShop');
        }

        dispatch(setAuthenticated(true));
        dispatch(setUserInfo(userData));

        toast.success("Login successful!");

        if (userData.is_shopOwner) {
          router.push("/dashboard");
        } else {
          router.push("/user-profile");
        }
      }
    } catch (error) {
      handleError(error, "Login failed. Please check your credentials.");
    }
  };

  if (showForgotPassword) {
    return (
      <ForgotPasswordForm onBackToLogin={() => setShowForgotPassword(false)} />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your phone number and password to login
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        placeholder="01XXXXXXXXX"
                        className="pl-10"
                        {...field}
                        disabled={apiLoading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
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
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10"
                        {...field}
                        disabled={apiLoading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="text-right">
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto font-normal text-sm mb-1"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot password?
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-[#00ADB5] cursor-pointer hover:bg-[#00ADB5]/90 hover:scale-105 active:scale-95 transition-transform duration-200 dark:bg-blue-600 dark:text-white mt-3"
              disabled={apiLoading}
            >
              {apiLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};