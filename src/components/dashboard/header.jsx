"use client";

import { useState, useEffect } from "react";
import {
  Sun,
  Moon,
  User,
  LogOut,
  Bell,
  ChevronDown,
  Fuel,
  Store,
  User2,
  UserPlus,
  ShoppingCart,
  ShoppingBasket,
  Package,
  List,
} from "lucide-react";
import toast from "react-hot-toast";
import ClientTime from "@/components/dashboard/clientTime";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedShop } from "@/features/shopSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Header({ isDark, toggleTheme, currentPath = "" }) {
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [shopList, setShopList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const router = useRouter();
  const dispatch = useDispatch();
  const selectedShop = useSelector((state) => state.shop?.selectedShop);

  useEffect(() => {
    setMounted(true);
    const accessToken = Cookies.get("accessToken");
    setIsAuthenticated(!!accessToken);
    if (!accessToken) {
      localStorage.removeItem("selectedShop");
      localStorage.setItem("sellerAgreementAccepted", "false"); // Set sellerAgreementAccepted to false
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchShops();
    }
  }, [isAuthenticated]);

  const fetchShops = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const accessToken = Cookies.get("accessToken");
      if (!accessToken) {
        setIsAuthenticated(false);
        localStorage.removeItem("selectedShop");
        localStorage.setItem("sellerAgreementAccepted", "false"); // Set sellerAgreementAccepted to false
        return;
      }
      const activeShopsResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}shop/all/`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const activeShops = activeShopsResponse.data.results.map((shop) => ({
        id: shop.id,
        name: shop.name || shop.shop_name,
        category: shop.category,
        category_name: shop.category_name || shop.category,
        is_active: shop.is_active !== undefined ? shop.is_active : true,
      }));
      setShopList(activeShops);
    } catch (error) {
      console.error("Error fetching shops:", error);
      if (error?.response?.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem("selectedShop");
        localStorage.setItem("sellerAgreementAccepted", "false"); // Set sellerAgreementAccepted to false
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchShopDetails = async (shopId) => {
    if (!isAuthenticated) return null;
    try {
      const accessToken = Cookies.get("accessToken");
      if (!accessToken) {
        setIsAuthenticated(false);
        localStorage.removeItem("selectedShop");
        localStorage.setItem("sellerAgreementAccepted", "false"); // Set sellerAgreementAccepted to false
        throw new Error("No access token available");
      }
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}shop/${shopId}/`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      return response.data;
    } catch (err) {
      console.error(`Error fetching shop details for id ${shopId}:`, err);
      if (err?.response?.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem("selectedShop");
        localStorage.setItem("sellerAgreementAccepted", "false"); // Set sellerAgreementAccepted to false
      }
      throw new Error("Failed to fetch shop details");
    }
  };

  const handleSelectShop = async (shop) => {
    try {
      const shopDetails = await fetchShopDetails(shop.id);
      if (!shopDetails) return;
      const shopData = {
        id: shopDetails.id,
        name: shopDetails.name,
        category: shopDetails.category,
        category_name: shopDetails.category_name || shop.category_name || "Unknown",
        is_active: shopDetails.is_active,
        owner: shopDetails.owner,
        created_at: shopDetails.created_at,
      };
      dispatch(setSelectedShop(shopData));
      localStorage.setItem("selectedShop", JSON.stringify(shopData));
      toast.success(`${shop.name} selected as active shop`, {
        position: "top-center",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error selecting shop:", error);
      toast.error("Error selecting shop. Please try again.", {
        position: "top-center",
        duration: 3000,
      });
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    try {
      setIsLoggingOut(true);
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      localStorage.removeItem("selectedShop");
      localStorage.setItem("sellerAgreementAccepted", "false"); // Set sellerAgreementAccepted to false
      setIsAuthenticated(false);
      const refreshToken = Cookies.get("refreshToken");
      const accessToken = Cookies.get("accessToken");
      if (refreshToken && accessToken) {
        try {
          await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}auth/logout?refresh_token=${refreshToken}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
        } catch (apiError) {
          console.error("Logout API error:", apiError);
        }
      }
      window.location.href = "/authentication";
    } catch (error) {
      console.error("Logout error:", error);
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      localStorage.removeItem("selectedShop");
      localStorage.setItem("sellerAgreementAccepted", "false"); // Set sellerAgreementAccepted to false
      window.location.href = "/authentication";
    }
  };

  const NotificationButton = () => (
    <button
      className="relative p-2 cursor-pointer rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-2 focus:ring-[#00ADB5] dark:focus:ring-blue-500 transition-transform hover:scale-105"
      aria-label="View notifications"
      title="Notifications"
    >
      <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      {/* <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-white dark:border-gray-800"></span> */}
    </button>
  );

  const ThemeToggle = () =>
    mounted && (
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-2 focus:ring-[#00ADB5] dark:focus:ring-blue-500 transition-transform hover:scale-105"
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {isDark ? (
          <Sun className="w-5 h-5 text-blue-400" />
        ) : (
          <Moon className="w-5 h-5 text-[#00ADB5]" />
        )}
      </button>
    );

  const ProfileDropdown = ({ triggerContent, width = "w-56" }) => (
    <DropdownMenu >
      <DropdownMenuTrigger asChild>{triggerContent}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={`${width} cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg transition-opacity duration-200`}
      >
        <DropdownMenuLabel
          className={`p-3 border-b cursor-default border-gray-200 dark:border-gray-700 ${
            width === "w-64" ? "bg-gray-50 dark:bg-gray-750" : ""
          }`}
        >
          <p className="font-semibold text-gray-800 dark:text-gray-200">Admin User</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">admin@example.com</p>
          {width === "w-64" && (
            <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
              Last login: Today, 12:10 PM
            </p>
          )}
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link
            href="/profile"
            className="group flex items-center gap-2 p-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-[#00ADB5]! dark:hover:bg-blue-500! hover:text-white focus:bg-[#00ADB5] focus:text-white transition-colors duration-200"
          >
            <User className="w-4 h-4 group-hover:text-white" /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/subscriptions"
            className="group flex items-center gap-2 p-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-[#00ADB5]! dark:hover:bg-blue-500! hover:text-white focus:bg-[#00ADB5] focus:text-white transition-colors duration-200"
          >
            <Fuel className="w-4 h-4 group-hover:text-white" /> Subscription
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/referrals"
            className="group flex items-center gap-2 p-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-[#00ADB5]! dark:hover:bg-blue-500! hover:text-white focus:bg-[#00ADB5] focus:text-white transition-colors duration-200"
          >
            <UserPlus className="w-4 h-4 group-hover:text-white" /> Referrals
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="group flex items-center gap-2 p-2 text-sm text-red-500 hover:bg-red-100 dark:hover:bg-red-300 hover:text-red-700 focus:bg-red-100 focus:text-red-700 disabled:opacity-50 transition-colors duration-200"
        >
          <LogOut className="w-4 h-4" /> {isLoggingOut ? "Logging out..." : "Logout"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const ShopDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-teal-600 hover:bg-gray-100 dark:hover:bg-gray-650 focus:ring-2 focus:ring-[#00ADB5] dark:focus:ring-blue-500 transition-transform hover:scale-[1.02]">
          <Store className="w-4 h-4 text-[#00ADB5] dark:text-blue-400" />
          <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[200px]">
            {selectedShop?.name || "Select a Shop"}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-72 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg transition-opacity duration-200"
      >
        <DropdownMenuLabel className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-800 dark:text-gray-200">Select Shop</span>
            <Link
              href="/shop"
              className="text-xs text-[#00ADB5] dark:text-blue-400 hover:underline focus:underline"
            >
              View All
            </Link>
          </div>
        </DropdownMenuLabel>
        {loading ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading shops...</div>
        ) : !isAuthenticated ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            Please log in to view shops
          </div>
        ) : shopList.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">No shops found</div>
        ) : (
          <>
            <DropdownMenuLabel className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-1">
              Available Shops
            </DropdownMenuLabel>
            {shopList.map((shop) => (
              <DropdownMenuItem
                key={shop.id}
                onClick={() => handleSelectShop(shop)}
                className="flex items-center gap-2 p-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 focus:dark:bg-gray-700 transition-colors"
              >
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="truncate">{shop.name}</span>
                {selectedShop?.id === shop.id && (
                  <span className="ml-auto text-xs font-medium bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 py-0.5 px-2 rounded-full">
                    Current
                  </span>
                )}
              </DropdownMenuItem>
            ))}
          </>
        )}
        <DropdownMenuSeparator className="my-1 border-t border-gray-200 dark:border-gray-700" />
        <DropdownMenuItem
          asChild
          className="flex items-center justify-center gap-2 p-2 text-sm font-medium text-[#00ADB5] dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 focus:dark:bg-gray-700"
        >
          <Link href="/shop">Manage All Shops</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const QuickAccessButton = ({ icon: Icon, href, label, active, showLabel = true }) => (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#00ADB5] hover:text-white dark:hover:bg-blue-600 focus:ring-2 focus:ring-[#00ADB5] dark:focus:ring-blue-500 transition-all duration-150 hover:scale-[1.02] ${
        active ? "bg-[#00ADB5] dark:bg-blue-600 text-white" : "text-gray-600 dark:text-gray-300"
      }`}
      aria-label={label}
      title={label}
    >
      <Icon className="w-5 h-5" />
      {showLabel && <span className="text-sm font-medium">{label}</span>}
    </Link>
  );

  return (
    <header className="sticky top-0 z-30 w-full bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="w-full bg-gradient-to-l bg-[#00ADB5] dark:bg-gray-700 py-0.5 px-4 md:px-6 flex justify-start items-center">
        {mounted && (
          <ClientTime className="text-xs font-medium text-white dark:text-gray-200" />
        )}
      </div>
      <div className="hidden lg:flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <span className="text-md font-medium text-gray-800 dark:text-gray-200">
            Active Shop:
          </span>
          <ShopDropdown />
        </div>
        <div className="flex items-center gap-4">
          <QuickAccessButton
            icon={ShoppingCart}
            href="/order/create-order"
            label="Sales"
            active={currentPath === "/order/create-order" || currentPath.startsWith("/order")}
            showLabel={true}
          />
          <QuickAccessButton
            icon={ShoppingBasket}
            href="/quick-sell"
            label="Quick Sell"
            active={currentPath === "/quick-sell"}
            showLabel={true}
          />
          <QuickAccessButton
            icon={Package}
            href="/inventory/products"
            label="Inventory"
            active={currentPath.startsWith("/inventory")}
            showLabel={true}
          />
          <QuickAccessButton
            icon={List}
            href="/order/order-lists"
            label="Sales Lists"
            active={currentPath === "/order/order-lists"}
            showLabel={true}
          />
        </div>
        <div className="flex items-center gap-3">
          <NotificationButton />
          <ThemeToggle />
          <ProfileDropdown
            triggerContent={
              <button className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00ADB5] to-[#03767c] dark:from-blue-500 dark:to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-md hover:shadow-lg focus:ring-2 focus:ring-[#00ADB5] dark:focus:ring-blue-500 transition-transform hover:scale-105">
                <User2 className="w-5 h-5 cursor-pointer" />
              </button>
            }
          />
        </div>
      </div>
      <div className="hidden md:flex lg:hidden items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-3">
          <ShopDropdown />
        </div>
        <div className="flex items-center gap-4">
          <QuickAccessButton
            icon={ShoppingCart}
            href="/order/create-order"
            label="Sales"
            active={currentPath === "/order/create-order" || currentPath.startsWith("/order")}
            showLabel={true}
          />
          <QuickAccessButton
            icon={ShoppingBasket}
            href="/quick-sell"
            label="Quick Sell"
            active={currentPath === "/quick-sell"}
            showLabel={true}
          />
          <QuickAccessButton
            icon={Package}
            href="/inventory/products"
            label="Inventory"
            active={currentPath.startsWith("/inventory")}
            showLabel={true}
          />
        </div>
        <div className="flex items-center gap-2">
          <NotificationButton />
          <ThemeToggle />
          <ProfileDropdown
            triggerContent={
              <button className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-full bg-gradient-to-r from-[#00ADB5] to-[#03767c] dark:from-blue-500 dark:to-blue-600 text-white text-xs font-medium shadow-md hover:shadow-lg focus:ring-2 focus:ring-[#00ADB5] dark:focus:ring-blue-500 transition-transform hover:scale-105">
                <span className="hidden md:inline">Admin</span>
                <span className="inline md:hidden">A</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            }
            width="w-64"
          />
        </div>
      </div>
      <div className="sm:hidden flex items-center justify-between px-3 py-2">
        <ShopDropdown />
        <div className="flex items-center gap-1.5">
          <NotificationButton />
          <ThemeToggle />
          <ProfileDropdown
            triggerContent={
              <button className="w-8 h-8 rounded-full bg-gradient-to-r from-[#00ADB5] to-[#03767c] dark:from-blue-500 dark:to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-md hover:shadow-lg focus:ring-2 focus:ring-[#00ADB5] dark:focus:ring-blue-500 transition-transform hover:scale-105">
                A
              </button>
            }
            width="w-56"
          />
        </div>
      </div>
    </header>
  );
}