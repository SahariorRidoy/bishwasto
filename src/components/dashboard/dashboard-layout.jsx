"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { cn } from "@/lib/utils";
import Sidebar from "./sidebar";
import Header from "./header";
import MobileNavigation from "../mobileNavigation/MobileNavigation";
import { setTheme, toggleTheme } from "@/features/themeSlice";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const currentPath = usePathname();
  const resizeTimeoutRef = useRef(null);
  const dispatch = useDispatch();
  const isDark = useSelector((state) => state.theme.isDark);

  const handleResize = useCallback(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, []);

  const debouncedResize = useCallback(() => {
    clearTimeout(resizeTimeoutRef.current);
    resizeTimeoutRef.current = setTimeout(handleResize, 100);
  }, [handleResize]);

  useEffect(() => {
    setMounted(true);

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      dispatch(setTheme(true));
      document.documentElement.classList.add("dark");
    } else {
      dispatch(setTheme(false));
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

    handleResize();
    window.addEventListener("resize", debouncedResize);

    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(resizeTimeoutRef.current);
    };
  }, [handleResize, debouncedResize, dispatch]);

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
    const nextTheme = !isDark;
    if (nextTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn(
        "lg:flex h-screen overflow-x-auto bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300"
      )}
    >
      <aside className="hidden lg:block z-30">
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          currentPath={currentPath}
        />
      </aside>
      <div className="flex flex-1 flex-col">
        <Header isDark={isDark} toggleTheme={handleToggleTheme} />
        <main className="flex-1 overflow-y-auto p-2 md:p-6 pb-24 md:pb-6">
          {children}
        </main>
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
          <MobileNavigation
            currentPath={currentPath}
            isDark={isDark}
            toggleTheme={handleToggleTheme}
          />
        </div>
      </div>
    </div>
  );
}
