"use client";

import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export function EditProfileForm({ userInfo, onCancel, onSuccess }) {
  const [formData, setFormData] = useState({
    first_name: userInfo.first_name || "",
    last_name: userInfo.last_name || "",
    gender: userInfo.gender || "",
    birth_date: userInfo.birth_date
      ? new Date(userInfo.birth_date).toISOString().split("T")[0]
      : "",
    profile_picture: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(
    userInfo.profile_picture || null
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenderChange = (value) => {
    setFormData((prev) => ({ ...prev, gender: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, profile_picture: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Update the handleSubmit function to check for token before making the request
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const accessToken = Cookies.get("accessToken");

    try {
      const formDataToSend = new FormData();

      // Only append fields that have changed
      if (formData.first_name !== userInfo.first_name) {
        formDataToSend.append("first_name", formData.first_name);
      }

      if (formData.last_name !== userInfo.last_name) {
        formDataToSend.append("last_name", formData.last_name);
      }

      if (formData.gender !== userInfo.gender) {
        formDataToSend.append("gender", formData.gender);
      }

      if (
        formData.birth_date !==
        new Date(userInfo.birth_date).toISOString().split("T")[0]
      ) {
        formDataToSend.append("birth_date", formData.birth_date);
      }

      if (formData.profile_picture) {
        formDataToSend.append("profile_picture", formData.profile_picture);
      }

      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}profile/`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

    //   toast({
    //     title: "Profile Updated",
    //     description: "Your profile has been successfully updated.",
    //     variant: "success",
    //   });

      onSuccess(response.data);
    } catch (error) {
      console.error("Failed to update profile:", error);

      if (error.response && error.response.status === 401) {
        Cookies.remove("accessToken");
        window.location.href = "/authentication";
        return;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col items-center mb-6">
        <div className="relative h-24 w-24 mb-4">
          <img
            src={previewImage || "/placeholder.svg"}
            alt="Profile"
            className="h-full w-full rounded-full object-cover"
          />
          <Label
            htmlFor="profile_picture"
            className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            <Input
              id="profile_picture"
              name="profile_picture"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </Label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="gender">Gender</Label>
        <Select value={formData.gender} onValueChange={handleGenderChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="birth_date">Birth Date</Label>
        <Input
          id="birth_date"
          name="birth_date"
          type="date"
          value={formData.birth_date}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
