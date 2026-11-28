"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as yup from "yup";
import { CheckCircle2, Loader2, MailX, ArrowLeft } from "lucide-react";

const unsubscribeSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .required("Email address is required."),
});

function UnsubscribeFormContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const qEmail = searchParams.get("email");
    if (qEmail) setEmail(qEmail);
  }, [searchParams]);

  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5201";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(null);

    try {
      await unsubscribeSchema.validate({ email }, { abortEarly: false });
    } catch (err: unknown) {
      if (err instanceof yup.ValidationError) {
        setFieldError(err.errors[0] || "Please enter a valid email address.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/api/v1/public/forms/unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setFieldError(data?.error || "Unable to process opt-out right now.");
        return;
      }

      setCompleted(true);
    } catch {
      setFieldError("Network error while updating preferences.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[75vh] flex items-center justify-center bg-gradient-to-b from-white via-slate-50 to-white px-4 py-16">
      <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <MailX className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900">
              Email Preferences &amp; Opt-Out
            </h1>
            <p className="text-xs text-slate-500">
              Manage your marketing communication consent
            </p>
          </div>
        </div>

        {completed ? (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Preferences Updated</span>
            </div>
            <p className="text-xs text-emerald-700 leading-relaxed">
              Your opt-out request has been recorded. You will no longer receive marketing updates at{" "}
              <span className="font-semibold">{email}</span>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldError) setFieldError(null);
                }}
                placeholder="name@company.com"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs bg-white focus:outline-hidden ${
                  fieldError
                    ? "border-rose-400 focus:border-rose-500"
                    : "border-slate-200 focus:border-teal-500"
                }`}
              />
              {fieldError && (
                <p className="text-[11px] font-medium text-rose-600 mt-1.5">
                  {fieldError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 hover:bg-teal-700 text-white py-2.5 px-5 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Confirm Opt-Out</span>
            </button>
          </form>
        )}

        <div className="pt-3 border-t border-slate-100">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={null}>
      <UnsubscribeFormContent />
    </Suspense>
  );
}
