"use client";
import React, { use, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import { useGetSingleInvoiceQuery } from "@/features/invoiceApiSlice";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

const Page = ({ params }) => {
  const router = useRouter();
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
  const { transaction_id } = use(params);
  const componentRef = useRef();
  const shopId = useSelector((state) => state.shop?.selectedShop.id);
  const {
    data: singleInvoice,
    isLoading,
    error,
  } = useGetSingleInvoiceQuery({
    shop_id: shopId,
    transaction_id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen min-w-screen flex items-center justify-center">
        Loading invoices...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen min-w-screen flex items-center justify-center">
        Error Loading invoices...
      </div>
    );
  }

  const getPaymentStatus = () => {
    const due = parseFloat(singleInvoice?.due);
    const grandTotal = parseFloat(singleInvoice?.grand_total);

    if (due <= 0) return "Paid";
    if (due < grandTotal) return "Partial";
    return "Unpaid";
  };

  const getStatusColor = () => {
    const status = getPaymentStatus();
    if (status === "Paid") return "bg-green-100 text-green-800";
    if (status === "Partial") return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };
  return (
    <div className="">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          className="flex cursor-pointer items-center gap-2"
          onClick={() => router.push("/inventory/invoice/")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        {/* <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            Print Invoice
          </Button>

          <Button>Download PDF</Button>
        </div> */}
      </div>

      <div ref={componentRef} className="overflow-hidden border-0 shadow-lg">
        {/* Header */}
        <div className="dark:bg-[#101f3d] p-6 text-primary-foreground rounded-t-3xl">
          <div className="flex flex-col sm:flex-row justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1 text-primary dark:text-primarytext">
                Invoice
              </h1>
              <p className="text-primary dark:text-secondarytext text-sm">
                {singleInvoice?.transaction_id}
              </p>
            </div>
            <div className="mt-4 sm:mt-0 text-right">
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
              >
                {singleInvoice?.order_type}
              </span>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between mb-8">
            <div className="mb-6 sm:mb-0">
              <h2 className="text-sm font-medium text-gray-500 mb-1">
                Date Issued
              </h2>
              <p className="font-medium">
                {formatDate(singleInvoice?.created_at)}
              </p>
            </div>
            <div className="mb-6 sm:mb-0">
              <h2 className="text-sm font-medium text-gray-500 mb-1">
                Payment Method
              </h2>
              <p className="font-medium">{singleInvoice?.payment_method}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500 mb-1">Status</h2>
              <span
                className={`inline-flex px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusColor()}`}
              >
                {getPaymentStatus()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <Card className={"p-4 "}>
              <h2 className="text-sm font-medium dark:text-secondarytext text-gray-500 mb-3">
                Customer Details
              </h2>
              <div className="rounded-lg">
                {singleInvoice?.name && (
                  <p className="font-medium mb-1">{singleInvoice?.name}</p>
                )}
                <p className="dark:text-secondarytext text-gray-500">
                  Phone: {singleInvoice?.customer_phone_number}
                </p>
                {singleInvoice?.mobile_banking_phone && (
                  <p className="text-gray-700">
                    Mobile Banking: {singleInvoice?.mobile_banking_phone}
                  </p>
                )}
                {singleInvoice?.note && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      {singleInvoice?.note}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            <Card className={"p-4 "}>
              <h2 className="text-sm font-medium text-gray-500 mb-3">
                Payment Information
              </h2>
              <div className=" p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span>৳ {singleInvoice?.subtotal}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Discount</span>
                  <span>৳ {singleInvoice?.discount}</span>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between font-medium">
                  <span>Grand Total</span>
                  <span>৳ {singleInvoice?.grand_total}</span>
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-gray-600">Paid Amount</span>
                  <span>৳ {singleInvoice?.amount_paid}</span>
                </div>
                <div className="flex justify-between mt-1 text-sm">
                  <span className="text-gray-600">Change</span>
                  <span>৳ {singleInvoice?.amount_change}</span>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between font-bold">
                  <span>Due Amount</span>
                  <span>৳ {singleInvoice?.due}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Items Table */}
          <h2 className="text-lg font-semibold mb-4">Order Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className=" text-gray-600">
                <tr className=" dark:text-secondarytext">
                  <th className="px-4 py-3 text-left">Item</th>
                  <th className="px-4 py-3 text-right">Unit Price</th>
                  <th className="px-4 py-3 text-right">Quantity</th>
                  <th className="px-4 py-3 text-right">Discount</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {singleInvoice?.items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="font-medium">{item.product_name}</div>
                      <div className="text-xs text-gray-500">
                        Stock: {item.product_stock}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      ৳ {item.sell_price_per_quantity}
                    </td>
                    <td className="px-4 py-4 text-right">{item.quantity}</td>
                    <td className="px-4 py-4 text-right">
                      <div>৳ {item.discount_total}</div>
                      <div className="text-xs text-gray-500">
                        {item.discount_type}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right font-medium">
                      ৳ {item.total_discounted_amount}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className=" font-medium">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-right">
                    Total
                  </td>
                  <td className="px-4 py-3 text-right">
                    ৳ {singleInvoice?.grand_total}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
