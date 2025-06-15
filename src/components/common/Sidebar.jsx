"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import CommonButton from "./CommonButton";

const Sidebar = ({ sidebarOpen, closeSidebar, showDownloadButton = false }) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);

    const handleEsc = (event) => {
      if (event.keyCode === 27) closeSidebar();
    };
    window.addEventListener("keydown", handleEsc);

    document.body.style.overflow = sidebarOpen ? "hidden" : "auto";

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [sidebarOpen, closeSidebar]);

  // Prevent mismatch during hydration
  if (!isHydrated) return null;

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
          onClick={closeSidebar}
        ></div>
      )}

      <div
        className={`fixed top-0 right-0 h-full w-64 sm:w-72 bg-white dark:bg-gray-800 z-50 shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Menu
            </h2>
            <button
              onClick={closeSidebar}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
            >
              <IoClose className="text-2xl" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <Link
              href="/"
              onClick={closeSidebar}
              className="block text-lg font-medium text-gray-800 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 py-2"
            >
              Home
            </Link>
            <button className="w-full text-left text-lg font-medium text-gray-800 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 py-2">
              Features
            </button>
            <button className="w-full text-left text-lg font-medium text-gray-800 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 py-2">
              Pricing
            </button>
            <button className="w-full text-left text-lg font-medium text-gray-800 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 py-2">
              Customer Review
            </button>

            {showDownloadButton && (
              <div className="pt-4">
                <CommonButton
                  buttonName={"Download"}
                  className="w-full py-2 text-center"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
