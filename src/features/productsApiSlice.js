import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

export const productsApi = createApi({
  reducerPath: "productsApi",
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
  tagTypes: ["InventoryProducts", "GlobalProducts"],
  endpoints: (builder) => ({
    getGlobalProducts: builder.query({
      query: () => `products/`,
      providesTags: ["GlobalProducts"],
    }),
    postGlobalProducts: builder.mutation({
      query: (data) => ({
        url: "/products/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["GlobalProducts"],
    }),
    getProductById: builder.query({
      query: (id) => `products/${id}/`,
      providesTags: (result, error, id) => [{ type: "GlobalProducts", id }],
    }),
    getCategories: builder.query({
      query: () => `products/categories/`,
    }),
    getUoms: builder.query({
      query: () => `products/uoms/`,
    }),
    getInventoryProducts: builder.query({
      query: () => `inventory/productStock/`,
      providesTags: ["InventoryProducts"],
    }),
    getInventoryProductsByShop: builder.query({
      query: (shopId) => `inventory/productStock/?shop=${shopId}`,
      providesTags: ["InventoryProducts"],
    }),
    getInventoryProductById: builder.query({
      query: (id) => `inventory/productStock/${id}/`,
      providesTags: (result, error, id) => [{ type: "InventoryProducts", id }],
    }),
    updateInventoryProduct: builder.mutation({
      query: ({ id, data }) => ({
        url: `inventory/productStock/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "InventoryProducts", id },
        "InventoryProducts",
      ],
    }),
    deleteInventoryProduct: builder.mutation({
      query: (id) => ({
        url: `inventory/productStock/${id}/deactivate/`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "InventoryProducts", id },
        "InventoryProducts",
      ],
    }),
    postInventoryProducts: builder.mutation({
      query: (data) => ({
        url: `inventory/productStock/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["InventoryProducts"],
    }),
  }),
});

export const {
  useGetGlobalProductsQuery,
  usePostGlobalProductsMutation,
  useGetProductByIdQuery,
  useGetCategoriesQuery,
  useGetUomsQuery,
  useGetInventoryProductsQuery,
  useGetInventoryProductsByShopQuery,
  useGetInventoryProductByIdQuery,
  useUpdateInventoryProductMutation,
  useDeleteInventoryProductMutation,
  usePostInventoryProductsMutation,
} = productsApi;