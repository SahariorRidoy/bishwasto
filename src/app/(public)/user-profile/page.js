"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  User,
  Calendar,
  Edit,
  CheckCircle,
  Loader2,
  ShoppingBag,
  Store,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

// Import our custom components
import EditProfileForm from "../../../components/profile/EditProfileForm";
import ChangePasswordDialog from "../../../components/profile/ChangePasswordDialog";
import SellerAgreementModal from "../../../components/sellerAgreement/SellerAgreementModal";
import { ChangePasswordForm } from "@/components/authentication/change-password-form";
import { useLoginMutation } from "@/features/authApiSlice";

export default function ProfilePage() {
  const { login } = useLoginMutation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [resetPass, setResetPass] = useState(false);
  const [hasActiveShopRequest, setHasActiveShopRequest] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const accessToken = Cookies.get("accessToken");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}profile/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        setUser(response.data);

        // Check if user has an active shop request from cookie or user data
        const shopRequestStatus = Cookies.get("shopRequestStatus");
        if (shopRequestStatus === "pending" || response.data.has_shop_request) {
          setHasActiveShopRequest(true);
        }

        // If cookie doesn't exist but we should check for shop requests from API
        if (!shopRequestStatus) {
          try {
            const shopResponse = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}shop/request/`,
              {
                headers: { Authorization: `Bearer ${accessToken}` },
              }
            );

            const hasActiveRequest =
              shopResponse.data?.results?.[0]?.status === "pending" ||
              (!shopResponse.data.results &&
                shopResponse.data?.status === "pending");

            if (hasActiveRequest) {
              setHasActiveShopRequest(true);
              Cookies.set("shopRequestStatus", "pending");
            }
          } catch (err) {
            // If API returns 404, it means no shop request exists
            if (err.response?.status !== 404) {
              console.error("Failed to check shop request status", err);
            }
          }
        }

        // Set profile image preview if exists
        if (response.data.profile_picture) {
          setProfileImagePreview(response.data.profile_picture);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        // Handle token expiration or other auth errors
        if (error.response?.status === 401) {
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
          window.location.href = "/authentication";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Handle profile update success
  const handleProfileUpdateSuccess = (updatedUserData) => {
    setUser({
      ...user,
      ...updatedUserData,
    });
    setIsEditing(false);
    setUpdateSuccess(true);

    // Hide success message after 3 seconds
    setTimeout(() => setUpdateSuccess(false), 3000);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`;
    } else if (user?.full_name) {
      const nameParts = user.full_name.split(" ");
      if (nameParts.length >= 2) {
        return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`;
      }
      return user.full_name.charAt(0);
    }
    return "U";
  };

  // Handle opening seller agreement modal
  const handleOpenSellerModal = () => {
    setIsSellerModalOpen(true);
  };

  // Handle closing seller agreement modal
  const handleCloseSellerModal = () => {
    setIsSellerModalOpen(false);
  };

  // Handle successful agreement acceptance
  const handleAgreementSuccess = (data) => {
    // Update user data with agreement status
    setUser({
      ...user,
      seller_status: data.status || "pending",
      has_agreement: true,
    });
    setIsSellerModalOpen(false);
  };

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00ADB5]" />
      </div>
    );
  }

  // Extract agreement information from user object
  const hasActiveAgreement =
    user?.seller_status === "active" || user?.has_agreement;
  const agreementStatus =
    user?.seller_status || user?.agreement_status || "none";

  if (resetPass) return <ChangePasswordForm onClose={() => setResetPass(false)} />;

  return (
    <div className="container mx-auto px-4 py-8 mt-16 max-w-4xl">
      <Card className="overflow-hidden">
        <CardHeader className="bg-[#00ADB5] dark:bg-blue-500 text-white">
          <div className="flex flex-col md:flex-row items-center md:justify-between">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-white">
                {profileImagePreview ? (
                  <AvatarImage src={profileImagePreview} />
                ) : null}
                <AvatarFallback className="bg-white text-[#00ADB5] text-xl font-bold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">
                  {user?.first_name && user?.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user?.full_name || "User"}
                </CardTitle>
                {hasActiveAgreement && (
                  <div className="text-sm mt-1 bg-white text-[#00ADB5] px-2 py-0.5 rounded inline-block">
                    Seller Status:{" "}
                    {agreementStatus.charAt(0).toUpperCase() +
                      agreementStatus.slice(1)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 mt-3 md:mt-0">
              {updateSuccess && (
                <div className="flex items-center gap-2 bg-white text-[#00ADB5] px-3 py-1 rounded-full">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Profile updated</span>
                </div>
              )}

              {/* Show Shop Status button if user has an active shop request */}
              {hasActiveShopRequest && (
                <Link href="/shop/status">
                  <Button className="bg-amber-500 cursor-pointer text-white hover:bg-amber-600 font-medium">
                    <Store className="mr-2 h-4 w-4" />
                    Shop Status
                  </Button>
                </Link>
              )}

              {/* Show Seller Dashboard link if user has an active agreement */}
              
                <Link href="/dashboard">
                  <Button className="bg-white cursor-pointer text-[#00ADB5] hover:bg-gray-100 font-medium">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Go to Dashboard
                  </Button>
                </Link>
              

              {/* Always show Switch to Seller button */}
              <Button
                onClick={handleOpenSellerModal}
                className="bg-green-500 cursor-pointer text-white hover:bg-green-600 font-medium"
              >
                <Store className="mr-2 h-4 w-4" />
                Switch to Seller
              </Button>
             
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {isEditing ? (
            <EditProfileForm
              user={user}
              profileImagePreview={profileImagePreview}
              setProfileImagePreview={setProfileImagePreview}
              getUserInitials={getUserInitials}
              onSuccess={handleProfileUpdateSuccess}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="flex items-center gap-2">
                    <User className="h-4 w-4 text-[#00ADB5]" />
                    <span className="font-medium">
                      {user?.first_name && user?.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : user?.full_name || "Not provided"}
                    </span>
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="flex items-center gap-2">
                    <User className="h-4 w-4 text-[#00ADB5]" />
                    <span className="font-medium">
                      {user?.gender
                        ? user.gender.charAt(0).toUpperCase() +
                          user.gender.slice(1)
                        : "Not provided"}
                    </span>
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#00ADB5]" />
                    <span className="font-medium">
                      {user?.birth_date ||
                        user?.date_of_birth ||
                        "Not provided"}
                    </span>
                  </p>
                </div>

                {/* Display agreement details if available */}
                {hasActiveAgreement && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Agreement Status
                    </p>
                    <p className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-[#00ADB5]" />
                      <span className="font-medium">
                        {agreementStatus.charAt(0).toUpperCase() +
                          agreementStatus.slice(1)}
                      </span>
                    </p>
                  </div>
                )}

                {/* Display shop request status if available */}
                {hasActiveShopRequest && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Shop Request
                    </p>
                    <p className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-[#00ADB5]" />
                      <span className="font-medium">
                        Active
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-gray-50 dark:bg-blue-500 p-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="w-full sm:w-auto bg-[#00ADB5] dark:bg-gray-900 cursor-pointer dark:text-white hover:bg-[#009199]"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setResetPass(true);
            }}
          >
            Change Password
          </Button>
        </CardFooter>
      </Card>

      {/* Seller Agreement Modal */}
      <SellerAgreementModal
        isOpen={isSellerModalOpen}
        onClose={handleCloseSellerModal}
        onSuccess={handleAgreementSuccess}
      />
    </div>
  );
}