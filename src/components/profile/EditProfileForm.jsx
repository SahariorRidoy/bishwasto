"use client";

import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Cookies from "js-cookie";
import { User, Calendar, Edit, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Form schema
const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(50),
  last_name: z.string().min(1, "Last name is required").max(50),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Select a gender",
  }),
  birth_date: z.string().min(1, "Date of birth is required"),
  profile_picture: z.any().optional(),
});

export default function EditProfileForm({
  user,
  profileImagePreview,
  setProfileImagePreview,
  getUserInitials,
  onSuccess,
  onCancel,
}) {
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState(null);

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || user?.full_name?.split(" ")[0] || "",
      last_name:
        user?.last_name || user?.full_name?.split(" ").slice(1).join(" ") || "",
      gender: user?.gender || "other",
      birth_date: user?.birth_date || user?.date_of_birth || "",
      profile_picture: null,
    },
  });

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImagePreview(URL.createObjectURL(file));
      form.setValue("profile_picture", e.target.files);
    }
  };

  const handleProfileUpdate = async (data) => {
    setUpdateLoading(true);
    setError(null);
    try {
      const accessToken = Cookies.get("accessToken");
      const formData = new FormData();
      formData.append("first_name", data.first_name);
      formData.append("last_name", data.last_name);
      formData.append("gender", data.gender);
      formData.append("birth_date", data.birth_date);
      if (data.profile_picture?.[0]) {
        formData.append("profile_picture", data.profile_picture[0]);
      }

      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}profile/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      onSuccess({
        first_name: data.first_name,
        last_name: data.last_name,
        gender: data.gender,
        birth_date: data.birth_date,
        profile_picture: response.data.profile_picture || profileImagePreview,
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      setError(
        error.response?.status === 404
          ? "Profile update endpoint not found"
          : "Failed to update profile"
      );
      if (error.response?.status === 401) {
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        window.location.href = "/authentication";
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  const FormFieldInput = ({ name, label, icon: Icon, type = "text" }) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label} *</FormLabel>
          <FormControl>
            <div className="relative">
              <Icon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input type={type} className="pl-10" {...field} />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleProfileUpdate)}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
          <div className="relative">
            <Avatar className="h-24 w-24 border-2 border-[#00ADB5]">
              {profileImagePreview && <AvatarImage src={profileImagePreview} />}
              <AvatarFallback className="bg-[#00ADB5] text-white text-xl font-bold">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <label
              htmlFor="profile-picture"
              className="absolute bottom-0 right-0 bg-white p-1 rounded-full cursor-pointer border border-gray-200 shadow-sm hover:bg-gray-50"
            >
              <Edit className="h-4 w-4 text-[#00ADB5]" />
              <input
                type="file"
                id="profile-picture"
                accept="image/*"
                className="hidden"
                onChange={handleProfileImageChange}
              />
            </label>
          </div>
          <div className="text-center sm:text-left">
            <h3 className="font-medium text-lg">Profile Picture</h3>
            <p className="text-sm text-muted-foreground">
              Upload a new profile picture
            </p>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFieldInput name="first_name" label="First Name" icon={User} />
          <FormFieldInput name="last_name" label="Last Name" icon={User} />
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormFieldInput
            name="birth_date"
            label="Date of Birth"
            icon={Calendar}
            type="date"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[#00ADB5] hover:bg-[#009199]"
            disabled={updateLoading}
          >
            {updateLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
