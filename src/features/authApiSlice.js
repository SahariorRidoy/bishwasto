
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
  }),
  endpoints: (builder) => ({
    register: builder.mutation({
      query: ({ phone_number, password }) => ({
        url: 'auth/register/',
        method: 'POST',
        body: { phone_number, password },
      }),
    }),
    login: builder.mutation({
        query: ({ phone_number, password }) => ({
          url: 'auth/login/',
          method: 'POST',
          body: { phone_number, password },
        }),
      }),
  }),
});

export const { useRegisterMutation, useLoginMutation } = authApi;
