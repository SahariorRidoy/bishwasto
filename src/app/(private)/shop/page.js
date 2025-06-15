"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Info, Star } from "lucide-react";
import classNames from "classnames";
import axios from "axios";
import Cookies from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedShop } from "@/features/shopSlice";
import NewShopModal from "../../../components/ShopModal/NewShopModal";

export default function ShopPage() {
  const [shopList, setShopList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shopCategories, setShopCategories] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  const router = useRouter();
  const dispatch = useDispatch();
  const currentSelectedShop = useSelector(state => state.shop?.selectedShop);

  useEffect(() => {
    if (currentSelectedShop?.id) {
      setSelectedShopId(currentSelectedShop.id);
    }
  }, [currentSelectedShop]);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const accessToken = Cookies.get("accessToken");
      if (!accessToken) {
        localStorage.removeItem("selectedShop");
        localStorage.setItem("sellerAgreementAccepted", "false"); // Set sellerAgreementAccepted to false
        setError("Please log in to view shops.");
        router.push("/authentication");
        return;
      }

      const activeShopsResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}shop/all/`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const pendingShopsResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}shop/request/`,
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

      const pendingShops = pendingShopsResponse.data.results
        .filter((shop) => shop.status === "pending")
        .map((shop) => ({
          id: shop.id,
          name: shop.name || shop.shop_name,
          category: shop.category,
          category_name: shop.category_name || shop.category,
          is_active: false,
        }));

      const combinedShops = [
        ...activeShops,
        ...pendingShops.filter(
          (pendingShop) =>
            !activeShops.some((activeShop) => activeShop.id === pendingShop.id)
        ),
      ];

      setShopList(combinedShops);
      
      if (currentSelectedShop?.id) {
        setSelectedShopId(currentSelectedShop.id);
      } else {
        const storedShopData = localStorage.getItem('selectedShop');
        
        if (storedShopData) {
          try {
            const parsedShopData = JSON.parse(storedShopData);
            const shopExists = combinedShops.some(shop => shop.id === parsedShopData.id);
            
            if (shopExists) {
              dispatch(setSelectedShop(parsedShopData));
              setSelectedShopId(parsedShopData.id);
            } else {
              localStorage.removeItem('selectedShop');
              localStorage.setItem("sellerAgreementAccepted", "false"); // Set sellerAgreementAccepted to false
              selectDefaultShop(combinedShops);
            }
          } catch (err) {
            console.error("Error parsing stored shop data:", err);
            localStorage.removeItem('selectedShop');
            localStorage.setItem("sellerAgreementAccepted", "false"); // Set sellerAgreementAccepted to false
            selectDefaultShop(combinedShops);
          }
        } else {
          selectDefaultShop(combinedShops);
        }
      }
      
      setError(null);
    } catch (err) {
      console.error("Error fetching shops:", err);
      if (err?.response?.status === 401) {
        localStorage.removeItem("selectedShop");
        localStorage.setItem("sellerAgreementAccepted", "false"); // Set sellerAgreementAccepted to false
        setError("Please log in to view shops.");
        router.push("/authentication");
      } else {
        setError("Failed to load shops. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const selectDefaultShop = async (shops) => {
    const activeShops = shops.filter(shop => shop.is_active === true);
    
    if (activeShops.length > 0) {
      try {
        const defaultShop = activeShops[0];
        const shopDetails = await fetchShopDetails(defaultShop.id);
        
        const shopData = {
          id: shopDetails.id,
          name: shopDetails.name,
          category: shopDetails.category,
          category_name: shopDetails.category_name || 
            shopCategories.find(cat => cat.id === shopDetails.category)?.name || 
            "Unknown",
          is_active: shopDetails.is_active,
          owner: shopDetails.owner,
          created_at: shopDetails.created_at
        };
        
        dispatch(setSelectedShop(shopData));
        localStorage.setItem('selectedShop', JSON.stringify(shopData));
        setSelectedShopId(defaultShop.id);
        setToastMessage(`${defaultShop.name} automatically selected as active shop`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        console.log("Default Shop Selected:", shopData);
      } catch (error) {
        console.error("Error selecting default shop:", error);
        if (error?.response?.status === 401) {
          localStorage.removeItem("selectedShop");
          localStorage.setItem("sellerAgreementAccepted", "false"); // Set sellerAgreementAccepted to false
          router.push("/authentication");
        }
      }
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

  const handleSelectShop = async (e, shop) => {
    e.stopPropagation();
    try {
      const shopDetails = await fetchShopDetails(shop.id);
      const shopData = {
        id: shopDetails.id,
        name: shopDetails.name,
        category: shopDetails.category,
        category_name: shopDetails.category_name || 
          shopCategories.find(cat => cat.id === shopDetails.category)?.name || 
          "Unknown",
        is_active: shopDetails.is_active,
        owner: shopDetails.owner,
        created_at: shopDetails.created_at
      };
      
      dispatch(setSelectedShop(shopData));
      localStorage.setItem('selectedShop', JSON.stringify(shopData));
      setSelectedShopId(shop.id);
      setToastMessage(`${shop.name} selected as active shop`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      console.log("Selected Shop Details:", shopData);
    } catch (error) {
      setToastMessage("Error selecting shop. Please try again.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const accessToken = Cookies.get("accessToken");
        if (!accessToken) {
          localStorage.removeItem("selectedShop");
          localStorage.setItem("sellerAgreementAccepted", "false"); // Set sellerAgreementAccepted to false
          throw new Error("No access token available");
        }
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}shop/categories/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const fetchNextPages = async (nextUrl) => {
          try {
            const accessToken = Cookies.get("accessToken");
            const response = await axios.get(nextUrl, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });

            if (response.data && response.data.results) {
              setShopCategories((prevCategories) => {
                const existingIds = new Set(
                  prevCategories.map((cat) => cat.id)
                );
                const newCategories = response.data.results.filter(
                  (cat) => !existingIds.has(cat.id)
                );
                return [...prevCategories, ...newCategories];
              });

              if (response.data.next) {
                fetchNextPages(response.data.next);
              }
            }
          } catch (error) {
            console.error("Failed to fetch additional categories:", error);
            if (error?.response?.status === 401) {
              localStorage.removeItem("selectedShop");
              localStorage.setItem("sellerAgreementAccepted", "false"); // Set sellerAgreementAccepted to false
            }
          }
        };

        if (response.data && response.data.results) {
          setShopCategories(response.data.results);
          if (response.data.next) {
            fetchNextPages(response.data.next);
          }
        } else {
          const categoriesData = Array.isArray(response.data)
            ? response.data
            : response.data.categories || [];
          setShopCategories(categoriesData);
        }
      } catch (error) {
        console.error("Failed to fetch shop categories:", error);
        if (error?.response?.status === 401) {
          localStorage.removeItem("selectedShop");
          localStorage.setItem("sellerAgreementAccepted", "false"); // Set sellerAgreementAccepted to false
          router.push("/authentication");
        } else {
          setError("Failed to load shop categories. Please refresh the page.");
        }
      }
    };

    fetchCategories();
  }, []);

  const goToShopDetails = (e, shopId) => {
    e.stopPropagation();
    router.push(`/shop/${shopId}`);
  };

  const Toast = () => (
    <div className={`fixed bottom-4 right-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300 ${showToast ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {toastMessage}
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#00ADB5] dark:text-blue-500">
          My Shops
        </h1>
        <div>
          <Button
            className="bg-[#00ADB5] text-white cursor-pointer hover:bg-[#60aaad] dark:hover:bg-blue-700 dark:bg-blue-500"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> New Shop Request
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500 dark:text-gray-400">Loading shops...</p>
        </div>
      ) : error ? (
        <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
          >
            Retry
          </Button>
        </div>
      ) : shopList.length === 0 ? (
        <div className="text-center p-8">
          <p className="text-gray-500 dark:text-gray-400">
            No shops found. Create your first shop!
          </p>
        </div>
      ) : (
        <>
          {selectedShopId && (
            <div className="bg-blue-50 dark:bg-blue-900/20 py-3 rounded-lg mb-4">
              <p className="text-[var(--color-background-teal)] dark:text-blue-300 font-medium">
                Current active shop: {shopList.find(shop => shop.id === selectedShopId)?.name}
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shopList.map((shop) => (
              <Card
                key={shop.id}
                className={classNames(
                  "shadow-md rounded-2xl border transition-all duration-300 cursor-pointer hover:border-[#00ADB5] hover:scale-105 dark:border-gray-700 dark:hover:border-[#00ADB5] flex flex-col",
                  selectedShopId === shop.id && "border-[#00ADB5] dark:border-blue-500 border-2"
                )}
                onClick={() => router.push(`/shop/${shop.id}`)}
              >
                <CardContent className="p-6 flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold">Shop Name: {shop.name}</h2>
                    <span
                      className={classNames(
                        "text-sm font-medium px-3 py-1 rounded-full",
                        shop.is_active
                          ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200"
                          : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-200"
                      )}
                    >
                      {shop.is_active ? "Status: Active" : " Status: Pending"}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-300">
                    Category:{" "}
                    {shopCategories.find((cat) => cat.id === shop.category)?.name ||
                      shop.category_name ||
                      "Unknown"}
                  </p>
                </CardContent>
                <CardFooter className="px-6 py-4 border-t flex justify-between">
                  <Button
                    variant="outline"
                    className="text-[#00ADB5] border-[#00ADB5] hover:bg-[#00ADB5] hover:text-white dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-600"
                    onClick={(e) => goToShopDetails(e, shop.id)}
                  >
                    <Info className=" h-4 w-4" /> Details
                  </Button>
                  <Button
                    variant="ghost"
                    className={classNames(
                      selectedShopId === shop.id
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                        : "text-yellow-600 hover:bg-yellow-100 hover:text-yellow-700 dark:text-yellow-400 dark:hover:bg-yellow-900"
                    )}
                    onClick={(e) => handleSelectShop(e, shop)}
                  >
                    <Star 
                      className=" h-4 w-4" 
                      fill={selectedShopId === shop.id ? "currentColor" : "none"} 
                    /> 
                    {selectedShopId === shop.id ? "Selected" : "Select Shop"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
      
      <NewShopModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        shopCategories={shopCategories}
        onShopCreated={fetchShops}
      />
      
      <Toast />
    </div>
  );
}