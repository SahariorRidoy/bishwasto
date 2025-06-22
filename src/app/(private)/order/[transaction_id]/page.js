"use client";

import { useState } from "react";
import { useGetSingleOrderQuery } from "@/features/orderApliSlice";
import { use } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

export default function OrderDetailsPage({ params }) {
  const selectedShop = useSelector((state) => state.shop?.selectedShop);
  const shopId = selectedShop?.id;
  const { transaction_id } = use(params);
  const {
    data: singleOrder,
    error,
    isLoading,
  } = useGetSingleOrderQuery({
    shop_id: shopId,
    transaction_id: transaction_id,
  });
  const [isPrintLoading, setIsPrintLoading] = useState(false);

  // Format date to a more readable format
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

  // Helper function to format number
  const formatNumber = (value) => {
    const num = Number(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  // Helper function to get payment status
  const getPaymentStatus = (order) => {
    const due = Number(order?.due);
    const grandTotal = Number(order?.grand_total);
    if (isNaN(due) || isNaN(grandTotal)) return "Unknown";
    if (due <= 0) return "Paid";
    if (due < grandTotal) return "Partial";
    return "Unpaid";
  };

  const handlePrintInvoice = async () => {
    if (!transaction_id) {
      toast.error("No transaction ID available for printing.");
      return;
    }
    setIsPrintLoading(true);

    try {
      const accessToken = Cookies.get("accessToken");
      if (!accessToken) throw new Error("Authentication required");

      // Fetch invoice data from the API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}invoice/retrieve/${shopId}/${transaction_id}/`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch invoice data");
      const invoiceData = await response.json();

      // Create iframe for printing
      let iframe = document.getElementById(`print-iframe-${transaction_id}`);
      if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.id = `print-iframe-${transaction_id}`;
        iframe.style.display = "none";
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
              .divider {
                border-top: 1px dashed #000;
                margin: 5px 0;
              }
            </style>
          </head>
          <body>
            <div class="invoice-header">
              <h1 class="invoice-title">Invoice <span class="invoice-id">${invoiceData.transaction_id}</span></h1>
              <p class="shop-name">${selectedShop?.name || "N/A"}</p>
            </div>
            <div class="details">
              <div class="section-title">Date: <span>${formatDate(invoiceData.created_at)}</span></div>
              <div class="section-title">Payment Method: <span>${invoiceData.payment_method || "N/A"}</span></div>
              <div class="section-title">Status: <span>${getPaymentStatus(invoiceData)}</span></div>
            </div>
            <div class="divider"></div>
            <div class="details">
              <div class="section-title">Customer</div>
              <p>${invoiceData.customer_name || "N/A"}</p>
              <p>Phone: ${invoiceData.customer_phone_number || "N/A"}</p>
              ${invoiceData.mobile_banking_phone ? `<p>Mobile: ${invoiceData.mobile_banking_phone}</p>` : ""}
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
      <div className="h-full w-full flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }

  if (error || !singleOrder) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-600 dark:text-gray-400">
        Failed to load order details.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Order Details</h1>
            <p className="text-muted-foreground">
              Transaction ID: {singleOrder?.transaction_id}
            </p>
          </div>
          <div>
             <Button
              onClick={handlePrintInvoice}
              disabled={isPrintLoading}
              className=" cursor-pointer bg-[#00ADB5] text-white hover:bg-[#67a7aa]  dark:bg-blue-500 dark:hover:bg-blue-600 w-[100px] h-8 flex items-center justify-center text-sm"
            >
              {isPrintLoading ? (
                <span className="truncate">Loading...</span>
              ) : (
                "Print"
              )}
            </Button>
          </div>
          <div className="flex gap-2 items-center">
            <Badge variant="outline" className="text-sm">
              {singleOrder?.method}
            </Badge>
            <Badge className="text-sm bg-[var(--color-background-teal)] text-white dark:bg-blue-500">
              {singleOrder?.order_type}
            </Badge>
            
          </div>
        </div>

        {/* Order summary card */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer details */}
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Customer Information
              </h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Phone: </span>
                  {singleOrder?.customer_phone_number || "Not provided"}
                </p>
                <p>
                  <span className="text-muted-foreground">Name: </span>
                  {singleOrder?.name || "Not provided"}
                </p>
              </div>
            </div>

            {/* Order details */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Order Information</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Date: </span>
                  {formatDate(singleOrder?.created_at)}
                </p>
                <p>
                  <span className="text-muted-foreground">
                    Payment Method:{" "}
                  </span>
                  {singleOrder?.method}
                </p>
                {singleOrder?.note && (
                  <p>
                    <span className="text-muted-foreground">Note: </span>
                    {singleOrder?.note}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Order items */}
        <div className="">
          <h3 className="font-semibold text-lg mb-4">Order Items</h3>
          <Card className="px-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Discount</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {singleOrder?.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {item.product_name}
                    </TableCell>
                    <TableCell className="text-right">
                      {parseFloat(item.sell_price_per_quantity).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      ৳ {parseFloat(item.discount_total).toFixed(2)}
                      {item.discount_type === "percentage" && ""}
                    </TableCell>
                    <TableCell className="text-right">
                      {parseFloat(item.total_discounted_amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Order totals */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{parseFloat(singleOrder?.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span>-{parseFloat(singleOrder?.discount).toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <span>Grand Total</span>
              <span>{parseFloat(singleOrder?.grand_total).toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount Paid</span>
              <span>{parseFloat(singleOrder?.amount_paid).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Change</span>
              <span>{parseFloat(singleOrder?.amount_change).toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <span>Due Amount</span>
              <span className="text-red-500">
                {parseFloat(singleOrder?.due).toFixed(2)}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}