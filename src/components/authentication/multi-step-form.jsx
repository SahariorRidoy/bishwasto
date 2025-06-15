"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Upload } from "lucide-react";
import Cookies from "js-cookie";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUserInfo } from "@/features/authSlice";

export default function MultiStepForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    profile_picture: null,
    gender: "",
    birth_date: "",
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Helper function to validate birth date
  const validateBirthDate = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    const birthDate = new Date(dateString);
    const minAgeDate = new Date();
    minAgeDate.setFullYear(today.getFullYear() - 16);

    // Check if date is in the future
    if (birthDate > today) {
      return "Birth date cannot be in the future";
    }
    // Check if user is at least 16 years old
    if (birthDate > minAgeDate) {
      return "You must be at least 16 years old";
    }
    return "";
  };

  // Handle text and date input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "birth_date") {
      const dateError = validateBirthDate(value);
      setError(dateError);
      if (!dateError) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle file input changes
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Profile picture must be less than 5MB");
        return;
      }
      setFormData((prev) => ({ ...prev, profile_picture: file }));
      const fileReader = new FileReader();
      fileReader.onload = () => setPreviewUrl(fileReader.result);
      fileReader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({ ...prev, profile_picture: null }));
      setPreviewUrl(null);
    }
  };

  // Handle gender radio changes
  const handleRadioChange = (value) => {
    setFormData((prev) => ({ ...prev, gender: value }));
  };

  // Validate and proceed to next step
  const nextStep = () => {
    if (step === 1 && (!formData.first_name || !formData.last_name)) {
      setError("Please fill in first and last name");
      return;
    }

    if (step === 2 && !formData.profile_picture) {
      setError("Please upload a profile picture");
      return;
    }

    if (step === 3) {
      if (!formData.birth_date) {
        setError("Please select a birth date");
        return;
      }
      if (!formData.gender) {
        setError("Please select a gender");
        return;
      }
      const dateError = validateBirthDate(formData.birth_date);
      if (dateError) {
        setError(dateError);
        return;
      }
    }
    setError("");
    setStep((prev) => prev + 1);
  };

  // Go back to previous step
  const prevStep = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    // Validate required fields
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.birth_date ||
      !formData.profile_picture ||
      !formData.gender
    ) {
      setError("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    // Validate birth date before submission
    const dateError = validateBirthDate(formData.birth_date);
    if (dateError) {
      setError(dateError);
      setIsSubmitting(false);
      return;
    }

    const token = Cookies.get("accessToken");
    if (!token) {
      setError("Authentication token is missing. Please log in.");
      setIsSubmitting(false);
      return;
    }

    // Create FormData
    const formDataToSend = new FormData();
    formDataToSend.append("first_name", formData.first_name);
    formDataToSend.append("last_name", formData.last_name);
    formDataToSend.append("gender", formData.gender);
    formDataToSend.append("birth_date", formData.birth_date);
    if (formData.profile_picture) {
      formDataToSend.append("profile_picture", formData.profile_picture);
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}profile/`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Profile created successfully:", response.data);
      setSuccess("Profile created successfully!");
      
      // Update Redux store with the new user information
      dispatch(setUserInfo(response.data));
      
      // Redirect to user profile page
      router.push("/user-profile");
    } catch (error) {
      console.error("Error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to submit form. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render individual steps
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  placeholder="Enter your first name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  placeholder="Enter your last name"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={nextStep}>
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </>
        );
      case 2:
        return (
          <>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile_picture">
                  Upload Profile Picture (Required)
                </Label>
                <div className="flex flex-col items-center gap-4">
                  {previewUrl && (
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300">
                      <img
                        src={previewUrl}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="profile_picture"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          JPEG or PNG (max 5MB)
                        </p>
                      </div>
                      <Input
                        id="profile_picture"
                        type="file"
                        required
                        name="profile_picture"
                        accept="image/jpeg,image/png"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={nextStep}>
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </>
        );
      case 3:
        return (
          <>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Gender</Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={handleRadioChange}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="birth_date">Birth Date</Label>
                <Input
                  id="birth_date"
                  name="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={handleInputChange}
                  required
                  max={new Date().toISOString().split("T")[0]} // Prevents selecting future dates
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <Button variant="outline" onClick={prevStep}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-[#00ADB5] hover:bg-[#00ADB5]/90 hover:scale-105 dark:bg-blue-600 dark:text-white mt-3"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </CardFooter>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <div className="mb-2 px-6 pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {step} of 3</span>
            <span className="text-sm font-medium">
              {Math.round((step / 3) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-[#00ADB5] h-2.5 rounded-full"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>
        {success && (
          <div className="px-6 pb-4 text-green-500 text-sm">{success}</div>
        )}
        {error && <div className="px-6 pb-4 text-red-500 text-sm">{error}</div>}
        {renderStep()}
      </Card>
    </div>
  );
}