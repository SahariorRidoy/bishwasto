"use client";
import React, { useState } from "react";
import { useGetInvoiceListQuery } from "@/features/invoiceApiSlice";
import Link from "next/link";
import CommonTable from "@/components/common/CommonTable";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

const Page = () => {
  const shopId = useSelector((state) => state.shop?.selectedShop.id);
  const selectShop = useSelector((state) => state.shop?.selectedShop);
  const { data: invoiceLists, isFetching } = useGetInvoiceListQuery(shopId, {
    skip: !shopId,
  });
  const [isPrintLoading, setIsPrintLoading] = useState({});

  console.log(invoiceLists, "invoiceLists");

  if (isFetching) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }

  if (invoiceLists?.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-600 dark:text-gray-400">
        No invoices found.
      </div>
    );
  }

  // Helper function to format number
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

      // Fetch invoice data from the API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}invoice/retrieve/${shopId}/${transactionId}/`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch invoice data");
      const invoiceData = await response.json();

      // Create iframe for printing
      let iframe = document.getElementById(`print-iframe-${transactionId}`);
      if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.id = `print-iframe-${transactionId}`;
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
              <h1 class="invoice-title">Invoice <span class="invoice-id">${invoiceData.transaction_id}</span></h1>
              <p class="shop-name">${selectShop?.name || "N/A"}</p>
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
          setIsPrintLoading((prev) => ({ ...prev, [transactionId]: false }));
          // Clean up by removing the iframe after a short delay
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

  const invoiceColumns = [
    {
      label: "Transaction ID",
      accessor: "transaction_id",
      className: "text-gray-800 dark:text-gray-200 font-medium",
    },
    {
      label: "Phone No.",
      accessor: "customer_phone_number",
      className: "text-gray-800 dark:text-gray-200",
    },
    {
      label: "Payment Method",
      accessor: "payment_method",
      className: "text-gray-800 dark:text-gray-200",
    },
    {
      label: "Grand Total",
      accessor: (row) => (
        <span className="font-bold">
          ৳{row.grand_total}
        </span>
      ),
      className: "text-gray-800 dark:text-gray-200",
    },
    {
      label: "Due",
      accessor: (row) => (
        <span
          className={`font-bold ${
            row.due > 0 ? "text-red-600 dark:text-red-400" : "text-green-500 dark:text-green-300"
          }`}
        >
          ৳{row.due}
        </span>
      ),
      className: "text-gray-800 dark:text-gray-200",
    },
    {
      label: "Date",
      accessor: (row) => (
        <span className="text-gray-600 dark:text-gray-400">
          {new Date(row.created_at).toLocaleString()}
        </span>
      ),
      className: "text-gray-600 dark:text-gray-400",
    },
    {
      label: "Print",
      align: "right",
      render: (row) => (
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            className={`cursor-pointer bg-[#00ADB5] text-white hover:bg-[#6dc7ccf6] hover:text-white dark:bg-blue-500 dark:hover:bg-blue-700 ${
              isPrintLoading[row.transaction_id] ? "bg-gray-400 dark:bg-gray-500" : ""
            }`}
            onClick={() => handlePrintInvoice(row.transaction_id)}
            disabled={isPrintLoading[row.transaction_id]}
          >
            {isPrintLoading[row.transaction_id] ? "Loading..." : "Print Invoice"}
          </Button>
        </div>
      ),
    },
    {
      label: "Actions",
      align: "right",
      render: (row) => (
        <div className="flex gap-2 justify-end">
          <Link href={`/inventory/invoice/${row.transaction_id}`}>
            <Button
              variant="outline"
              className="cursor-pointer bg-[#00ADB5] text-white hover:bg-[#6dc7ccf6] hover:text-white dark:bg-blue-500 dark:hover:bg-blue-700"
            >
              View Details
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 max-w-full mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        Invoice List
      </h1>
      <CommonTable
        columns={invoiceColumns}
        isFetching={isFetching}
        data={invoiceLists}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm"
        rowClassName="odd:bg-gray-50 dark:odd:bg-gray-900 text-gray-800 dark:text-gray-200"
        headerClassName="bg-gray-100 dark:bg-gray-700 font-bold text-gray-800 dark:text-gray-200"
      />
    </div>
  );
};

export default Page;