"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatsCards from "@/components/dashboard/stats-cards";
import SalesOverview from "@/components/dashboard/sales-overview";
import OrderStatus from "@/components/dashboard/order-status";
import axios from "axios";
import Cookies from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedShop } from "@/features/shopSlice";

export default function DashboardPage() {
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  const router = useRouter();
  const dispatch = useDispatch();
  const selectedShop = useSelector(state => state.shop?.selectedShop);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark') ||
                      window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(isDarkMode);
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDark(document.documentElement.classList.contains('dark'));
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const checkSelectedShop = async () => {
      try {
        const accessToken = Cookies.get("accessToken");
        if (!accessToken) {
          localStorage.removeItem("selectedShop");
          localStorage.setItem("sellerAgreementAccepted", "false"); // Set sellerAgreementAccepted to false
          setLoading(false);
          router.push("/authentication");
          return;
        }

        if (selectedShop?.id) {
          console.log("Shop already selected in Redux:", selectedShop);
          setLoading(false);
          return;
        }

        const storedShopData = localStorage.getItem('selectedShop');
        
        if (storedShopData) {
          try {
            const parsedShopData = JSON.parse(storedShopData);
            await fetchShopDetails(parsedShopData.id);
            dispatch(setSelectedShop(parsedShopData));
            console.log("Using shop from localStorage:", parsedShopData);
            setToastMessage(`${parsedShopData.name} selected as active shop`);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
          } catch (err) {
            console.error("Error with stored shop data:", err);
            localStorage.removeItem('selectedShop');
            localStorage.setItem("sellerAgreementAccepted", "false"); // Set sellerAgreementAccepted to false
            await selectDefaultShop();
          }
        } else {
          await selectDefaultShop();
        }
      } catch (error) {
        console.error("Error checking selected shop:", error);
        if (error?.response?.status === 401) {
          localStorage.removeItem("selectedShop");
          localStorage.setItem("sellerAgreementAccepted", "false"); // Set sellerAgreementAccepted to false
          router.push("/authentication");
        }
      } finally {
        setLoading(false);
      }
    };

    checkSelectedShop();
  }, [selectedShop, dispatch]);

  const fetchShops = async () => {
    try {
      const accessToken = Cookies.get("accessToken");
      if (!accessToken) {
        localStorage.removeItem("selectedShop");
        localStorage.setItem("sellerAgreementAccepted", "false"); // Set sellerAgreementAccepted to false
        throw new Error("No access token available");
      }
      const activeShopsResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}shop/all/`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const activeShops = activeShopsResponse.data.results.map((shop) => ({
        id: shop.id,
        name: shop.name || shop.shop_name,
        category: shop.category,
        category_name: shop.category_name || shop.category,
        is_active: shop.is_active !== undefined ? shop.is_active : true,
      }));

      return activeShops.filter(shop => shop.is_active === true);
    } catch (err) {
      console.error("Error fetching shops:", err);
      if (err?.response?.status === 401) {
        localStorage.removeItem("selectedShop");
        localStorage.setItem("sellerAgreementAccepted", "false"); // Set sellerAgreementAccepted to false
      }
      throw new Error("Failed to load shops");
    }
  };

  const fetchShopDetails = async (shopId) => {
    try {
      const accessToken = Cookies.get("accessToken");
      if (!accessToken) {
        localStorage.removeItem("selectedShop");
        localStorage.setItem("sellerAgreementAccepted", "false"); // Set sellerAgreementAccepted to false
        throw new Error("No access token available");
      }
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}shop/${shopId}/`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      return response.data;
    } catch (err) {
      console.error(`Error fetching shop details for id ${shopId}:`, err);
      if (err?.response?.status === 401) {
        localStorage.removeItem("selectedShop");
        localStorage.setItem("sellerAgreementAccepted", "false"); // Set sellerAgreementAccepted to false
      }
      throw new Error("Failed to fetch shop details");
    }
  };

  const selectDefaultShop = async () => {
    try {
      const activeShops = await fetchShops();
      
      if (activeShops.length > 0) {
        const defaultShop = activeShops[0];
        const shopDetails = await fetchShopDetails(defaultShop.id);
        
        const shopData = {
          id: shopDetails.id,
          name: shopDetails.name,
          category: shopDetails.category,
          category_name: shopDetails.category_name || "Unknown",
          is_active: shopDetails.is_active,
          owner: shopDetails.owner,
          created_at: shopDetails.created_at
        };
        
        dispatch(setSelectedShop(shopData));
        localStorage.setItem('selectedShop', JSON.stringify(shopData));
        setToastMessage(`${defaultShop.name} automatically selected as active shop`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        console.log("Default Shop Selected:", shopData);
      } else {
        setToastMessage("No active shops found. Please create a shop first.");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          router.push('/shop');
        }, 2000);
      }
    } catch (error) {
      console.error("Error selecting default shop:", error);
      if (error?.response?.status === 401) {
        localStorage.removeItem("selectedShop");
        localStorage.setItem("sellerAgreementAccepted", "false"); // Set sellerAgreementAccepted to false
      }
      router.push('/shop');
    }
  };

  const Toast = () => (
    <div className={`fixed bottom-4 right-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300 ${showToast ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {toastMessage}
    </div>
  );

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center items-center h-60">
          <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl my-2 text-[#00ADB5] dark:text-white font-bold">Dashboard Overview</h2>
            {selectedShop && (
              <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-[#00ADB5] dark:text-blue-300 font-medium">
                  Active shop: {selectedShop.name}
                </p>
              </div>
            )}
          </div>

          <StatsCards />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SalesOverview isDark={isDark} />
            <OrderStatus isDark={isDark}/>
          </div>
          <Toast />
        </>
      )}
    </div>
  );
}