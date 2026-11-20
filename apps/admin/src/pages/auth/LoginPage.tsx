import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLoginMutation, adminApi } from "../../store/api/adminApi";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setUser } from "../../store/slices/authSlice";
import {
  ShieldCheck,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { Button } from "../../components/ui/button";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isInitialized } = useAppSelector(
    (state) => state.auth,
  );
  const [login, { isLoading }] = useLoginMutation();

  // If already authenticated, redirect to dashboard immediately
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isInitialized, isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      const res = await login({ email, password, rememberMe }).unwrap();

      // Ensure user profile is populated in Redux before navigating
      try {
        const profile = await dispatch(
          adminApi.endpoints.getCurrentUser.initiate(undefined, {
            subscribe: false,
            forceRefetch: true,
          }),
        ).unwrap();
        if (profile) {
          dispatch(setUser(profile));
        }
      } catch {
        // Fallback: Continue navigation
      }

      if (res.mustChangePassword) {
        navigate("/auth/change-password", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err: unknown) {
      const apiErr = err as { data?: { error?: string; detail?: string } };
      const detail =
        apiErr?.data?.error ||
        apiErr?.data?.detail ||
        "Invalid email or password. Please check your credentials.";
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
          Nexora Admin Platform
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Sign in to manage your digital marketing platform
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

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Work Email
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-9 pr-3.5 py-2.5 bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  placeholder="admin@nexora.local"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Password
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-10 py-2.5 bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 text-primary rounded border-slate-300 dark:border-slate-700 focus:ring-primary"
                />
                <span className="text-slate-600 dark:text-slate-400">
                  Remember me
                </span>
              </label>

              <Link
                to="/auth/forgot-password"
                className="font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full h-10 text-xs"
              >
                Sign In <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </form>
        </div>

        {/* Security badge at bottom */}
        <div className="mt-4 text-center">
          <p className="text-[11px] text-slate-400 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            256-Bit SSL Encrypted &bull; RBAC Protected
          </p>
        </div>
      </div>
    </div>
  );
};
