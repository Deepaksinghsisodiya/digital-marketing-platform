import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";
import { logout, setCsrf } from "../slices/authSlice";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5201";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    headers.set("X-Correlation-Id", `admin-${Date.now()}`);
    const state = getState() as RootState;
    const csrfToken = state.auth.csrfToken;
    const csrfHeader = state.auth.csrfHeaderName || "X-XSRF-TOKEN";
    if (csrfToken) {
      headers.set(csrfHeader, csrfToken);
    }
    return headers;
  },
});

export const baseQueryWithReauth: typeof rawBaseQuery = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  // If 401 Unauthorized, dispatch logout
  if (result.error && result.error.status === 401) {
    api.dispatch(logout());
  }

  // If 403 with MUST_CHANGE_PASSWORD, redirect to change password page
  if (result.error && result.error.status === 403) {
    const errorData = result.error.data as { code?: string } | undefined;
    if (errorData?.code === "MUST_CHANGE_PASSWORD") {
      window.location.href = "/auth/change-password";
    }
  }

  // If CSRF token invalid or missing (400 Bad Request with anti-forgery), attempt CSRF refresh
  if (
    result.error &&
    result.error.status === 400 &&
    typeof result.error.data === "string" &&
    result.error.data.includes("antiforgery")
  ) {
    const csrfResult = await rawBaseQuery(
      "/api/v1/auth/csrf",
      api,
      extraOptions,
    );
    if (csrfResult.data) {
      const data = csrfResult.data as { token: string; headerName: string };
      api.dispatch(setCsrf({ token: data.token, headerName: data.headerName }));
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "User",
    "Role",
    "AuditLog",
    "Settings",
    "CurrentProfile",
    "CmsPage",
    "Lead",
    "EmailTemplate",
    "EmailLog",
    "Client",
    "Task",
    "BlogPost",
    "PipelineStage",
    "CountryRegion",
    "Media",
    "Menu",
  ],
  endpoints: () => ({}),
});
