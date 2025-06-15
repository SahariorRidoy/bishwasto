"use client";

// Importing necessary dependencies
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Package, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetSmsPackagesQuery,
  useGetSmsCountQuery,
  useGetPurchaseHistoryQuery,
  useCreatePurchaseMutation,
  useSubmitTransactionIdMutation,
} from "@/features/smsApi";

// Main SMS Management component
export default function SmsManagement() {
  // State management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentInputOpen, setIsPaymentInputOpen] = useState(false);
  const [isTrxInputOpen, setIsTrxInputOpen] = useState(false);
  const [trxId, setTrxId] = useState("");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [requestId, setRequestId] = useState(null);

  // Constants
  const paymentOptions = ["bkash", "rocket", "nagad", "bank", "cash"];
  const shopId = useSelector((state) =>
    state.shop?.selectedShop?.id?.toString()
  );

  // RTK Query hooks for data fetching
  const {
    data: smsPackages,
    isLoading: packagesLoading,
    error: packagesError,
  } = useGetSmsPackagesQuery();
  const {
    data: smsInfo,
    isLoading: countLoading,
    isFetching,
    error: countError,
    refetch: refetchSmsCount,
  } = useGetSmsCountQuery(shopId, {
    skip: !shopId,
    refetchOnMountOrArgChange: true,
  });
  const {
    data: purchaseHistory,
    isLoading: historyLoading,
    error: historyError,
    refetch: refetchPurchaseHistory,
  } = useGetPurchaseHistoryQuery();


  // RTK Query hooks for mutations
  const [createPurchase] = useCreatePurchaseMutation();
  const [submitTransactionId] = useSubmitTransactionIdMutation();

  // Use useEffect to refetch SMS count and purchase history when shopId changes
  useEffect(() => {
    if (shopId) {
      refetchSmsCount(); // Refetch SMS count
      refetchPurchaseHistory(); // Refetch purchase history
    }
  }, [shopId, refetchSmsCount, refetchPurchaseHistory]);

  // Handle package purchase initiation
  const handlePurchase = (pkg) => {
    setSelectedPackage(pkg);
    setPaymentMethod("");
    setIsModalOpen(true);
    setIsPaymentInputOpen(true);
    setIsTrxInputOpen(false);
    setTrxId("");
  };

  // Confirm purchase with payment method
  const confirmPurchase = async () => {
    if (!paymentMethod) return toast.error("Select a payment method");
    if (!shopId) return toast.error("Shop information unavailable");

    try {
      const res = await createPurchase({
        shop: shopId,
        package_id: selectedPackage.id,
        payment_method: paymentMethod,
      }).unwrap();
      setRequestId(res.request_id);
      setIsPaymentInputOpen(false);
      setIsTrxInputOpen(true);
      toast.success("Purchase initiated");
    } catch (error) {
      toast.error(error.data?.message || "Purchase failed");
    }
  };

  // Submit transaction ID
  const confirmTrxId = async () => {
    if (!trxId) return toast.error("Enter transaction ID");

    try {
      await submitTransactionId({ requestId, transaction_id: trxId }).unwrap();
      setIsModalOpen(false);
      setIsTrxInputOpen(false);
      setIsPaymentInputOpen(false);
      setTrxId("");
      setRequestId(null);
      toast.success("Transaction submitted");
      refetchSmsCount(); // Refetch SMS count after successful transaction
      refetchPurchaseHistory(); // Refetch purchase history
    } catch (error) {
      toast.error(error.data?.message || "Transaction submission failed");
    }
  };

  // Determine loading and error states
  const isLoading = packagesLoading || countLoading || historyLoading || isFetching;
  const hasError =
    (packagesError || countError || historyError) &&
    !smsPackages?.length &&
    !purchaseHistory?.length &&
    smsInfo === undefined;

  // Single return for all UI states
  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          Loading...
        </div>
      ) : hasError ? (
        <Card className="p-5 text-center dark:text-gray-300">
          Error loading SMS data. Please try again later.
        </Card>
      ) : (
        <>
          {/* SMS Balance Section */}
          <div>
            <h2 className="text-xl font-bold dark:text-white mb-4">
              SMS Balance
            </h2>
            {!shopId ? (
              <Card className="p-5 text-center dark:text-gray-300">
                Please select a shop to view SMS balance.
              </Card>
            ) : countError ? (
              <Card className="p-5 text-center dark:text-gray-300">
                No SMS count available for this shop.
              </Card>
            ) : (
              <Card className="p-5 flex items-center gap-3 dark:bg-gray-800">
                <span className="text-lg">SMS Count</span>
                <span className="text-4xl font-bold">
                  {smsInfo?.sms_count ?? 0} {/* Fallback to 0 if sms_count is null/undefined */}
                </span>
                <Button
                  variant="outline"
                  className="ml-auto"
                  onClick={refetchSmsCount}
                >
                  Refresh
                </Button>
              </Card>
            )}
          </div>

          {/* SMS Packages Section */}
          <div>
            <h2 className="text-xl font-bold dark:text-white mb-4">
              SMS Packages
            </h2>
            {smsPackages?.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {smsPackages.map((pkg) => (
                  <Card
                    key={pkg.id}
                    className="p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span className="dark:text-gray-300">
                          {pkg.sms_quantity} SMS
                        </span>
                      </div>
                      <span className="font-bold dark:text-white">
                        ৳{pkg.price}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full flex gap-2 text-xs"
                      onClick={() => handlePurchase(pkg)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Purchase
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-4 text-center dark:text-gray-300">
                No SMS packages available
              </Card>
            )}
          </div>

          {/* Purchase History Section */}
          <div>
            <h2 className="text-xl font-bold dark:text-white mb-4">
              Purchase History
            </h2>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b dark:bg-gray-700/20">
                    <tr>
                      {["Package", "Date", "Status", "Method", "TrxID"].map(
                        (header) => (
                          <th
                            key={header}
                            className="p-2 dark:text-white text-center"
                          >
                            {header}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseHistory?.length ? (
                      purchaseHistory.map((purchase) => (
                        <tr
                          key={purchase.id}
                          className="border-b hover:bg-gray-50/5 text-center"
                        >
                          <td className="p-2 dark:text-gray-300">
                            {purchase.package?.sms_quantity || "N/A"}
                          </td>
                          <td className="p-2 dark:text-gray-300">
                            {purchase.requested_at || "N/A"}
                          </td>
                          <td className="p-2">
                            <span className="px-1 py-0.5 rounded-full">
                              {purchase.status || "Pending"}
                            </span>
                          </td>
                          <td className="p-2 dark:text-gray-300">
                            {purchase.payment_method || "N/A"}
                          </td>
                          <td className="p-2 dark:text-gray-300">
                            {purchase.transaction_id || "N/A"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="p-4 text-center dark:text-gray-300"
                        >
                          No purchase history
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Purchase Dialog */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Purchase SMS Package</DialogTitle>
                <DialogDescription>
                  Confirm purchase of {selectedPackage?.sms_quantity} SMS for ৳
                  {selectedPackage?.price}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex justify-between text-sm">
                  <span>SMS Quantity:</span>
                  <span className="font-medium">
                    {selectedPackage?.sms_quantity} SMS
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Price:</span>
                  <span className="font-medium">৳{selectedPackage?.price}</span>
                </div>
                {isPaymentInputOpen && (
                  <>
                    <Select
                      onValueChange={setPaymentMethod}
                      value={paymentMethod}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={confirmPurchase}>Confirm</Button>
                  </>
                )}
                {isTrxInputOpen && (
                  <>
                    <input
                      type="text"
                      placeholder="Transaction ID"
                      className="w-full p-2 border rounded"
                      onChange={(e) => setTrxId(e.target.value)}
                      value={trxId}
                    />
                    <Button onClick={confirmTrxId}>Submit TrxID</Button>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}