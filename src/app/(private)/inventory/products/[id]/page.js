"use client";

import SecondaryButton from "@/components/common/SecondaryButton";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useState, useCallback } from "react";
import {
  useGetInventoryProductByIdQuery,
  useUpdateInventoryProductMutation,
  useDeleteInventoryProductMutation,
} from "@/features/productsApiSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const InventoryDetails = () => {
  const params = useParams();
  const id = params?.id;

  const {
    data: singleProduct,
    isLoading: isFetching,
    isError,
    error,
  } = useGetInventoryProductByIdQuery(id);

  const [updateInventoryProduct, { isLoading: isUpdating }] = useUpdateInventoryProductMutation();
  const [deleteInventoryProduct] = useDeleteInventoryProductMutation();
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

const updateProduct = useCallback(
  async () => {
    // Validate inputs
    const desiredQuantity = Number(quantity);
    const desiredBuyPrice = Number(buyPrice);
    const desiredSellPrice = Number(sellPrice);

    if (
      (quantity && (isNaN(desiredQuantity) || desiredQuantity < 0)) ||
      (buyPrice && (isNaN(desiredBuyPrice) || desiredBuyPrice <= 0)) ||
      (sellPrice && (isNaN(desiredSellPrice) || desiredSellPrice <= 0))
    ) {
      console.error("Invalid input: Quantity and prices must be valid positive numbers");
      return;
    }

    // Only include fields that have been provided
    const data = {};
    if (quantity) {
      data.quantity = desiredQuantity; // Send increment only
    }
    if (buyPrice) data.buy_price = desiredBuyPrice;
    if (sellPrice) data.sell_price = desiredSellPrice;

    // Only make API call if there's data to update
    if (Object.keys(data).length === 0) {
      console.warn("No valid data to update");
      return;
    }

    try {
      await updateInventoryProduct({ id, data }).unwrap();
      // Reset inputs
      setQuantity("");
      setBuyPrice("");
      setSellPrice("");
    } catch (err) {
      console.error("Failed to update product:", err);
    }
  },
  [quantity, buyPrice, sellPrice, updateInventoryProduct, id]
);



  const handleDelete = useCallback(async () => {
    try {
      await deleteInventoryProduct(id).unwrap();
      setIsDialogOpen(false);
      window.location.href = "/inventory/products";
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  }, [deleteInventoryProduct, id]);

  if (isFetching) {
    return <div className="container mx-auto px-4 py-7">Loading...</div>;
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-7">
        Error: {error?.data?.message || "Failed to load product"}
      </div>
    );
  }

  return (
    <div className="pb-7">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <SecondaryButton
          Icon={<ArrowLeft className="h-4 w-4 mr-2" />}
          buttonName="Back to Inventory"
          onClick={() => (window.location.href = "/inventory/products")}
        />
        <div className="flex-1 flex justify-end">
          <SecondaryButton
            customClass="flex items-center text-sm px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            Icon={<Trash2 className="h-4 w-4 mr-2" />}
            onClick={() => setIsDialogOpen(true)}
            disabled={isUpdating}
            buttonName="Delete"
          />
        </div>
      </div>

      {/* Main */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 border rounded-xl p-6 shadow-sm dark:bg-card-bg bg-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold mb-2 dark:text-secondarytext">
                {singleProduct?.product_name}
              </h2>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold flex items-center justify-end dark:text-white space-x-1 text-gray-900">
                <p>BDT</p>
                <p className="text-red-400">{singleProduct?.sell_price ?? singleProduct?.price}</p>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Last updated: {singleProduct?.updated_at}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2 dark:text-secondarytext">Description</h3>
              <p className="dark:text-secondarytext">
                {singleProduct?.description || "No description available"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between border rounded-lg p-3 dark:text-secondarytext">
                <span className="capitalize">Buy Price</span>
                <span className="font-medium text-gray-800 dark:text-secondarytext">
                  {singleProduct?.buy_price ?? "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between border rounded-lg p-3 dark:text-secondarytext">
                <span className="capitalize">Sell Price</span>
                <span className="font-medium text-gray-800 dark:text-secondarytext">
                  {singleProduct?.sell_price ?? "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-6">
          {/* Product Management */}
          <div className="border rounded-xl p-6 shadow-sm dark:bg-card-bg bg-white">
            <h3 className="text-lg font-semibold mb-4 dark:text-secondarytext">
              Product Management
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Current Stock Level</div>
                <div
                  className={`text-2xl font-bold ${
                    singleProduct?.quantity > 100
                      ? "text-green-600"
                      : singleProduct?.quantity > 50
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {singleProduct?.quantity ?? 0} units
                </div>
              </div>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="border px-4 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter new stock quantity"
                min="0"
                disabled={isUpdating}
              />
              <input
                type="number"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                className="border px-4 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter new buy price"
                min="0"
                step="0.01"
                disabled={isUpdating}
              />
              <input
                type="number"
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                className="border px-4 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter new sell price"
                min="0"
                step="0.01"
                disabled={isUpdating}
              />
              <button
                onClick={updateProduct}
                className={`flex items-center justify-center w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors ${
                  isUpdating ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Update Product"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {singleProduct?.product_name}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="cursor-pointer"
              disabled={isUpdating}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryDetails;