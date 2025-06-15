"use client";
import { Plus, ArrowUpDown, X, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddProduct from "@/components/Inventory/AddProduct";
import { useState, useMemo, useEffect } from "react";
import {
  useGetGlobalProductsQuery,
  useGetInventoryProductsByShopQuery,
  usePostInventoryProductsMutation,
} from "@/features/productsApiSlice";
import Image from "next/image";
import getProductImage from "@/utils/getProductImage";
import CommonTable from "@/components/common/CommonTable";
import { useSelector } from "react-redux";

const Products = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false); // New state for success modal
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("product_name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortPopupOpen, setSortPopupOpen] = useState(false);
  const [selectedSortField, setSelectedSortField] = useState("product_name");
  const [selectedSortOrder, setSelectedSortOrder] = useState("asc");
  const [isMobile, setIsMobile] = useState(false);

  const selectedShop = useSelector((state) => state.shop?.selectedShop);
  const shopId = selectedShop?.id?.toString();

  const [postInventoryProduct] = usePostInventoryProductsMutation();
  const { data: products, isLoading: isProductsLoading } =
    useGetInventoryProductsByShopQuery(shopId, {
      skip: !shopId,
    });

  const {
    data: globalProducts,
    isFetching,
    isError,
  } = useGetGlobalProductsQuery();

  // Prevent background scrolling when either modal is open
  useEffect(() => {
    if (isOpen || isSuccessOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen, isSuccessOpen]);

  // Check if viewport is mobile size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const handleAddProductSuccess = () => {
    setIsOpen(false); // Close the Add Product modal
    setIsSuccessOpen(true); // Open the success modal
  };

  const filteredAndSortedProducts = useMemo(() => {
    const productList = products?.results || products || [];
    if (!productList) return [];

    const filtered = productList.filter((product) =>
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }
    });

    return sorted;
  }, [products, searchTerm, sortField, sortOrder]);

  const getMobileColumns = () => [
    {
      label: "Product",
      render: (product) => {
        const productImage = getProductImage(product, globalProducts);
        return (
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0 w-10 h-10">
              <Image
                loader={() => productImage}
                src={productImage}
                height={40}
                width={40}
                alt={product.product_name}
                className="rounded object-cover"
                priority
                unoptimized
              />
            </div>
            <div className="flex flex-col">
              <span className="font-medium line-clamp-1">
                {product.product_name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Stock: {product.quantity} units
              </span>
            </div>
          </div>
        );
      },
    },
    {
      label: "Price",
      render: (product) => (
        <div className="text-right">
          <div>BDT {product.sell_price}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Buy: {product.buy_price}
          </div>
        </div>
      ),
    },
    {
      label: "",
      align: "right",
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          className="text-xs cursor-pointer"
          onClick={() =>
            (window.location.href = `/inventory/products/${row.id}`)
          }
        >
          View
        </Button>
      ),
    },
  ];

  const getDesktopColumns = () => [
    {
      label: "Product Image",
      render: (product) => {
        const productImage = getProductImage(product, globalProducts);
        return (
          <div className="size-[50px]">
            <Image
              loader={() => productImage}
              src={productImage}
              height={50}
              width={50}
              alt={product.product_name}
              className="rounded object-cover"
              priority
              unoptimized
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        );
      },
    },
    { label: "Product Name", accessor: "product_name" },
    {
      label: "Sell Price",
      accessor: (row) => `BDT ${row.sell_price}`,
    },
    {
      label: "Stock",
      accessor: (row) => `${row.quantity} units`,
    },
    {
      label: "Buy Price",
      accessor: (row) => `BDT ${row.buy_price}`,
    },
    { label: "Last Updated", accessor: "updated_at" },
    {
      label: "Actions",
      align: "right",
      render: (row) => (
        <Button
          variant="outline"
          className="text-sm bg-[#00ADB5] dark:bg-blue-500 text-white cursor-pointer"
          onClick={() =>
            (window.location.href = `/inventory/products/${row.id}`)
          }
        >
          View Details
        </Button>
      ),
    },
  ];

  const productColumns = isMobile ? getMobileColumns() : getDesktopColumns();

  return (
    <div className="pb-7 dark:bg-background-dark w-full px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">
            Inventory Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track your product inventory
          </p>
        </div>

        <Button
          className="w-full sm:w-auto dark:bg-blue-500 cursor-pointer dark:hover:bg-blue-700 bg-[#00ADB5] hover:bg-[#6ab9bd] text-white hover:text-white"
          onClick={() => setIsOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            className="border rounded-md dark:bg-transparent bg-white pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm"
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative">
          <Button
            variant="outline"
            className="cursor-pointer w-full sm:w-auto flex items-center justify-center"
            onClick={() => setSortPopupOpen(!sortPopupOpen)}
          >
            <Filter className="mr-2 h-4 w-4" /> Sort
          </Button>

          {sortPopupOpen && (
            <div className="absolute right-0 z-20 mt-2 w-full sm:w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-4">
              <h3 className="font-semibold text-sm mb-2 text-gray-700 dark:text-gray-300">
                Sort By
              </h3>
              <select
                className="w-full mb-2 p-2 rounded-md border text-sm dark:bg-gray-700 dark:text-white"
                value={selectedSortField}
                onChange={(e) => setSelectedSortField(e.target.value)}
              >
                <option value="product_name">Product Name</option>
                <option value="sell_price">Sell Price</option>
                <option value="quantity">Stock</option>
              </select>

              <select
                className="w-full mb-4 p-2 rounded-md border text-sm dark:bg-gray-700 dark:text-white"
                value={selectedSortOrder}
                onChange={(e) => setSelectedSortOrder(e.target.value)}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>

              <div className="flex justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortPopupOpen(false)}
                  className="flex-1 cursor-pointer text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setSortField(selectedSortField);
                    setSortOrder(selectedSortOrder);
                    setSortPopupOpen(false);
                  }}
                  className="flex-1 cursor-pointer text-xs"
                >
                  Apply
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <CommonTable
        columns={productColumns}
        data={filteredAndSortedProducts}
        isFetching={isFetching || isProductsLoading}
        itemsPerPage={isMobile ? 5 : 10}
      />

      {isOpen && (
        <div className="fixed inset-0 z-30 flex items-start sm:items-center justify-center bg-black/50 backdrop-blur-sm overflow-hidden">
          <div className="relative rounded-xl p-2 sm:p-3 dark:bg-gray-800 w-full sm:w-[90%] sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto min-h-[50vh] sm:h-auto">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute cursor-pointer z-40 bg-red-600 rounded-full p-1 top-2 right-2 sm:top-3 sm:right-3 text-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="max-h-[80vh] sm:max-h-[75vh] overflow-y-auto hide-scrollbar">
              <AddProduct onSuccess={handleAddProductSuccess} />
            </div>
          </div>
        </div>
      )}

      {isSuccessOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 w-full max-w-sm mx-auto">
            <button
              onClick={() => setIsSuccessOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-semibold mb-2">Success</h2>
              <p className="text-sm sm:text-base mb-4">Product added successfully!</p>
              <div className="flex justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsSuccessOpen(false)}
                  className="text-sm"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsSuccessOpen(false);
                    setIsOpen(true);
                  }}
                  className="text-sm bg-[#00ADB5] hover:bg-[#70c6ca] dark:bg-blue-500 dark:hover:bg-blue-700 text-white font-semibold"
                >
                  Add more product
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;