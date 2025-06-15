// store.js
import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "@/features/authApiSlice";
import { productsApi } from "@/features/productsApiSlice";
import { shopApi } from "@/features/shopApiSlice";
import { orderApi } from "@/features/orderApliSlice";
import { invoiceApi } from "@/features/invoiceApiSlice";
import { smsApi } from '@/features/smsApi';

import authReducer from "@/features/authSlice";
import userInfoSlice from "@/features/userInfoSlice";
import shopReducer from "@/features/shopSlice";
import themeReducer from "@/features/themeSlice";
export const store = configureStore({
  reducer: {

    [authApi.reducerPath]: authApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [shopApi.reducerPath]: shopApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [smsApi.reducerPath]: smsApi.reducer,
    [invoiceApi.reducerPath]: invoiceApi.reducer,
    
    theme: themeReducer,
    auth: authReducer,
    userInfo: userInfoSlice,
    shop: shopReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(productsApi.middleware)
      .concat(shopApi.middleware)
      .concat(orderApi.middleware)
      .concat(invoiceApi.middleware)
      .concat(smsApi.middleware),
});
