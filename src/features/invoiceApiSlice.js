import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

export const invoiceApi = createApi({
  reducerPath: "invoiceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers) => {
      const token = Cookies.get("accessToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getInvoiceList: builder.query({
      query: (shop_id) => `invoice/list/${shop_id}/`,
    }),
    getSingleInvoice: builder.query({
      query: ({ shop_id, transaction_id }) =>
        `invoice/retrieve/${shop_id}/${transaction_id}/`,
    }),
    updateInvoice: builder.mutation({
      query: ({ shop_id, transaction_id, body }) => ({
        url: `invoice/retrieve/${shop_id}/${transaction_id}/`,
        method: "PATCH",
        body,
      }),
    }),
  }),
});

export const {
  useGetInvoiceListQuery,
  useGetSingleInvoiceQuery,
  useUpdateInvoiceMutation,
} = invoiceApi;
