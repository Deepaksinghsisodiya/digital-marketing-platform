import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

interface ProtectedRouteProps {
  requiredPermission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredPermission }) => {
  const { user, isAuthenticated, isInitialized, mustChangePassword } = useAppSelector(
    (state) => state.auth
  );

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Verifying session security...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (mustChangePassword) {
    return <Navigate to="/auth/change-password" replace />;
  }

  if (requiredPermission) {
    const isOwner = user.roles.includes("Owner");
    const hasPermission = user.permissions.includes(requiredPermission);
    if (!isOwner && !hasPermission) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold text-xl mb-4 border border-red-500/20">
            403
          </div>
          <h2 className="text-xl font-bold text-white">Access Denied</h2>
          <p className="mt-2 text-sm text-slate-400 max-w-md">
            Your assigned role does not have authorization for{" "}
            <code className="text-red-400 bg-slate-900 px-1.5 py-0.5 rounded font-mono text-xs">
              {requiredPermission}
            </code>
            . Please contact your system Owner if you require access.
          </p>
        </div>
      );
    }
  }

  return <Outlet />;
};

