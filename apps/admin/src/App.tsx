import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAppDispatch } from "./store/hooks";
import {
  useGetCsrfTokenQuery,
  useGetCurrentUserQuery,
} from "./store/api/adminApi";
import { setCsrf, setUser, setInitialized } from "./store/slices/authSlice";

import { LoginPage } from "./pages/auth/LoginPage";
import { ChangePasswordPage } from "./pages/auth/ChangePasswordPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";

import { AdminLayout } from "./layouts/AdminLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { UsersPage } from "./pages/users/UsersPage";
import { RolesPage } from "./pages/roles/RolesPage";
import { AuditLogsPage } from "./pages/audit/AuditLogsPage";
import { SettingsPage } from "./pages/settings/SettingsPage";
import { ThemeStudioPage } from "./pages/theme-studio/ThemeStudioPage";
import { PagesListPage } from "./pages/cms/PagesListPage";
import { PageEditorPage } from "./pages/cms/PageEditorPage";
import { HeroBannersPage } from "./pages/cms/HeroBannersPage";
import { AnnouncementBarPage } from "./pages/cms/AnnouncementBarPage";
import { TestimonialsPage } from "./pages/cms/TestimonialsPage";
import { CaseStudiesPage } from "./pages/cms/CaseStudiesPage";
import { ServicesCatalogPage } from "./pages/cms/ServicesCatalogPage";
import { FaqsPage } from "./pages/cms/FaqsPage";
import { LeadsPage } from "./pages/leads/LeadsPage";
import { EmailTemplatesPage } from "./pages/EmailTemplatesPage";
import { ClientsPage } from "./pages/clients/ClientsPage";
import { TasksPage } from "./pages/tasks/TasksPage";
import { PostsPage } from "./pages/content/PostsPage";
import { MediaLibraryPage } from "./pages/media/MediaLibraryPage";
import { MenusPage } from "./pages/menus/MenusPage";

import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "sonner";

export function App() {
  const dispatch = useAppDispatch();

  // App bootstrap: 1. CSRF Token, 2. Current User Profile
  const { data: csrfData } = useGetCsrfTokenQuery();
  const {
    data: userData,
    isSuccess: isUserSuccess,
    isError: isUserError,
  } = useGetCurrentUserQuery();

  useEffect(() => {
    if (csrfData) {
      dispatch(
        setCsrf({ token: csrfData.token, headerName: csrfData.headerName }),
      );
    }
  }, [csrfData, dispatch]);

  useEffect(() => {
    if (isUserSuccess && userData) {
      dispatch(setUser(userData));
    } else if (isUserError) {
      dispatch(setInitialized());
    }
  }, [isUserSuccess, isUserError, userData, dispatch]);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/auth/forgot-password"
            element={<ForgotPasswordPage />}
          />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/setup-password" element={<ResetPasswordPage />} />
          <Route
            path="/auth/change-password"
            element={<ChangePasswordPage />}
          />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* Users & Staff - Guarded by users.view */}
              <Route
                element={<ProtectedRoute requiredPermission="users.view" />}
              >
                <Route path="/users" element={<UsersPage />} />
              </Route>

              {/* Roles Matrix - Guarded by roles.view */}
              <Route
                element={<ProtectedRoute requiredPermission="roles.view" />}
              >
                <Route path="/roles" element={<RolesPage />} />
              </Route>

              {/* Audit Trail - Guarded by audit.view */}
              <Route
                element={<ProtectedRoute requiredPermission="audit.view" />}
              >
                <Route path="/audit-logs" element={<AuditLogsPage />} />
              </Route>

              {/* Settings - Guarded by settings.view */}
              <Route
                element={<ProtectedRoute requiredPermission="settings.view" />}
              >
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* Theme Studio - Guarded by themes.view */}
              <Route
                element={<ProtectedRoute requiredPermission="themes.view" />}
              >
                <Route
                  path="/settings/theme-studio"
                  element={<ThemeStudioPage />}
                />
              </Route>

              {/* CMS Pages, Media & Menus - Guarded by pages.view */}
              <Route
                element={<ProtectedRoute requiredPermission="pages.view" />}
              >
                <Route path="/cms/pages" element={<PagesListPage />} />
                <Route
                  path="/cms/pages/:id/edit"
                  element={<PageEditorPage />}
                />
                <Route path="/cms/hero-banners" element={<HeroBannersPage />} />
                <Route
                  path="/cms/announcements"
                  element={<AnnouncementBarPage />}
                />
                <Route path="/cms/services" element={<ServicesCatalogPage />} />
                <Route path="/cms/case-studies" element={<CaseStudiesPage />} />
                <Route
                  path="/cms/testimonials"
                  element={<TestimonialsPage />}
                />
                <Route path="/cms/faqs" element={<FaqsPage />} />
                <Route path="/posts" element={<PostsPage />} />
                <Route path="/media" element={<MediaLibraryPage />} />
                <Route path="/menus" element={<MenusPage />} />
              </Route>

              {/* Leads & Inquiries - Guarded by leads.view */}
              <Route
                element={<ProtectedRoute requiredPermission="leads.view" />}
              >
                <Route path="/leads" element={<LeadsPage />} />
              </Route>

              {/* Clients & Accounts - Guarded by clients.view */}
              <Route
                element={<ProtectedRoute requiredPermission="clients.view" />}
              >
                <Route path="/clients" element={<ClientsPage />} />
              </Route>

              {/* Redirect /tasks to /clients */}
              <Route
                path="/tasks"
                element={<Navigate to="/clients" replace />}
              />

              {/* Email Templates & Outbox - Guarded by settings.view */}
              <Route
                element={<ProtectedRoute requiredPermission="settings.view" />}
              >
                <Route path="/emails" element={<EmailTemplatesPage />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster position="top-right" richColors closeButton />
      </BrowserRouter>
    </ThemeProvider>
  );
}
export default App;
