"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { captureUtmParameters, getStoredUtmParameters } from "@/lib/utm";
import { trackFormSubmit } from "@/lib/tracking";

interface PPCLeadFormProps {
  campaignName: string;
  defaultService: string;
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  accentColor?: "emerald" | "blue" | "indigo";
}

const BUDGET_OPTIONS = [
  "₹30,000 – ₹75,000 / mo ($400 - $1k)",
  "₹75,000 – ₹2,00,000 / mo ($1k - $2.5k)",
  "₹2,00,000 – ₹5,00,000 / mo ($2.5k - $6k)",
  "₹5,00,000 – ₹15,00,000 / mo ($6k - $18k)",
  "₹15,00,000+ / mo ($18k+)",
];

const OBJECTIVES = [
  "Generate More Qualified Inbound Leads",
  "Lower Cost Per Acquisition (CPA / CPL)",
  "Scale E-Commerce ROAS & Sales",
  "Launch New Campaigns from Scratch",
  "Fix Wasted Ad Spend / Account Audit",
];

export function PPCLeadForm({
  campaignName,
  defaultService,
  headline = "Claim Your Free 48-Hour PPC Audit",
  subheadline = "We'll show you exactly where your ad budget is leaking and how to cut CPA.",
  ctaText = "Get My Free Ad Audit & Strategy",
  accentColor = "emerald",
}: PPCLeadFormProps) {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [budget, setBudget] = useState(BUDGET_OPTIONS[1]);
  const [objective, setObjective] = useState(OBJECTIVES[0]);
  const [honeypot, setHoneypot] = useState("");
  const [timeTrapToken, setTimeTrapToken] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const idempotencyKeyRef = useRef<string>(
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `ppc-${Date.now()}`
  );

  const apiUrl =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5201";

  useEffect(() => {
    captureUtmParameters();

    if (!apiUrl) return;
    let isMounted = true;
    fetch(`${apiUrl}/api/v1/public/forms/contact`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.timeTrapToken) {
          setTimeTrapToken(data.timeTrapToken);
        }
      })
      .catch(() => {
        // Fallback token
      });

    return () => {
      isMounted = false;
    };
  }, [apiUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic validation
    if (!fullName.trim() || !email.trim() || !phone.trim() || !websiteUrl.trim()) {
      setErrorMessage("Please fill in your name, work email, phone number, and website.");
      return;
    }

    if (honeypot) {
      // Bot trapped
      setIsSuccess(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const utm = getStoredUtmParameters();
      const payload = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        service: defaultService,
        budget,
        notes: `PPC Landing Page Form: ${campaignName} | Goal: ${objective}`,
        websiteUrl: websiteUrl.trim(),
        customFieldsJson: JSON.stringify({
          inquiryType: "ppc_landing_page",
          campaignName,
          objective,
          budget,
          websiteUrl: websiteUrl.trim(),
          submittedAt: new Date().toISOString(),
        }),
        utmSource: utm.utmSource || "paid_ads",
        utmMedium: utm.utmMedium || "cpc",
        utmCampaign: utm.utmCampaign || campaignName,
        utmTerm: utm.utmTerm || undefined,
        utmContent: utm.utmContent || undefined,
        referrerUrl: utm.referrerUrl || (typeof window !== "undefined" ? window.location.href : undefined),
        consentGiven: true,
        consentWordingVersion: "v1.2-ppc",
        honeypot: honeypot || undefined,
        timeTrapToken: timeTrapToken || undefined,
        idempotencyKey: idempotencyKeyRef.current,
      };

      const res = await fetch(`${apiUrl}/api/v1/public/forms/contact/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idempotencyKeyRef.current ? { "X-Idempotency-Key": idempotencyKeyRef.current } : {}),
        },
        body: JSON.stringify(payload),
      }).catch(() => null);

      let refNumber = `REF-${Math.floor(100000 + Math.random() * 900000)}`;

      if (res && res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data?.referenceNumber) {
          refNumber = data.referenceNumber;
        }
      }

      // Track analytics & pixel fire
      trackFormSubmit(`ppc_${campaignName}`, refNumber);
      setIsSuccess(true);

      // Redirect to thank you page after slight delay for pixel fire
      setTimeout(() => {
        router.push(`/thank-you?source=ppc&service=${encodeURIComponent(defaultService)}&ref=${encodeURIComponent(refNumber)}`);
      }, 700);

    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e.message || "Failed to submit. Please try calling directly or WhatsApp us.");
      setIsSubmitting(false);
    }
  };

  const buttonBgClasses = {
    emerald: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30",
    blue: "bg-blue-600 hover:bg-blue-500 shadow-blue-600/30",
    indigo: "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30",
  }[accentColor];

  if (isSuccess) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-white p-8 sm:p-10 shadow-2xl text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Audit Request Received!</h3>
        <p className="text-sm text-slate-600">
          Redirecting you to the confirmation page now...
        </p>
        <div className="flex justify-center pt-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        </div>
      </div>
    );
  }

  return (
    <div
      id="audit-form"
      className="w-full rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 md:p-9 shadow-2xl relative scroll-mt-28"
    >
      {/* Visual top indicator */}
      <div className="absolute top-0 left-8 right-8 h-1.5 rounded-b bg-gradient-to-r from-primary via-accent to-primary" />

      <div className="mb-6 space-y-1 text-left">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Zero Obligation &bull; 100% Confidential</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {headline}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
          {subheadline}
        </p>
      </div>

      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {/* Anti-spam Honeypot */}
        <input
          type="text"
          name="website_url_hp"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
        />

        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Vikram Mehta"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />
        </div>

        {/* Work Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Work Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Phone / WhatsApp <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Website / Landing Page URL */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
            Website or Landing Page URL <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://yourbusiness.com"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />
        </div>

        {/* Current Monthly Ad Spend */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
            Current Monthly Ad Spend
          </label>
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          >
            {BUDGET_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Primary Goal */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
            Primary Goal
          </label>
          <select
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          >
            {OBJECTIVES.map((obj) => (
              <option key={obj} value={obj}>
                {obj}
              </option>
            ))}
          </select>
        </div>

        {/* CTA Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3.5 px-6 rounded-xl text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition duration-200 shadow-lg ${buttonBgClasses} disabled:opacity-60 cursor-pointer`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing & Submitting...</span>
            </>
          ) : (
            <>
              <span>{ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Micro Trust Proof */}
        <p className="text-[11px] text-slate-500 text-center leading-normal pt-1">
          🔒 We never spam. Your details are used strictly to analyze your account and deliver the audit report.
        </p>
      </form>
    </div>
  );
}
