"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import {
  useGetGlobalProductsQuery,
  useGetUomsQuery,
  useGetCategoriesQuery,
  usePostInventoryProductsMutation,
  usePostGlobalProductsMutation,
} from "@/features/productsApiSlice";
import Image from "next/image";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

const AddProduct = ({ onSuccess }) => {
  const [form, setForm] = useState({
    product: "",
    product_name: "",
    product_desc: "",
    category: "",
    subcategory: "",
    uom: "",
    quantity: "",
    buy_price: "",
    sell_price: "",
    product_image: null,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { data: globalProducts, isLoading: isLoadingProducts, error: productsError } = useGetGlobalProductsQuery();
  const products = Array.isArray(globalProducts) ? globalProducts : globalProducts?.results || [];
  const shopId = useSelector((state) => state.shop?.selectedShop.id);
  const { data: categories, isLoading: isLoadingCategories, error: categoriesError } = useGetCategoriesQuery();
  const { data: uoms } = useGetUomsQuery();
  const [postInventoryProduct, { isLoading }] = usePostInventoryProductsMutation();
  const [postGlobalProducts, { isLoading: isGlobalLoading }] = usePostGlobalProductsMutation();

  useEffect(() => {
    console.log("Global Products:", globalProducts);
    console.log("Products Loading:", isLoadingProducts);
    console.log("Products Error:", productsError);
    console.log("Categories Data:", categories);
    console.log("Categories Loading:", isLoadingCategories);
    console.log("Categories Error:", categoriesError);
  }, [globalProducts, isLoadingProducts, productsError, categories, isLoadingCategories, categoriesError]);

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "product_image") {
      setForm((prev) => ({ ...prev, product_image: files[0] }));
    } else if (name === "product_name") {
      setForm((prev) => ({ ...prev, product_name: value, product: "" }));
      setSearchTerm(value);
      setShowSuggestions(value.trim() !== "");
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleReset = () => {
    setForm({
      product: "",
      product_name: "",
      product_desc: "",
      category: "",
      subcategory: "",
      uom: "",
      quantity: "",
      buy_price: "",
      sell_price: "",
      product_image: null,
    });
    setSearchTerm("");
    setShowSuggestions(false);
  };

  const handleProductSelect = (productId) => {
    const selected = products.find((p) => p.product_id === productId);
    if (selected) {
      setForm((prev) => ({
        ...prev,
        product: selected.product_id.toString(),
        product_name: selected.product_name,
        product_desc: selected.product_desc,
        category: selected.subcategory.category.toString(),
        subcategory: selected.subcategory.id.toString(),
        uom: selected.uom,
        quantity: (selected.quantity || "").toString(),
        buy_price: selected.buy_price || "",
        sell_price: selected.sell_price || "",
      }));
    }
    setShowSuggestions(false);
  };

  const handleCategorySelect = (categoryId) => {
    setForm((prev) => ({ ...prev, category: categoryId.toString(), subcategory: "" }));
  };

  const handleGlobalSubmit = async (e) => {
    e.preventDefault();
    if (!form.product_name || !form.product_desc || !form.category || !form.subcategory || !form.uom) {
      toast.error("Please fill all required fields.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("product_name", form.product_name);
      formData.append("product_desc", form.product_desc);
      formData.append("subcategory_id", form.subcategory);
      formData.append("uom", form.uom);
      if (form.product_image) formData.append("product_image", form.product_image);

      const response = await postGlobalProducts(formData).unwrap();
      const newProductId = response.product_id;

      await handleSubmit({
        product: parseInt(newProductId, 10),
        shop: shopId,
        quantity: parseInt(form.quantity, 10),
        buy_price: String(form.buy_price),
        sell_price: String(form.sell_price),
      });
      handleReset();
      onSuccess();
    } catch (error) {
      console.error("Global product submission error:", error);
      toast.error(error?.data?.message || "Failed to add global product.");
    }
  };

  const handleSubmit = async ({ product, shop, quantity, buy_price, sell_price }) => {
    try {
      await postInventoryProduct({
        product,
        shop,
        quantity,
        buy_price,
        sell_price,
        is_active: true,
      }).unwrap();
      toast.success("Product added to stock successfully!");
    } catch (error) {
      console.error("Inventory submission error:", error);
      toast.error(error?.data?.message || "Failed to add product to stock.");
    }
  };

  const handleSubmit2 = async (e) => {
    e.preventDefault();
    try {
      await postInventoryProduct({
        product: parseInt(form.product, 10),
        shop: shopId,
        quantity: parseInt(form.quantity, 10),
        buy_price: String(form.buy_price),
        sell_price: String(form.sell_price),
        is_active: true,
      }).unwrap();
      toast.success("Product added to stock successfully!");
      handleReset();
      onSuccess();
    } catch (e) {
      toast.error(e?.data.error || "Something went wrong");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSuggestions && !event.target.closest(".search-dropdown-container")) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSuggestions]);

  return (
    <div className="w-full">
      <Card className="w-full max-w-[90vw] sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto shadow-md">
        <CardHeader className="px-3 sm:px-4 pt-3 pb-2">
          <CardTitle className="text-center text-base sm:text-lg md:text-xl font-bold dark:text-blue-400">
            Add Product Stock
          </CardTitle>
          <p className="text-center text-xs sm:text-sm text-muted-foreground">
            Update stock levels for a product in your shop.
          </p>
        </CardHeader>
        <CardContent className="px-3 sm:px-4 pb-4">
          <form className="space-y-3 sm:space-y-4" onSubmit={form.product ? handleSubmit2 : handleGlobalSubmit}>
            {/* Product Search */}
            <div className="relative search-dropdown-container">
              <Label htmlFor="product_name" className="mb-1 text-xs sm:text-sm">
                Product <span className="text-red-500">*</span>
              </Label>
              <Input
                id="product_name"
                name="product_name"
                placeholder="Enter product name"
                value={form.product_name}
                onChange={handleChange}
                onClick={() => form.product_name && setShowSuggestions(true)}
                autoComplete="off"
                required
                className="h-9 text-xs sm:text-sm"
                disabled={isLoadingProducts || productsError}
              />
              {isLoadingProducts && (
                <div className="absolute z-50 w-full mt-1 p-2 border rounded bg-gray-300 dark:bg-gray-700">
                  <p className="text-xs sm:text-sm text-center">Loading products...</p>
                </div>
              )}
              {productsError && (
                <div className="absolute z-50 w-full mt-1 p-2 border rounded bg-red-100 dark:bg-red-900">
                  <p className="text-xs sm:text-sm text-center text-red-600 dark:text-red-200">
                    Error loading products: {productsError?.status || "Unknown error"}
                  </p>
                </div>
              )}
              {searchTerm && showSuggestions && products && (
                <div className="absolute z-50 w-full mt-1 max-h-56 overflow-y-auto hide-scrollbar bg-gray-300 dark:bg-gray-700 border rounded">
                  {products.length > 0 ? (
                    products
                      .filter((p) => p.product_name?.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((p) => (
                        <div
                          key={p.product_id}
                          className="p-2 cursor-pointer flex items-center hover:bg-gray-200 dark:hover:bg-gray-300/30"
                          onClick={() => handleProductSelect(p.product_id)}
                        >
                          {p.product_image ? (
                            <div className="w-6 h-6 sm:w-8 sm:h-8 mr-2 overflow-hidden rounded">
                              <Image
                                loader={() => p.product_image}
                                src={p.product_image}
                                height={32}
                                width={32}
                                alt={p.product_name || "Product image"}
                                className="object-cover rounded"
                                priority
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="w-6 h-6 sm:w-8 sm:h-8 mr-2 bg-gray-200 flex items-center justify-center rounded">
                              <span className="text-xs text-gray-500">No Image</span>
                            </div>
                          )}
                          <p className="text-xs sm:text-sm truncate">{p.product_name}</p>
                        </div>
                      ))
                  ) : (
                    <div className="p-2 text-center">
                      <p className="text-xs sm:text-sm">No products found</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Product Description */}
            <div>
              <Label htmlFor="product_desc" className="mb-1 text-xs sm:text-sm">
                Product Description <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="product_desc"
                name="product_desc"
                placeholder="Enter product description"
                value={form.product_desc}
                onChange={handleChange}
                required
                rows={2}
                className="w-full border border-input bg-background px-2 py-1 text-xs sm:text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Category and Subcategory Side by Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Category */}
              <div>
                <Label htmlFor="category" className="mb-1 text-xs sm:text-sm">
                  Category <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <button
                    type="button"
                    className="w-full text-start border-input bg-background px-2 py-1 text-xs sm:text-sm h-9 rounded-md focus:outline-none focus:ring-2 focus:ring-primary border"
                    onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  >
                    {form.category
                      ? categories?.find((cat) => cat.id.toString() === form.category)?.name || "Select Category"
                      : "Select Category"}
                  </button>
                  {isLoadingCategories && <p className="text-xs sm:text-sm text-gray-500 mt-1">Loading categories...</p>}
                  {categoriesError && (
                    <p className="text-xs sm:text-sm text-red-500 mt-1">
                      Error loading categories: {categoriesError?.status || "Unknown error"}
                    </p>
                  )}
                  {categoryDropdownOpen && categories && (
                    <div className="absolute z-50 w-full mt-1 max-h-28 overflow-y-auto hide-scrollbar bg-gray-300 dark:bg-gray-700 border rounded">
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <div
                            key={category.id}
                            className="p-2 cursor-pointer text-xs sm:text-sm hover:bg-gray-200 dark:hover:bg-gray-300/30"
                            onClick={() => {
                              handleCategorySelect(category.id);
                              setCategoryDropdownOpen(false);
                            }}
                          >
                            {category.name}
                          </div>
                        ))
                      ) : (
                        <p className="p-2 text-xs sm:text-sm">No categories available</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Subcategory */}
              <div>
                <Label htmlFor="subcategory" className="mb-1 text-xs sm:text-sm">
                  Subcategory <span className="text-red-500">*</span>
                </Label>
                <select
                  id="subcategory"
                  name="subcategory"
                  value={form.subcategory}
                  onChange={handleChange}
                  required
                  className="w-full border border-input bg-background px-2 py-1 text-xs sm:text-sm h-9 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={!form.category || !!form.product}
                >
                  <option value="">Select Subcategory</option>
                  {categories
                    ?.find((cat) => cat.id.toString() === form.category)
                    ?.subcategories?.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Unit of Measurement */}
            <div>
              <Label htmlFor="uom" className="mb-1 text-xs sm:text-sm">
                Unit of Measurement <span className="text-red-500">*</span>
              </Label>
              <select
                id="uom"
                name="uom"
                value={form.uom}
                onChange={handleChange}
                required
                className="w-full border border-input bg-background px-2 py-1 text-xs sm:text-sm h-9 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select UOM</option>
                {uoms?.map((uom) => (
                  <option key={uom.uom_code} value={uom.uom_code}>
                    {uom.uom_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity / Buy Price / Sell Price */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <Label htmlFor="quantity" className="mb-1 text-xs sm:text-sm">
                  Quantity <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="text"
                  inputMode="numeric"
                  pattern="[1-9][0-9]*"
                  placeholder="e.g. 10"
                  value={form.quantity}
                  onChange={handleChange}
                  required
                  className="h-9 text-xs sm:text-sm"
                />
              </div>
              <div>
                <Label htmlFor="buy_price" className="mb-1 text-xs sm:text-sm">
                  Buy Price <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="buy_price"
                  name="buy_price"
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]+(\.[0-9]{1,2})?"
                  placeholder="e.g. 500.00"
                  value={form.buy_price}
                  onChange={handleChange}
                  required
                  className="h-9 text-xs sm:text-sm"
                />
              </div>
              <div>
                <Label htmlFor="sell_price" className="mb-1 text-xs sm:text-sm">
                  Sell Price <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="sell_price"
                  name="sell_price"
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]+(\.[0-9]{1,2})?"
                  placeholder="e.g. 600.00"
                  value={form.sell_price}
                  onChange={handleChange}
                  required
                  className="h-9 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Product Image */}
            {!form.product && (
              <div>
                <Label htmlFor="product_image" className="mb-1 text-xs sm:text-sm">
                  Product Image <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="product_image"
                  name="product_image"
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  required
                  className="text-xs sm:text-sm"
                />
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-2 pt-2">
              <Button
                variant="outline"
                type="button"
                className="border-gray-300 text-xs sm:text-sm text-gray-700"
                onClick={handleReset}
              >
                Clear
              </Button>
              <Button
                type="submit"
                className="bg-[#00ADB5] cursor-pointer hover:bg-[#70c6ca] dark:bg-blue-500 dark:hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold"
                disabled={isLoading || isGlobalLoading}
              >
                {isLoading || isGlobalLoading
                  ? "Submitting..."
                  : form.product
                    ? "Add To Stock"
                    : "Add To Stock"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddProduct;