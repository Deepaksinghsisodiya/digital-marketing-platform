import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useResetPasswordMutation } from "../../store/api/adminApi";
import {
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Check,
  X as XIcon,
} from "lucide-react";
import { Button } from "../../components/ui/button";

export const ResetPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

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

  useEffect(() => {
    // SECURITY: Read sensitive reset/setup token from URL Fragment (#token=...&email=...)
    const hash = window.location.hash.substring(1);
    if (hash) {
      const params = new URLSearchParams(hash);
      const urlToken = params.get("token");
      const urlEmail = params.get("email");

      if (urlToken) setToken(decodeURIComponent(urlToken));
      if (urlEmail) setEmail(decodeURIComponent(urlEmail));

      // Immediately scrub the fragment from browser address bar
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!token) {
      setErrorMsg(
        "Reset token is missing or has expired. Please request a new recovery link.",
      );
      return;
    }

    if (!isCriteriaMet) {
      setErrorMsg(
        "Password does not meet the 12-character enterprise complexity requirements.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("New password and confirmation do not match.");
      return;
    }

    try {
      await resetPassword({
        email,
        token,
        newPassword,
      }).unwrap();

      setSuccessMsg("Password set successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err: unknown) {
      const apiErr = err as { data?: { error?: string; detail?: string } };
      const detail =
        apiErr?.data?.error ||
        apiErr?.data?.detail ||
        "Failed to set password. Token may be invalid or expired.";
      setErrorMsg(detail);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors relative overflow-hidden">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-primary-foreground shadow-sm shadow-primary/30 mb-3.5">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Set New Password
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Enter your new password to activate or recover your account
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-8 shadow-xs border border-slate-200/90 dark:border-slate-800/90 rounded-2xl">
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-red-600 dark:text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-emerald-700 dark:text-emerald-400 text-xs">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Account Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3.5 py-2.5 bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                New Password
              </label>
              <div className="relative rounded-xl">
                <input
                  id="newPassword"
                  type={showNew ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full px-3.5 pr-10 py-2.5 bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  placeholder="Enter minimum 12-char password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none cursor-pointer"
                  aria-label="Toggle new password visibility"
                >
                  {showNew ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              {/* Password Complexity Criteria Live Badges */}
              <div className="mt-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5 text-[11px]">
                <div className="font-semibold text-slate-400 mb-1 text-[10px] uppercase tracking-wider">
                  Complexity Rules:
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <span
                    className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-slate-400"}`}
                  >
                    {hasMinLength ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <XIcon className="w-3.5 h-3.5" />
                    )}{" "}
                    12+ characters
                  </span>
                  <span
                    className={`flex items-center gap-1.5 ${hasUpper ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-slate-400"}`}
                  >
                    {hasUpper ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <XIcon className="w-3.5 h-3.5" />
                    )}{" "}
                    Uppercase (A-Z)
                  </span>
                  <span
                    className={`flex items-center gap-1.5 ${hasLower ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-slate-400"}`}
                  >
                    {hasLower ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <XIcon className="w-3.5 h-3.5" />
                    )}{" "}
                    Lowercase (a-z)
                  </span>
                  <span
                    className={`flex items-center gap-1.5 ${hasDigit ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-slate-400"}`}
                  >
                    {hasDigit ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <XIcon className="w-3.5 h-3.5" />
                    )}{" "}
                    Digit (0-9)
                  </span>
                  <span
                    className={`flex items-center gap-1.5 col-span-2 ${hasSpecial ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-slate-400"}`}
                  >
                    {hasSpecial ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <XIcon className="w-3.5 h-3.5" />
                    )}{" "}
                    Special symbol (@$!%*?&#)
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Confirm New Password
              </label>
              <div className="relative rounded-xl">
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`block w-full px-3.5 pr-10 py-2.5 bg-slate-50/70 dark:bg-slate-800/60 border rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 text-xs focus:outline-none focus:ring-1 transition-all ${
                    confirmPassword.length > 0
                      ? passwordsMatch
                        ? "border-emerald-500/80 focus:ring-emerald-500"
                        : "border-red-500/80 focus:ring-red-500"
                      : "border-slate-200 dark:border-slate-700/80 focus:ring-primary"
                  }`}
                  placeholder="Re-type new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none cursor-pointer"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirm ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              {confirmPassword.length > 0 && (
                <div
                  className={`mt-1.5 text-[11px] font-medium flex items-center gap-1 ${passwordsMatch ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}
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

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isLoading || !isCriteriaMet || !passwordsMatch}
                isLoading={isLoading}
                className="w-full h-10 text-xs"
              >
                Set Password &amp; Activate <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          </form>
        </div>

        <div className="mt-4 text-center">
          <p className="text-[11px] text-slate-400 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Zero-Knowledge Verification &bull; Encrypted Session
          </p>
        </div>
      </div>
    </div>
  );
};
