"use client";

import { useGetSingleOrderQuery } from "@/features/orderApliSlice";
import { use } from "react";
import { Card } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSelector } from "react-redux";

export default function OrderDetailsPage({ params }) {
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
    
  const { transaction_id } = use(params);
  const shopId = useSelector((state) => state.shop?.selectedShop.id);
  const {
    data: singleOrder,
    error,
    isLoading,
  } = useGetSingleOrderQuery({
    shop_id: shopId,
    transaction_id: transaction_id,
  });
  return (
    <>
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Order Details</h1>
          <p className="text-muted-foreground">
            Transaction ID: 
            {singleOrder?.transaction_id}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-sm">
            {singleOrder?.method}
          </Badge>
          <Badge className="text-sm bg-[var(--color-background-teal)] text-white! dark:bg-blue-500">
            {singleOrder?.order_type}
          </Badge>
        </div>
      </div>

      {/* Order summary card */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer details */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Customer Information</h3>
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
                <span className="text-muted-foreground">Payment Method: </span>
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
        <Card className={'px-4'}>
          <Table >
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
                  <TableCell className="font-medium">{item.product_name}</TableCell>
                  <TableCell className="text-right">
                    {parseFloat(item.sell_price_per_quantity).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                     ৳ {parseFloat(item.discount_total).toFixed(2)} 
                    {item.discount_type === "percentage" && "" }
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
            <span className="text-red-500">{parseFloat(singleOrder?.due).toFixed(2)}</span>
          </div>
        </div>
      </Card>
    </div>
  </>
  );
}
