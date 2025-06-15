"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { ChangePasswordForm } from "@/components/authentication/change-password-form";
// import { Toaster } from "@/components/ui/toaster";
import { EditProfileForm } from "@/components/profile/edit-profile-form";

export default function ShopOwnerProfile() {
  const [userInfo, setUserInfo] = useState(null);
  const [resetPass, setResetPass] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fetchUserInfo = async () => {
    const accessToken = Cookies.get("accessToken");

    if (!accessToken) {
      console.error("No access token found");
      // Redirect to login if no token is found
      window.location.href = "/authentication";
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}profile/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setUserInfo(response.data);
    } catch (error) {
      console.error("Failed to fetch profile:", error);

      // If unauthorized, redirect to login
      if (error.response && error.response.status === 401) {
        console.log("Authentication failed. Redirecting to login...");
        // Clear invalid tokens
        Cookies.remove("accessToken");
        window.location.href = "/login";
      }
    }
  };

  useEffect(() => {
    const accessToken = Cookies.get("accessToken");
    if (!accessToken) {
      window.location.href = "/authentication";
      return;
    }

    fetchUserInfo();
  }, []);

  const handleEditSuccess = (updatedData) => {
    setUserInfo(updatedData);
    setIsEditing(false);
  };

  if (!userInfo) return <p>Loading profile...</p>;

  if (resetPass)
    return <ChangePasswordForm phoneNumber={userInfo.phone_number} />;

  if (isEditing)
    return (
      <div className="max-w-xl mx-auto mt-10 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <EditProfileForm
              userInfo={userInfo}
              onCancel={() => setIsEditing(false)}
              onSuccess={handleEditSuccess}
            />
          </CardContent>
        </Card>
      </div>
    );

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      {/* <Toaster /> */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle>Shop Owner Profile</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center mb-6">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage
                src={userInfo.profile_picture || "/placeholder.svg"}
                alt={userInfo.first_name}
              />
              <AvatarFallback>
                {userInfo.first_name?.[0]}
                {userInfo.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold">
              {userInfo.first_name} {userInfo.last_name}
            </h2>
            <Badge className="mt-1 text-white dark:text-black">
              {userInfo.role || "Shop Owner"}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Gender</span>
              <span className="text-sm font-medium">{userInfo.gender}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Birth Date</span>
              <span className="text-sm font-medium">
                {new Date(userInfo.birth_date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </Button>
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
    </div>
  );
}
