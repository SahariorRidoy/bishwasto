import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

export const shopApi = createApi({
  reducerPath: "shopApi",
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
    getAllShops: builder.query({
      query: () => `shop/all/`,
    })
  }),
});

export const {
  useGetAllShopsQuery,
  
} = shopApi;
