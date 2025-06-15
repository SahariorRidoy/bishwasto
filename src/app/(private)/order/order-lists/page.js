"use client";
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

export default function OrderList() {
  const shopId = useSelector((state) => state.shop?.selectedShop.id);
  const { data: orderLists } = useGetOrderListsQuery(shopId);

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
            {/* Dialog Button wrapped in Trigger */}
            <>
              {/* <Button
                onClick={() => setIsOpen(true)}
                className="bg-blue-500 text-white hover:bg-blue-600 hover:cursor-pointer"
              >
                Create Order
              </Button> */}

              {/* {isOpen && (
                <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                  <div className="relative rounded-xl   max-h-[90vh] overflow-y-auto overflow-x-auto w-fit ">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="absolute cursor-pointer z-40 bg-red-600 rounded-full p-1 top-32 right-10 text-gray-100 -"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <CreateOrder />
                  </div>
                </div>
              )} */}
            </>
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
                      <TableCell>
                        ৳ {parseFloat(order.grand_total).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        ৳ {parseFloat(order.amount_paid).toFixed(2)}
                      </TableCell>
                      <TableCell
                        className={
                          isCompleted ? "" : "text-destructive font-bold"
                        }
                      >
                        ৳ {parseFloat(order.due).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.method === "Cash" ? "secondary" : "outline"
                          }
                        >
                          {order.method}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          // variant={isCompleted ? "default" : "destructive"}
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
                        <Link
                          href={`/order/${order.transaction_id}`}
                          className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
                        >
                          <Info className="h-4 w-4" />
                          View
                        </Link>
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
