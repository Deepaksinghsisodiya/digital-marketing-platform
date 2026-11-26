import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import { useForgotPasswordMutation } from "../../store/api/adminApi";
import { Mail, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "../../components/ui/button";

const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .email("Please enter a valid work email address.")
    .required("Work email address is required."),
});

export const ForgotPasswordPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values) => {
      try {
        await forgotPassword({ email: values.email.trim() }).unwrap();
      } catch {
        // Anti-enumeration: Always show success regardless of whether email exists
      } finally {
        setSubmitted(true);
      }
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors relative overflow-hidden">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-primary-foreground shadow-sm shadow-primary/30 mb-3.5">
          <Mail className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Reset Your Password
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Enter your account email to receive a password recovery link
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-8 shadow-xs border border-slate-200/90 dark:border-slate-800/90 rounded-2xl">
          {submitted ? (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-emerald-700 dark:text-emerald-400 text-xs leading-relaxed">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                <span>
                  If that email exists in our records, a secure password recovery
                  link has been dispatched. Please check your inbox (and Mailpit
                  in local development).
                </span>
              </div>
              <Link to="/login" className="block">
                <Button variant="outline" className="w-full h-10 text-xs">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={formik.handleSubmit} noValidate>
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Work Email Address
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    aria-invalid={Boolean(formik.touched.email && formik.errors.email)}
                    className={`block w-full pl-9 pr-3.5 py-2.5 bg-slate-50/70 dark:bg-slate-800/60 border rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 text-xs focus:outline-none focus:ring-1 transition-all ${
                      formik.touched.email && formik.errors.email
                        ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                        : "border-slate-200 dark:border-slate-700/80 focus:ring-primary focus:border-primary"
                    }`}
                    placeholder="user@company.com"
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <p className="mt-1 text-[11px] font-medium text-red-600 dark:text-red-400">
                    {formik.errors.email}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="w-full h-10 text-xs"
                >
                  Send Recovery Link <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>

        <div className="mt-4 text-center">
          <p className="text-[11px] text-slate-400 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Zero Enumeration &bull; 256-Bit SSL Protection
          </p>
        </div>
      </div>
    </div>
  );
};
