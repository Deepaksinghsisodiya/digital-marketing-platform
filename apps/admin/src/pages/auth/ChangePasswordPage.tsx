import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  adminApi,
  useChangePasswordMutation,
  useLogoutMutation,
} from "../../store/api/adminApi";
import { useAppDispatch } from "../../store/hooks";
import { logout, setUser } from "../../store/slices/authSlice";
import {
  KeyRound,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  LogOut,
  Check,
  X as XIcon,
} from "lucide-react";

export const ChangePasswordPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [logoutApi] = useLogoutMutation();

  // Criteria validation checks
  const hasMinLength = newPassword.length >= 12;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasDigit = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const isCriteriaMet =
    hasMinLength && hasUpper && hasLower && hasDigit && hasSpecial;

  const passwordsMatch =
    newPassword.length > 0 && newPassword === confirmPassword;

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // ignore
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isCriteriaMet) {
      setErrorMsg(
        "New password does not meet the 12-character enterprise complexity requirements.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("New password and confirmation do not match.");
      return;
    }

    try {
      await changePassword({
        currentPassword: currentPassword || undefined,
        newPassword,
      }).unwrap();

      try {
        const profile = await dispatch(
          adminApi.endpoints.getCurrentUser.initiate(undefined, {
            forceRefetch: true,
          }),
        ).unwrap();
        dispatch(setUser(profile));
      } catch {
        // profile refetch fallback
      }

      setSuccessMsg(
        "Password changed successfully! Redirecting to dashboard...",
      );
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err: unknown) {
      const apiErr = err as { data?: { error?: string; detail?: string } };
      const detail =
        apiErr?.data?.error ||
        apiErr?.data?.detail ||
        "Failed to update password. Please check your current password and criteria.";
      setErrorMsg(detail);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/30 mb-4">
          <KeyRound className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          Password Change Required
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Your account requires a new password before you can proceed
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800 py-8 px-6 shadow-xl border border-slate-700/60 sm:rounded-2xl sm:px-10">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-emerald-400 text-sm">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Current Password{" "}
                <span className="text-slate-500 text-[10px] lowercase">
                  (optional if initial setup)
                </span>
              </label>
              <div className="mt-2 relative rounded-xl shadow-sm">
                <input
                  id="currentPassword"
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="block w-full px-4 pr-11 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent sm:text-sm"
                  placeholder="Enter current or temporary password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none"
                  aria-label="Toggle current password visibility"
                >
                  {showCurrent ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                New Password
              </label>
              <div className="mt-2 relative rounded-xl shadow-sm">
                <input
                  id="newPassword"
                  type={showNew ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full px-4 pr-11 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent sm:text-sm"
                  placeholder="Enter minimum 12-char password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none"
                  aria-label="Toggle new password visibility"
                >
                  {showNew ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Password Complexity Criteria Live Badges */}
              <div className="mt-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-1.5 text-[11px]">
                <div className="font-semibold text-slate-400 mb-1 text-[10px] uppercase tracking-wider">
                  Security Complexity Rules:
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <span
                    className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-400" : "text-slate-500"}`}
                  >
                    {hasMinLength ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <XIcon className="w-3.5 h-3.5" />
                    )}{" "}
                    12+ characters
                  </span>
                  <span
                    className={`flex items-center gap-1.5 ${hasUpper ? "text-emerald-400" : "text-slate-500"}`}
                  >
                    {hasUpper ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <XIcon className="w-3.5 h-3.5" />
                    )}{" "}
                    1 Uppercase (A-Z)
                  </span>
                  <span
                    className={`flex items-center gap-1.5 ${hasLower ? "text-emerald-400" : "text-slate-500"}`}
                  >
                    {hasLower ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <XIcon className="w-3.5 h-3.5" />
                    )}{" "}
                    1 Lowercase (a-z)
                  </span>
                  <span
                    className={`flex items-center gap-1.5 ${hasDigit ? "text-emerald-400" : "text-slate-500"}`}
                  >
                    {hasDigit ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <XIcon className="w-3.5 h-3.5" />
                    )}{" "}
                    1 Digit (0-9)
                  </span>
                  <span
                    className={`flex items-center gap-1.5 col-span-2 ${hasSpecial ? "text-emerald-400" : "text-slate-500"}`}
                  >
                    {hasSpecial ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <XIcon className="w-3.5 h-3.5" />
                    )}{" "}
                    1 Special symbol (@$!%*?&#)
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Confirm New Password
              </label>
              <div className="mt-2 relative rounded-xl shadow-sm">
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`block w-full px-4 pr-11 py-2.5 bg-slate-900 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 sm:text-sm ${
                    confirmPassword.length > 0
                      ? passwordsMatch
                        ? "border-emerald-500/80 focus:ring-emerald-500"
                        : "border-red-500/80 focus:ring-red-500"
                      : "border-slate-700 focus:ring-amber-500"
                  }`}
                  placeholder="Re-type new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {confirmPassword.length > 0 && (
                <div
                  className={`mt-1.5 text-[11px] font-medium flex items-center gap-1 ${passwordsMatch ? "text-emerald-400" : "text-red-400"}`}
                >
                  {passwordsMatch ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Passwords match
                    </>
                  ) : (
                    <>
                      <XIcon className="w-3.5 h-3.5" /> Passwords do not match
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <button
                type="submit"
                disabled={isLoading || !isCriteriaMet || !passwordsMatch}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 transition-colors"
              >
                {isLoading ? (
                  "Updating..."
                ) : (
                  <>
                    Save New Password
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex justify-center items-center gap-2 py-2 px-3 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out &amp; Return to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
