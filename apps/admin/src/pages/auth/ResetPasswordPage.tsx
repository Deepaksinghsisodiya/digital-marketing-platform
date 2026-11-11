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
  const isCriteriaMet = hasMinLength && hasUpper && hasLower && hasDigit && hasSpecial;

  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  useEffect(() => {
    // SECURITY: Read sensitive reset/setup token from URL Fragment (#token=...&email=...)
    // This prevents token leakage in Referer headers or browser history logs.
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
      setErrorMsg("Reset token is missing or has expired. Please request a new link.");
      return;
    }

    if (!isCriteriaMet) {
      setErrorMsg("Password does not meet the 12-character enterprise complexity requirements.");
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
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          Set New Password
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Enter your new password to activate or recover your account
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
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Account Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 block w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm"
                placeholder="your@email.com"
              />
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
                  className="block w-full px-4 pr-11 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm"
                  placeholder="Enter minimum 12-char password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none"
                  aria-label="Toggle new password visibility"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Complexity Criteria Live Badges */}
              <div className="mt-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-1.5 text-[11px]">
                <div className="font-semibold text-slate-400 mb-1 text-[10px] uppercase tracking-wider">
                  Security Complexity Rules:
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <span className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-400" : "text-slate-500"}`}>
                    {hasMinLength ? <Check className="w-3.5 h-3.5" /> : <XIcon className="w-3.5 h-3.5" />} 12+ characters
                  </span>
                  <span className={`flex items-center gap-1.5 ${hasUpper ? "text-emerald-400" : "text-slate-500"}`}>
                    {hasUpper ? <Check className="w-3.5 h-3.5" /> : <XIcon className="w-3.5 h-3.5" />} 1 Uppercase (A-Z)
                  </span>
                  <span className={`flex items-center gap-1.5 ${hasLower ? "text-emerald-400" : "text-slate-500"}`}>
                    {hasLower ? <Check className="w-3.5 h-3.5" /> : <XIcon className="w-3.5 h-3.5" />} 1 Lowercase (a-z)
                  </span>
                  <span className={`flex items-center gap-1.5 ${hasDigit ? "text-emerald-400" : "text-slate-500"}`}>
                    {hasDigit ? <Check className="w-3.5 h-3.5" /> : <XIcon className="w-3.5 h-3.5" />} 1 Digit (0-9)
                  </span>
                  <span className={`flex items-center gap-1.5 col-span-2 ${hasSpecial ? "text-emerald-400" : "text-slate-500"}`}>
                    {hasSpecial ? <Check className="w-3.5 h-3.5" /> : <XIcon className="w-3.5 h-3.5" />} 1 Special symbol (@$!%*?&#)
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
                      : "border-slate-700 focus:ring-indigo-500"
                  }`}
                  placeholder="Re-type new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {confirmPassword.length > 0 && (
                <div className={`mt-1.5 text-[11px] font-medium flex items-center gap-1 ${passwordsMatch ? "text-emerald-400" : "text-red-400"}`}>
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
              <button
                type="submit"
                disabled={isLoading || !isCriteriaMet || !passwordsMatch}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
              >
                {isLoading ? (
                  "Saving..."
                ) : (
                  <>
                    Set Password & Activate
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
