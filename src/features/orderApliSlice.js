import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

export const orderApi = createApi({
  reducerPath: "orderApi",
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
    createOrder: builder.mutation({
      query: (data) => ({
        url: `order/create/`,
        method: "POST",
        body: data,
      }),
    }),
    getOrderLists: builder.query({
      query: (id) => `order/list/${id}/`,
    }),
    getSingleOrder: builder.query({
      query: ({shop_id, transaction_id}) => `order/retrieve/${shop_id}/${transaction_id}/`,
    }),
  }),
});

export const { useCreateOrderMutation, useGetOrderListsQuery, useGetSingleOrderQuery } = orderApi;
