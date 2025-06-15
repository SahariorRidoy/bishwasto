"use client";
import React from "react";
import {
  useGetInvoiceListQuery
} from "@/features/invoiceApiSlice";
import Link from "next/link";
import CommonTable from "@/components/common/CommonTable";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";

const Page = () => {

  const shopId = useSelector((state) => state.shop?.selectedShop.id);
  const { data: invoiceLists, isFetching } = useGetInvoiceListQuery(shopId, {
    skip: !shopId,
  });

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
      <div className="h-full w-full  flex items-center justify-center">
        No invoices found.
      </div>
    );
  }

  const invoiceColumns = [
    { label: "Transaction ID", accessor: "transaction_id" },
    { label: "Phone No.", accessor: "customer_phone_number" },
    { label: "Payment Method", accessor: "payment_method" },
    { label: "Subtotal", accessor: (row) => `৳${row.subtotal}` },
    { label: "Grand Total", accessor: (row) => `৳${row.grand_total}` },
    { label: "Due", accessor: (row) => `৳${row.due}` },
    {
      label: "Date",
      accessor: (row) => new Date(row.created_at).toLocaleString(),
    },
    {
      label: "Actions",
      align: "right",
      render: (row) => (
        <Link
          href={`/inventory/invoice/${row.transaction_id}`}
         
        >
          <Button variant={'outline'} className={'cursor-pointer'}>View Details</Button>
        </Link>
      ),
    }
    
    // {
    //   label: "Actions",
    //   align: "right",
      
    //   render: (row) =>
    //     row.can_view ? (
    //       <Link
    //         href={`/invoice/${row.transaction_id}`}
    //         className="text-[#00ADB5] dark:text-blue-400 hover:text-[#02888f] dark:hover:text-blue-300"
    //       >
    //         View Description
    //       </Link>
    //     ) : (
    //       <span className="text-gray-400 dark:text-gray-500 italic">No access</span>
    //     ),
    // },
  ];
  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 dark:text-primarytext">Invoice List</h1>
      <CommonTable columns={invoiceColumns} isFetching={isFetching} data={invoiceLists}  />    
    </div>
  );
};

export default Page;
