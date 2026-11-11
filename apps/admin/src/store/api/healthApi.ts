import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  HealthLiveResponse,
  HealthReadyResponse,
} from "@nexora/contracts";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5201";

export const healthApi = createApi({
  reducerPath: "healthApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set("X-Correlation-Id", `admin-${Date.now()}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getLiveHealth: builder.query<HealthLiveResponse, void>({
      query: () => "/health/live",
    }),
    getReadyHealth: builder.query<HealthReadyResponse, void>({
      query: () => "/health/ready",
    }),
  }),
});

export const { useGetLiveHealthQuery, useGetReadyHealthQuery } = healthApi;
