"use client";

import React, { useEffect, useState } from "react";
import CommonButton from "./CommonButton";
import Link from "next/link";
import { FaSignInAlt, FaUserCircle } from "react-icons/fa";
import { LuMenu } from "react-icons/lu";
import { IoLogOutOutline } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { ShoppingBag } from "lucide-react";
import ThemeButton from "./ThemeButton";
import Sidebar from "./Sidebar";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import SellerAgreementModal from "../sellerAgreement/SellerAgreementModal";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setUnauthenticated, setUserInfo } from "@/features/authSlice";

const Navbar = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  // Get auth state from Redux
  const { isAuthenticated } = useSelector((state) => state.auth);
  const userInfo = useSelector((state) => state.auth.userInfo);

  useEffect(() => {
    // Check authentication status when component mounts
    const accessToken = Cookies.get("accessToken");

    // If there's a token but no user info, fetch the user data
    if (accessToken && !userInfo) {
      fetchUserData(accessToken);
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [userInfo]);

  // Check if the screen is extra small (xs)
  const isExtraSmall = windowWidth < 640; // sm breakpoint in Tailwind is 640px

  // Fetch user data if authenticated
  const fetchUserData = async (token) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}profile/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        dispatch(setUserInfo(data));
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  const closeSidebar = () => setSidebarOpen(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const closeDropdown = () => setDropdownOpen(false);

  const handleLogout = async () => {
    const refreshToken = Cookies.get("refreshToken");
    const accessToken = Cookies.get("accessToken");

    try {
      if (refreshToken && accessToken) {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}auth/logout?refresh_token=${refreshToken}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always remove cookies and update Redux state
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      dispatch(setUnauthenticated());
      router.push("/authentication");
    }
  };

  // Handle opening seller agreement modal
  const handleOpenSellerModal = () => {
    setIsSellerModalOpen(true);
    closeDropdown();
  };

  // Handle closing seller agreement modal
  const handleCloseSellerModal = () => {
    setIsSellerModalOpen(false);
  };

  // Handle successful agreement acceptance
  const handleAgreementSuccess = (data) => {
    // Update user data with agreement status
    dispatch(setUserInfo({
      ...userInfo,
      seller_status: data.status || "pending",
      has_agreement: true,
    }));
    setIsSellerModalOpen(false);
  };

  // Check if user is already a seller
  const hasActiveAgreement =
    userInfo?.seller_status === "active" || userInfo?.has_agreement;

  // Check if user has completed their profile
  const hasCompletedProfile = userInfo?.first_name && userInfo?.profile_picture && userInfo?.gender;

  return (
    <div className="relative overflow-x-hidden bg-w">
      {/* Top Navbar */}
      <div
        className={`py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 fixed top-0 left-0 right-0 z-50 shadow-lg transition-colors duration-300 ${scrolled
            ? "dark:bg-gray-900/80 bg-[#00ADB5] backdrop-blur-md text-black dark:text-blue-400"
            : "bg-[#00ADB5] dark:bg-gray-800 text-white"
          }`}
      >
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo - smaller on mobile but not truncated */}
          <Link
            href={"/"}
            className="text-xl xs:text-2xl sm:text-3xl font-bold text-white hover:cursor-pointer"
          >
            Bishwasto
          </Link>

          {/* Navigation Links - hidden on mobile */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-10">
            <Link
              href="/"
              className="text-base xl:text-lg font-semibold dark:text-blue-400 text-white hover:text-gray-300 transition"
            >
              Home
            </Link>
            <button className="text-base xl:text-lg font-semibold dark:text-blue-400 text-white hover:text-gray-300 transition hover:cursor-pointer">
              Features
            </button>
            <button className="text-base xl:text-lg font-semibold dark:text-blue-400 text-white hover:text-gray-300 transition hover:cursor-pointer">
              Pricing
            </button>
            <button className="text-base xl:text-lg font-semibold dark:text-blue-400 text-white hover:text-gray-300 transition hover:cursor-pointer whitespace-nowrap">
              Customer Review
            </button>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-2">
            {/* Theme button */}
            <div className="scale-75 sm:scale-90 md:scale-100">
              <ThemeButton />
            </div>

            {isAuthenticated ? (
              <>
                {/* Profile button */}
                <div className="relative scale-75 sm:scale-90 md:scale-100">
                  <button
                    onClick={toggleDropdown}
                    className="group relative cursor-pointer flex items-center gap-2 p-1 rounded-full border border-white/20 hover:border-white/40 transition-all duration-300 hover:shadow-lg"
                  >
                    {userInfo?.profile_picture ? (
                      <img
                        src={userInfo?.profile_picture}
                        alt="Profile"
                        className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full object-cover ring-2 ring-white group-hover:ring-teal-500 dark:group-hover:ring-blue-500 transition duration-300"
                      />
                    ) : (
                      <FaUserCircle className="text-3xl sm:text-3xl md:text-4xl text-white dark:text-blue-400 group-hover:text-blue-300 transition duration-300" />
                    )}
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50">
                      <Link
                        href="/user-profile"
                        onClick={closeDropdown}
                        className="block px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <div className="flex items-center gap-2">
                          <CgProfile className="text-base sm:text-lg" />
                          <span>My Profile</span>
                        </div>
                      </Link>
                      {/* Show mobile-only Seller options */}
                      <div className="lg:hidden">
                        {hasCompletedProfile && (
                          <>
                            {hasActiveAgreement ? (
                              <Link
                                href="/seller/dashboard"
                                onClick={closeDropdown}
                                className="block px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <div className="flex items-center gap-2">
                                  <ShoppingBag className="text-base sm:text-lg" />
                                  <span>Seller Dashboard</span>
                                </div>
                              </Link>
                            ) : (
                              <button
                                onClick={handleOpenSellerModal}
                                className="w-full text-left block px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <div className="flex items-center gap-2">
                                  <ShoppingBag className="text-base sm:text-lg" />
                                  <span>Switch to Seller</span>
                                </div>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-xs sm:text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <IoLogOutOutline className="text-base sm:text-lg" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>

                {/* Seller button - visible only on larger screens */}
                {hasCompletedProfile && (
                  <>
                    {hasActiveAgreement ? (
                      <Link
                        href="/shop/request"
                        className="hidden lg:flex items-center gap-1 bg-white text-[#00ADB5] hover:bg-gray-100 px-2 py-1 rounded-md transition mr-1 text-xs xl:text-sm"
                      >
                        <ShoppingBag className="h-3 w-3 xl:h-4 xl:w-4" />
                        <span className="font-medium">Switch to Seller</span>
                      </Link>
                    ) : (
                      <button
                        onClick={handleOpenSellerModal}
                        className="hidden lg:flex items-center gap-1 bg-white text-[#00ADB5] hover:bg-gray-100 px-2 py-1 rounded-md transition mr-1 text-xs xl:text-sm"
                      >
                        <ShoppingBag className="h-3 w-3 xl:h-4 xl:w-4" />
                        <span className="font-medium">Switch to Seller</span>
                      </button>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="scale-75 sm:scale-90 md:scale-100">
                <Link href="/authentication">
                  <CommonButton
                    buttonName={"Login"}
                    className="text-xs sm:text-sm md:text-base px-2 py-1 sm:px-3 sm:py-1"
                  />
                </Link>
              </div>
            )}

            {/* Download button - hidden on xs screens, visible for sm and up */}
            <div className="scale-70 xs:scale-75 hidden sm:block md:scale-100">
              <CommonButton
                buttonName={"Download"}
                className="text-xs md:text-base px-1.5 py-0.5 xs:px-2 xs:py-1 md:px-3 md:py-1"
              />
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden dark:text-blue-400 hover:cursor-pointer text-white scale-75 sm:scale-90 md:scale-100"
              onClick={() => setSidebarOpen(true)}
            >
              <LuMenu className="text-xl sm:text-2xl" />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        closeSidebar={closeSidebar}
        showDownloadButton={isExtraSmall} // Pass prop to show download button only on xs screens
      />

      {/* Overlay to close dropdown when clicking outside */}
      {dropdownOpen && (
        <div className="fixed inset-0 z-30" onClick={closeDropdown} />
      )}

      {/* Seller Agreement Modal */}
      <SellerAgreementModal
        isOpen={isSellerModalOpen}
        onClose={handleCloseSellerModal}
        onSuccess={handleAgreementSuccess}
      />
    </div>
  );
};

export default Navbar;