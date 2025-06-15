"use client";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

// Define the SMS API slice
export const smsApi = createApi({
  reducerPath: "smsApi",
  tagTypes: ["PurchaseHistory", "SmsCount"],
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers) => {
      const token = Cookies.get("accessToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getSmsPackages: builder.query({
      query: () => "sms/packages/",
      transformResponse: (response) => {
        return response.results || [];
      },
    }),
    getSmsCount: builder.query({
      query: (shopId) => {
        return `sms/count/${shopId}/`;
      },
      transformResponse: (response) => {
        // Handle cases where response is empty or error
        if (!response || response.results?.length === 0) {
          return { sms_count: 0 }; // Return default object for no SMS count
        }
        return response.results ? response.results[0] : response || { sms_count: 0 };
      },
      transformErrorResponse: (error) => {
        return { error: error.data?.message || "Failed to fetch SMS count", status: error.status };
      },
      providesTags: (result, error, shopId) => [{ type: "SmsCount", id: shopId }],
    }),
    getPurchaseHistory: builder.query({
      query: () => "sms/purchase/list/",
      transformResponse: (response) => {
        return response.results || [];
      },
      providesTags: (result, error, shopId) => [{ type: "PurchaseHistory", id: shopId }],
    }),
    createPurchase: builder.mutation({
      query: ({ shop, package_id, payment_method }) => ({
        url: "sms/purchase/create/",
        method: "POST",
        body: { shop, package_id, payment_method },
      }),
      invalidatesTags: (result, error, { shop }) => [{ type: "PurchaseHistory", id: shop }],
    }),
    submitTransactionId: builder.mutation({
      query: ({ requestId, transaction_id }) => ({
        url: `sms/purchase/transaction/${requestId}/`,
        method: "PUT",
        body: { transaction_id },
      }),
      invalidatesTags: (result, error, { requestId, shopId }) => [
        { type: "PurchaseHistory", id: shopId },
        { type: "SmsCount", id: shopId },
      ],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetSmsPackagesQuery,
  useGetSmsCountQuery,
  useGetPurchaseHistoryQuery,
  useCreatePurchaseMutation,
  useSubmitTransactionIdMutation,
} = smsApi;