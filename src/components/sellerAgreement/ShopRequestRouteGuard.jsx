// components/guards/ShopRequestRouteGuard.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { Loader2 } from "lucide-react";

const ShopRequestRouteGuard = ({ children }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasAccepted, setHasAccepted] = useState(false);

  useEffect(() => {
    // Only check if we're on a shop/request page
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/shop/request")) {

      setLoading(false);
      return;
    }

    const checkAgreementStatus = async () => {
        try {
          const accessToken = Cookies.get("accessToken");
          
          if (!accessToken) {
            router.push("/authentication");
            return;
          }
      
          const acceptedFromLocalStorage = localStorage.getItem("sellerAgreementAccepted") === "true";
      
          if (acceptedFromLocalStorage) {
            setHasAccepted(true);
          } else {
            // No agreement accepted - redirect to profile
            router.push("/user-profile");
          }
        } catch (error) {
          console.error("Failed to check agreement status:", error);
          router.push("/user-profile");
        } finally {
          setLoading(false);
        }
      };
      
    checkAgreementStatus();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00ADB5]" />
      </div>
    );
  }

  // If not on protected path or has accepted agreement, render children
  if (!window.location.pathname.startsWith("/shop/request") || hasAccepted) {
    return <>{children}</>;
  }

  // Otherwise, return null while redirecting
  return null;
};

export default ShopRequestRouteGuard;