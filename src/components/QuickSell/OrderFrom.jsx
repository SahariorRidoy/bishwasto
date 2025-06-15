"use client";
import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

const OrderForm = ({
  is_POS,
  customers,
  transaction,
  handleTransactionFieldChange,
  createOrder,
  isLoading,
  items,
  phoneSearchTerm,
  setPhoneSearchTerm,
  handleSelectCustomer,
}) => {
  const router = useRouter();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdTransactionId, setCreatedTransactionId] = useState(null);
  const [open, setOpen] = useState(false);
  const [isPrintLoading, setIsPrintLoading] = useState(false);
  const selectShop = useSelector((state) => state.shop?.selectedShop);
  const shouldShowButton =
    (!is_POS &&
      items.length > 0 &&
      transaction.amount_paid >= transaction.grand_total) ||
    (is_POS && phoneSearchTerm && items.length > 0);
  const POS = ["Cash","COD", "Mobile Banking", "Card", "Due"];
  const QuickSale = ["Cash"];
  
  // Local state for payment method to ensure initial selection
  const [localPaymentMethod, setLocalPaymentMethod] = useState(
    transaction.payment_method || (is_POS ? POS[0] : QuickSale[0])
  );

  // Sync local payment method with transaction.payment_method
  useEffect(() => {
    if (transaction.payment_method) {
      setLocalPaymentMethod(transaction.payment_method);
    } else {
      // Set default if undefined
      const defaultMethod = is_POS ? POS[0] : QuickSale[0];
      setLocalPaymentMethod(defaultMethod);
      handleTransactionFieldChange("payment_method", defaultMethod);
    }
  }, [transaction.payment_method, is_POS, handleTransactionFieldChange]);

  const filteredCustomers = useMemo(() => {
    if (typeof phoneSearchTerm !== "string" || !phoneSearchTerm.trim()) {
      return [];
    }
    if (!Array.isArray(customers)) {
      return [];
    }
    const query = phoneSearchTerm.toLowerCase();
    return customers.filter((customer) =>
      customer.phone_number?.toLowerCase().includes(query)
    );
  }, [customers, phoneSearchTerm]);

  useEffect(() => {
    const newSubtotal = items.reduce(
      (sum, item) => sum + item.qty * item.price,
      0
    );
    const newDiscount = Number(transaction.discount || 0);
    const discountedTotal = newSubtotal - newDiscount;
    const updatedItems = items.map((item) => {
      const itemTotal = item.qty * item.price;
      const itemDiscount =
        items.length === 1
          ? newDiscount
          : Number((newDiscount * (itemTotal / newSubtotal)).toFixed(2));
      return {
        product_stock: item.id,
        quantity: item.qty,
        discount_type: "percentage",
        discount_total: Number(itemDiscount.toFixed(2)),
        total_discounted_amount: Number((itemTotal - itemDiscount).toFixed(2)),
      };
    });

    const totalItemDiscounts = updatedItems.reduce(
      (sum, item) => sum + item.discount_total,
      0
    );
    if (items.length > 1 && totalItemDiscounts !== newDiscount) {
      const lastItem = updatedItems[updatedItems.length - 1];
      lastItem.discount_total = Number(
        (lastItem.discount_total + (newDiscount - totalItemDiscounts)).toFixed(2)
      );
      lastItem.total_discounted_amount = Number(
        (
          lastItem.quantity * items[items.length - 1].price -
          lastItem.discount_total
        ).toFixed(2)
      );
    }

    const updatedTransaction = {
      ...transaction,
      subtotal: Number(newSubtotal.toFixed(2)),
      discount: Number(newDiscount.toFixed(2)),
      grand_total: Number(discountedTotal.toFixed(2)),
      amount_change: Number(
        Math.max(transaction.amount_paid - discountedTotal, 0).toFixed(2)
      ),
      due: Number(
        Math.max(discountedTotal - transaction.amount_paid, 0).toFixed(2)
      ),
      items: updatedItems,
    };

    handleTransactionFieldChange("subtotal", updatedTransaction.subtotal);
    handleTransactionFieldChange("discount", updatedTransaction.discount);
    handleTransactionFieldChange("grand_total", updatedTransaction.grand_total);
    handleTransactionFieldChange("amount_change", updatedTransaction.amount_change);
    handleTransactionFieldChange("due", updatedTransaction.due);
    handleTransactionFieldChange("items", updatedTransaction.items);
  }, [items, transaction.amount_paid, transaction.discount]);

  // Helper function to safely format numbers
  const formatNumber = (value) => {
    const num = Number(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "Invalid date";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  // Helper function to get payment status
  const getPaymentStatus = () => {
    const due = Number(transaction?.due);
    const grandTotal = Number(transaction?.grand_total);
    if (isNaN(due) || isNaN(grandTotal)) return "Unknown";
    if (due <= 0) return "Paid";
    if (due < grandTotal) return "Partial";
    return "Unpaid";
  };

  const handlePrintInvoice = async () => {
    if (!createdTransactionId) {
      toast.error("No transaction ID available for printing.");
      return;
    }
    setIsPrintLoading(true);

    try {
      const accessToken = Cookies.get("accessToken");
      if (!accessToken) throw new Error("Authentication required");

      // Fetch invoice data from the API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}invoice/retrieve/${transaction.shop}/${createdTransactionId}/`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch invoice data");
      const invoiceData = await response.json();

      // Create iframe for printing
      let iframe = document.getElementById("print-iframe");
      if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.id = "print-iframe";
        iframe.style.display = "none"; // Hide the iframe
        document.body.appendChild(iframe);
      }

      const printContent = iframe.contentWindow.document;
      printContent.open();
      printContent.write(`
        <html>
          <head>
            <title>Invoice ${invoiceData.transaction_id}</title>
            <style>
              body {
                font-family: monospace; /* Better for POS printers */
                width: 100%; /* Flexible for 58mm or 80mm rolls */
                max-width: 80mm; /* Upper limit for most POS printers */
                font-size: 10px; /* Compact for small rolls */
                margin: 0;
                padding: 5px;
                line-height: 1.2; /* Tight spacing */
              }
              .invoice-header {
                text-align: center;
                margin-bottom: 8px;
              }
              .invoice-title {
                font-size: 12px;
                font-weight: bold;
              }
              .shop-name {
                font-size: 11px;
                font-weight: bold;
              }
              .invoice-id {
                font-size: 9px;
              }
              .details {
                margin-bottom: 8px;
              }
              .section-title {
                font-weight: bold;
                margin-bottom: 3px;
              }
              table {
                width: 100%;
                margin-bottom: 8px;
              }
              th, td {
                padding: 2px;
                text-align: left;
              }
              th {
                font-weight: bold;
              }
              .text-right {
                text-align: right;
              }
              .font-bold {
                font-weight: bold;
              }
              .divider {
                border-top: 1px dashed #000;
                margin: 5px 0;
              }
            </style>
          </head>
          <body>
            <div class="invoice-header">
              <h1 class="invoice-title">Invoice  <span class="invoice-id">${invoiceData.transaction_id}</span></h1>
              <p class="shop-name">${selectShop?.name || "N/A"}</p>
            </div>
            <div class="details">
              <div class="section-title">Date: <span>${formatDate(invoiceData.created_at)}</span></div>
              <div class="section-title">Payment Method: <span>${invoiceData.payment_method || "N/A"}</span></div>
              <div class="section-title">Status: <span>${getPaymentStatus()}</span></div>
            </div>
            <div class="divider"></div>
            <div class="details">
              <div class="section-title">Customer</div>
              <p>${invoiceData.customer_name || "N/A"}</p>
              <p>Phone: ${invoiceData.customer_phone_number || "N/A"}</p>
              ${
                invoiceData.mobile_banking_phone
                  ? `<p>Mobile: ${invoiceData.mobile_banking_phone}</p>`
                  : ""
              }
              ${invoiceData.note ? `<p>Note: ${invoiceData.note}</p>` : ""}
            </div>
            <div class="divider"></div>
            <div class="details">
              <div class="section-title">Items</div>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th class="text-right">Qty</th>
                    <th class="text-right">Price</th>
                    <th class="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoiceData.items
                    ?.map(
                      (item) => `
                    <tr>
                      <td>${item.product_name || "N/A"}</td>
                      <td class="text-right">${item.quantity || "0"}</td>
                      <td class="text-right">৳ ${formatNumber(item.sell_price_per_quantity)}</td>
                      <td class="text-right">৳ ${formatNumber(item.total_discounted_amount)}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
            <div class="divider"></div>
            <div class="details">
              <div style="display: flex; justify-content: space-between;">
                <span>Subtotal</span>
                <span>৳ ${formatNumber(invoiceData.subtotal)}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Discount</span>
                <span>৳ ${formatNumber(invoiceData.discount)}</span>
              </div>
              <div class="divider"></div>
              <div style="display: flex; justify-content: space-between; font-weight: bold;">
                <span>Grand Total</span>
                <span>৳ ${formatNumber(invoiceData.grand_total)}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Paid</span>
                <span>৳ ${formatNumber(invoiceData.amount_paid)}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Change</span>
                <span>৳ ${formatNumber(invoiceData.amount_change)}</span>
              </div>
              <div class="divider"></div>
              <div style="display: flex; justify-content: space-between; font-weight: bold;">
                <span>Due</span>
                <span>৳ ${formatNumber(invoiceData.due)}</span>
              </div>
            </div>
            <div class="invoice-header">
              <h1 class="invoice-title">Thank You</h1>
            </div>
          </body>
        </html>
      `);
      printContent.close();

      // Wait for content to render before printing
      setTimeout(() => {
        try {
          iframe.contentWindow.print();
          setIsPrintLoading(false);
          // Clean up by removing the iframe after a short delay
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 1000);
        } catch (printError) {
          console.error("Error during printing:", printError);
          toast.error("Failed to trigger print. Check printer connection.");
          setIsPrintLoading(false);
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }
      }, 500);
    } catch (error) {
      console.error("Error printing invoice:", error);
      setIsPrintLoading(false);
      toast.error("Failed to load invoice for printing. Please try again.");
    }
  };

  return (
    <div className="w-full flex-shrink-0">
      <div className="grid grid-cols-2 gap-4 items-center text-sm">
        <span className="text-base font-semibold">Name</span>
        <Input
          type="text"
          className="w-full"
          placeholder="Enter name"
          value={transaction.name}
          onChange={(e) =>
            handleTransactionFieldChange("name", e.target.value)
          }
        />
      </div>
      <div className="mb-4">
        <div className="relative grid grid-cols-2 gap-4 items-center">
          <span className="font-semibold dark:text-white text-gray-700">
            Phone Number {is_POS && <span className="text-sm text-red-600">*</span>}
          </span>
          <div className="relative w-full">
            <Input
              className="border px-3 mt-5 py-2 bg-transparent focus:ring-0"
              placeholder="Enter number..."
              value={phoneSearchTerm}
              onChange={(e) => {
                setPhoneSearchTerm(e.target.value || "");
                setOpen(true);
              }}
              onBlur={() => {
                if (!filteredCustomers.some((c) => c.phone_number === phoneSearchTerm)) {
                  handleTransactionFieldChange(
                    "customer_phone_number",
                    phoneSearchTerm
                  );
                }
              }}
            />
            {phoneSearchTerm && open && filteredCustomers.length > 0 && (
              <div className="absolute top-14 z-10 w-full rounded mt-2 max-h-40 overflow-y-auto dark:bg-gray-700 bg-gray-300">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="p-2 dark:hover:bg-gray-300/30 hover:bg-gray-200 cursor-pointer"
                    onClick={() => {
                      handleSelectCustomer(customer);
                      setOpen(false);
                    }}
                  >
                    {customer.phone_number} -{" "}
                    {customer.name || `Customer #${customer.id}`}
                  </div>
                ))}
              </div>
            )}
          </div>
          <span className="font-semibold dark:text-white text-gray-700">Note</span>
          <Textarea
            id="note"
            placeholder="Add note about this order"
            value={transaction.note}
            onChange={(e) =>
              handleTransactionFieldChange("note", e.target.value)
            }
            className="min-h-[70px] w-full"
          />
        </div>
      </div>
      <div className="border-b my-2" />
      <div className="grid grid-cols-2 gap-4 items-center text-sm pb-4">
        <span className="text-base font-semibold">Subtotal</span>
        <span className="text-right font-semibold">৳ {formatNumber(transaction.subtotal)}</span>
        <span className="text-base font-semibold">Discount</span>
        <Input
          id="discount"
          name="discount"
          type="text"
          inputMode="decimal"
          pattern="[0-9]+(\.[0-9]{1,2})?"
          value={transaction.discount || ""}
          placeholder="Enter Total discount"
          onChange={(e) => {
            const value = e.target.value;
            if (value === "" || /^[0-9]+(\.[0-9]{1,2})?$/.test(value)) {
              handleTransactionFieldChange("discount", value ? Number(value) : "");
            }
          }}
          className="w-full text-sm lg:text-base h-10"
        />
      </div>
      <div className="flex justify-between text-lg font-bold border-b pb-2 mb-2">
        <span>Grand Total</span>
        <span>৳ {formatNumber(transaction.grand_total)}</span>
      </div>
      <div className="grid grid-cols-2 gap-4 items-center text-sm pb-4">
        <span className="text-base font-semibold">
          Amount Paid{" "}
          {!is_POS && <span className="text-sm text-red-600">*</span>}
        </span>
        <Input
          id="amount_paid"
          name="amount_paid"
          type="text"
          inputMode="decimal"
          pattern="[0-9]+(\.[0-9]{1,2})?"
          placeholder="Enter amount paid"
          value={transaction.amount_paid || ""}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "" || /^[0-9]+(\.[0-9]{1,2})?$/.test(value)) {
              handleTransactionFieldChange("amount_paid", value ? Number(value) : "");
            }
          }}
          required
          className="w-full text-sm lg:text-base h-10"
        />
        <span className="text-base font-semibold">Due</span>
        <span className="text-right font-semibold">৳ {formatNumber(transaction.due)}</span>
      </div>
      {transaction.amount_paid > transaction.grand_total && (
        <div className="text-green-600 font-bold text-lg text-right">
          Change to Return: ৳ {formatNumber(transaction.amount_paid - transaction.grand_total)}
        </div>
      )}
      {transaction.amount_paid < transaction.grand_total && !is_POS && (
        <div className="text-red-600 text-sm text-right mb-1.5">
          Full payment required for Quick Sale
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 items-center text-sm">
        <span className="text-base font-semibold">Payment Method</span>
        <Select
          value={localPaymentMethod}
          onValueChange={(value) => {
            setLocalPaymentMethod(value);
            handleTransactionFieldChange("payment_method", value);
          }}
        >
          <SelectTrigger id="payment_method">
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            {is_POS ? (
              <>
                {POS.map((method) =>
                  method ? (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ) : null
                )}
              </>
            ) : (
              <>
                {QuickSale.map((method, idx) =>
                  method ? (
                    <SelectItem key={idx} value={method}>
                      {method}
                    </SelectItem>
                  ) : null
                )}
              </>
            )}
          </SelectContent>
        </Select>
      </div>
      <div className="mt-4 flex items-center gap-2 flex-col">
        {shouldShowButton && (
          <Button
            className="w-full cursor-pointer bg-[var(--color-background-teal)] hover:bg-[var(--color-background-teal)] dark:bg-blue-500 text-white"
            disabled={isLoading}
            onClick={() =>
              createOrder(transaction, (result) => {
                if (result && result.transaction_id) {
                  setCreatedTransactionId(result.transaction_id);
                  setShowSuccessModal(true);
                } else {
                  console.error("No transaction_id returned from createOrder");
                }
              })
            }
          >
            {isLoading ? "Submitting..." : "Submit Order"}
          </Button>
        )}
      </div>
      {showSuccessModal && (
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Order Created Successfully</DialogTitle>
            </DialogHeader>
            <p>Your order has been created successfully.</p>
            <DialogFooter>
              <Button
                className="bg-[var(--color-background-teal)] hover:bg-[var(--color-background-teal)] dark:bg-blue-500 text-white"
                variant="secondary"
                onClick={() => {
                  router.push(`/inventory/invoice/${createdTransactionId}`);
                }}
              >
                View Invoice
              </Button>
              <Button
                className="bg-[var(--color-background-teal)] hover:bg-[var(--color-background-teal)] dark:bg-blue-500 text-white"
                variant="primary"
                onClick={handlePrintInvoice}
                disabled={isPrintLoading}
              >
                {isPrintLoading ? "Loading..." : "Invoice Print"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default OrderForm;