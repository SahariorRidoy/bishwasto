"use client";
import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetOrderListsQuery } from "@/features/orderApliSlice";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

export default function OrderList() {
  const selectedShop = useSelector((state) => state.shop?.selectedShop);
  const shopId = selectedShop?.id;
  const { data: orderLists } = useGetOrderListsQuery(shopId);
  const [isPrintLoading, setIsPrintLoading] = useState({});

  // Helper functions
  const formatNumber = (value) => {
    const num = Number(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

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

  const getPaymentStatus = (invoice) => {
    const due = Number(invoice?.due);
    const grandTotal = Number(invoice?.grand_total);
    if (isNaN(due) || isNaN(grandTotal)) return "Unknown";
    if (due <= 0) return "Paid";
    if (due < grandTotal) return "Partial";
    return "Unpaid";
  };

  const handlePrintInvoice = async (transactionId) => {
    if (!transactionId) {
      toast.error("No transaction ID available for printing.");
      return;
    }
    setIsPrintLoading((prev) => ({ ...prev, [transactionId]: true }));

    try {
      const accessToken = Cookies.get("accessToken");
      if (!accessToken) throw new Error("Authentication required");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}invoice/retrieve/${shopId}/${transactionId}/`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch invoice data");
      const invoiceData = await response.json();

      let iframe = document.getElementById(`print-iframe-${transactionId}`);
      if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.id = `print-iframe-${transactionId}`;
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
                  ${invoiceData.items?.map(item => `
                    <tr>
                      <td>${item.product_name || "N/A"}</td>
                      <td class="text-right">${item.quantity || "0"}</td>
                      <td class="text-right">৳ ${formatNumber(item.sell_price_per_quantity)}</td>
                      <td class="text-right">৳ ${formatNumber(item.total_discounted_amount)}</td>
                    </tr>
                  `).join("")}
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
          setIsPrintLoading((prev) => ({ ...prev, [transactionId]: false }));
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 1000);
        } catch (printError) {
          console.error("Error during printing:", printError);
          toast.error("Failed to trigger print. Check printer connection.");
          setIsPrintLoading((prev) => ({ ...prev, [transactionId]: false }));
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }
      }, 500);
    } catch (error) {
      console.error("Error printing invoice:", error);
      setIsPrintLoading((prev) => ({ ...prev, [transactionId]: false }));
      toast.error("Failed to load invoice for printing. Please try again.");
    }
  };

  return (
    <div className="py-8">
      <Card className="backdrop-blur-sm border shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-muted-foreground" />
              <CardTitle className="text-2xl font-bold dark:text-primarytext">
                Orders Overview
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Grand Total</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Details</TableHead>
                  <TableHead className="text-center">Print</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderLists?.map((order) => {
                  const isCompleted = parseFloat(order.due) === 0;
                  const orderStatus = isCompleted ? "Completed" : "Pending";

                  return (
                    <TableRow key={order.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>{order.customer_phone_number}</TableCell>
                      <TableCell>৳ {parseFloat(order.grand_total).toFixed(2)}</TableCell>
                      <TableCell>৳ {parseFloat(order.amount_paid).toFixed(2)}</TableCell>
                      <TableCell className={isCompleted ? "" : "text-destructive font-bold"}>
                        ৳ {parseFloat(order.due).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.method === "Cash" ? "secondary" : "outline"}>
                          {order.method}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            isCompleted
                              ? "bg-green-600/50 text-white hover:bg-green-600"
                              : "bg-yellow-500/90 text-yellow-200 hover:bg-yellow-600"
                          }
                        >
                          {orderStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                       <Button className={" cursor-pointer bg-[#00ADB5] text-white hover:text-white hover:bg-[#67a7aa] dark:bg-blue-500 "} variant="outline">
                         <Link
                          href={`/order/${order.transaction_id}`}
                          className=" inline-flex items-center gap-1 text-sm font-medium hover:underline"
                        >
                          <Info className="h-4 w-4" />
                          View
                        </Link>
                       </Button>

                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          onClick={() => handlePrintInvoice(order.transaction_id)}
                          disabled={isPrintLoading[order.transaction_id]}
                          className=" cursor-pointer bg-[#00ADB5] text-white hover:bg-[#67a7aa] dark:bg-blue-500 dark:hover:bg-blue-00 w-[100px] h-8 flex items-center justify-center text-sm"
                        >
                          {isPrintLoading[order.transaction_id] ? (
                            <span className="truncate">Loading...</span>
                          ) : (
                            "Print"
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex justify-end">
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              Back to dashboard
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}