
"use client";
import React, { use, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import { useGetSingleInvoiceQuery } from "@/features/invoiceApiSlice";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const Page = ({ params }) => {
  const router = useRouter();
  const { transaction_id } = use(params); // Unwrap params with React.use()
  const componentRef = useRef();
  const shopId = useSelector((state) => state.shop?.selectedShop.id);
  const selectShop = useSelector((state) => state.shop?.selectedShop);
  const { data: singleInvoice, isLoading, error } = useGetSingleInvoiceQuery({
    shop_id: shopId,
    transaction_id,
  });
  const [isPrintLoading, setIsPrintLoading] = useState(false);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "Invalid date";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  // Format number helper
  const formatNumber = (value) => {
    const num = Number(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  // Get payment status
  const getPaymentStatus = () => {
    const due = parseFloat(singleInvoice?.due);
    const grandTotal = parseFloat(singleInvoice?.grand_total);
    if (due <= 0) return "Paid";
    if (due < grandTotal) return "Partial";
    return "Unpaid";
  };

  // Get status color
  const getStatusColor = () => {
    const status = getPaymentStatus();
    if (status === "Paid") return "bg-green-100 text-green-800";
    if (status === "Partial") return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  // Handle print invoice
  const handlePrintInvoice = () => {
    if (!singleInvoice?.transaction_id) {
      toast.error("No transaction ID available for printing.");
      return;
    }
    setIsPrintLoading(true);

    try {
      let iframe = document.getElementById(`print-iframe-${singleInvoice.transaction_id}`);
      if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.id = `print-iframe-${singleInvoice.transaction_id}`;
        iframe.style.display = "none";
        document.body.appendChild(iframe);
      }

      const printContent = iframe.contentWindow.document;
      printContent.open();
      printContent.write(`
        <html>
          <head>
            <title>Invoice ${singleInvoice.transaction_id}</title>
            <style>
              body {
                font-family: monospace;
                width: 100%;
                max-width: 80mm;
                font-size: 10px;
                margin: 0;
                padding: 5px;
                line-height: 1.2;
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
              <h1 class="invoice-title">Invoice <span class="invoice-id">${singleInvoice.transaction_id}</span></h1>
              <p class="shop-name">${selectShop?.name || "N/A"}</p>
            </div>
            <div class="details">
              <div class="section-title">Date: <span>${formatDate(singleInvoice.created_at)}</span></div>
              <div class="section-title">Payment Method: <span>${singleInvoice.payment_method || "N/A"}</span></div>
              <div class="section-title">Status: <span>${getPaymentStatus()}</span></div>
              ${singleInvoice.order_type ? `<div class="section-title">Order Type: <span>${singleInvoice.order_type}</span></div>` : ""}
            </div>
            <div class="divider"></div>
            <div class="details">
              <div class="section-title">Customer</div>
              <p>${singleInvoice.customer_name || "N/A"}</p>
              <p>Phone: ${singleInvoice.customer_phone_number || "N/A"}</p>
              ${singleInvoice.mobile_banking_phone ? `<p>Mobile: ${singleInvoice.mobile_banking_phone}</p>` : ""}
              ${singleInvoice.note ? `<p>Note: ${singleInvoice.note}</p>` : ""}
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
                  ${singleInvoice.items
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
                <span>৳ ${formatNumber(singleInvoice.subtotal)}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Discount</span>
                <span>৳ ${formatNumber(singleInvoice.discount)}</span>
              </div>
              <div class="divider"></div>
              <div style="display: flex; justify-content: space-between; font-weight: bold;">
                <span>Grand Total</span>
                <span>৳ ${formatNumber(singleInvoice.grand_total)}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Paid</span>
                <span>৳ ${formatNumber(singleInvoice.amount_paid)}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Change</span>
                <span>৳ ${formatNumber(singleInvoice.amount_change)}</span>
              </div>
              <div class="divider"></div>
              <div style="display: flex; justify-content: space-between; font-weight: bold;">
                <span>Due</span>
                <span>৳ ${formatNumber(singleInvoice.due)}</span>
              </div>
            </div>
            <div class="invoice-header">
              <h1 class="invoice-title">Thank You</h1>
            </div>
          </body>
        </html>
      `);
      printContent.close();

      setTimeout(() => {
        try {
          iframe.contentWindow.print();
          setIsPrintLoading(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 dark:text-gray-400">
        Loading invoice...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 dark:text-red-400">
        Error loading invoice...
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          className="flex cursor-pointer items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => router.push("/inventory/invoice/")}
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back 
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className={`cursor-pointer bg-[#00ADB5] text-white hover:text-white hover:bg-[#008C93] dark:bg-blue-500 dark:hover:bg-blue-600 ${
              isPrintLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handlePrintInvoice}
            disabled={isPrintLoading}
          >
            {isPrintLoading ? "Printing..." : "Print Invoice"}
          </Button>
        </div>
      </div>

      {/* Invoice Container */}
      <Card ref={componentRef} className="border-0 shadow-lg bg-white dark:bg-gray-800">
        {/* Invoice Header */}
        <div className="bg-[#00ADB5] dark:bg-[#101f3d] p-8 rounded-t-lg text-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Invoice Details</h1>
              <p className="text-sm opacity-90">{singleInvoice?.transaction_id}</p>
            </div>
            {singleInvoice?.order_type && (
              <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-white/20">
                {singleInvoice?.order_type}
              </span>
            )}
          </div>
        </div>

        {/* Invoice Body */}
        <div className="p-8">
          {/* Invoice Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <div>
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Date Issued</h2>
              <p className="font-semibold text-gray-800 dark:text-gray-200">
                {formatDate(singleInvoice?.created_at)}
              </p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Payment Method</h2>
              <p className="font-semibold text-gray-800 dark:text-gray-200">
                {singleInvoice?.payment_method || "N/A"}
              </p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Status</h2>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
                {getPaymentStatus()}
              </span>
            </div>
          </div>
 {/* Items Table */}
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Order Items</h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
            <table className="w-full text-sm text-gray-800 dark:text-gray-200">
              <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Item</th>
                  <th className="px-6 py-4 text-right font-semibold">Unit Price</th>
                  <th className="px-6 py-4 text-right font-semibold">Quantity</th>
                  <th className="px-6 py-4 text-right font-semibold">Discount</th>
                  <th className="px-6 py-4 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {singleInvoice?.items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="font-medium">{item.product_name || "N/A"}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Stock: {item.product_stock || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">৳ {formatNumber(item.sell_price_per_quantity)}</td>
                    <td className="px-6 py-4 text-right">{item.quantity || "0"}</td>
                    <td className="px-6 py-4 text-right">
                      <div>৳ {formatNumber(item.discount_total)}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      ৳ {formatNumber(item.total_discounted_amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 dark:bg-gray-700 font-semibold">
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-right">Total</td>
                  <td className="px-6 py-4 text-right">৳ {formatNumber(singleInvoice?.grand_total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          {/* Customer and Payment Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
            <Card className="p-6 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Customer Details</h2>
              {singleInvoice?.customer_name && (
                <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">{singleInvoice?.customer_name}</p>
              )}
              <p className="text-gray-600 dark:text-gray-400">Phone: {singleInvoice?.customer_phone_number || "N/A"}</p>
              {singleInvoice?.mobile_banking_phone && (
                <p className="text-gray-600 dark:text-gray-400">Mobile Banking: {singleInvoice?.mobile_banking_phone}</p>
              )}
              {singleInvoice?.note && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Note: {singleInvoice?.note}</p>
                </div>
              )}
            </Card>
            <Card className="p-6 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Payment Information</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="text-gray-800 dark:text-gray-200">৳ {formatNumber(singleInvoice?.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Discount</span>
                  <span className="text-gray-800 dark:text-gray-200">৳ {formatNumber(singleInvoice?.discount)}</span>
                </div>
                <Separator className="my-3 bg-gray-200 dark:bg-gray-600" />
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-800 dark:text-gray-200">Grand Total</span>
                  <span className="text-gray-800 dark:text-gray-200">৳ {formatNumber(singleInvoice?.grand_total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Paid Amount</span>
                  <span className="text-gray-800 dark:text-gray-200">৳ {formatNumber(singleInvoice?.amount_paid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Change</span>
                  <span className="text-gray-800 dark:text-gray-200">৳ {formatNumber(singleInvoice?.amount_change)}</span>
                </div>
                <Separator className="my-3 bg-gray-200 dark:bg-gray-600" />
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-800 dark:text-gray-200">Due Amount</span>
                  <span className="text-gray-800 dark:text-gray-200">৳ {formatNumber(singleInvoice?.due)}</span>
                </div>
              </div>
            </Card>
          </div>

         
        </div>
      </Card>
    </div>
  );
};

export default Page;
