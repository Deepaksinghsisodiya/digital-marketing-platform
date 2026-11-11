import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UserProfile } from "../../types";

export interface AuthState {
  user: UserProfile | null;
  csrfToken: string | null;
  csrfHeaderName: string;
  isAuthenticated: boolean;
  isInitialized: boolean;
  mustChangePassword: boolean;
}

const initialState: AuthState = {
  user: null,
  csrfToken: null,
  csrfHeaderName: "X-XSRF-TOKEN",
  isAuthenticated: false,
  isInitialized: false,
  mustChangePassword: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCsrf: (
      state,
      action: PayloadAction<{ token: string; headerName?: string }>
    ) => {
      state.csrfToken = action.payload.token;
      if (action.payload.headerName) {
        state.csrfHeaderName = action.payload.headerName;
      }
    },
    setUser: (state, action: PayloadAction<UserProfile | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.mustChangePassword = action.payload?.mustChangePassword ?? false;
      state.isInitialized = true;
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.mustChangePassword = false;
    },
  },
});

export const { setCsrf, setUser, setInitialized, logout } = authSlice.actions;
export default authSlice.reducer;
