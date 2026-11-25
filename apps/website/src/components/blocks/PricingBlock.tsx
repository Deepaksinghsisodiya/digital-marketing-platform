"use client";

import React, { useState } from "react";
import type { CmsBlock } from "../../lib/cms";
import { Check, Sparkles, ArrowRight, ShieldCheck, Zap, HelpCircle } from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "../ui/SectionHeading";

export interface PricingPlan {
  id?: string;
  name: string;
  badge?: string;
  description: string;
  monthlyPrice?: string | number;
  annualPrice?: string | number;
  priceInr?: string;
  priceUsd?: string;
  features?: string[];
  ctaText?: string;
  ctaLink?: string;
  isPopular?: boolean;
}

const DEFAULT_PLANS: PricingPlan[] = [
  {
    name: "Growth Starter",
    badge: "Emerging Scale",
    description: "Ideal for scaling ventures needing deterministic commercial search rank and conversion foundations.",
    monthlyPrice: "$990",
    annualPrice: "$790",
    priceInr: "₹75,000",
    priceUsd: "$990",
    features: [
      "Technical Core Web Vitals remediation",
      "High-intent commercial SEO architecture",
      "Full Google Search & PMax campaign launch",
      "Bi-weekly conversion rate audits",
      "Bi-weekly attribution reporting & analytics",
      "Dedicated Growth Strategist",
    ],
    ctaText: "Get Started",
    ctaLink: "/contact?plan=growth-starter",
    isPopular: false,
  },
  {
    name: "Performance Scale",
    badge: "Most Popular",
    description: "Full-funnel omnichannel engine for enterprise brands scaling lead velocity across channels.",
    monthlyPrice: "$2,450",
    annualPrice: "$1,960",
    priceInr: "₹1,85,000",
    priceUsd: "$2,450",
    features: [
      "Everything in Growth Starter",
      "Multi-channel ABM (LinkedIn + Google + Meta)",
      "Continuous scientific landing page split-testing",
      "Automated lead routing & WhatsApp integration",
      "Weekly executive pipeline telemetry",
      "Sub-second Core Web Vitals guarantee",
      "Dedicated engineering & CRO squad",
    ],
    ctaText: "Scale Pipeline",
    ctaLink: "/contact?plan=performance-scale",
    isPopular: true,
  },
  {
    name: "Enterprise Custom",
    badge: "Bespoke SLA",
    description: "Tailored multi-region infrastructure, dedicated squads, and deterministic revenue attribution models.",
    monthlyPrice: "Custom Quote",
    annualPrice: "Custom Quote",
    priceInr: "Custom Quote",
    priceUsd: "Custom Quote",
    features: [
      "Everything in Performance Scale",
      "Multi-country regulatory compliance (DPDP + GDPR)",
      "Custom headless Next.js web application architecture",
      "Custom CRM data pipeline synchronization",
      "Guaranteed response SLA (under 2 hours)",
      "Dedicated Senior Growth Director & Engineering Lead",
    ],
    ctaText: "Contact Leadership",
    ctaLink: "/contact?plan=enterprise",
    isPopular: false,
  },
];

interface PricingBlockProps {
  block: CmsBlock;
}

export const PricingBlock: React.FC<PricingBlockProps> = ({ block }) => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [currency, setCurrency] = useState<"USD" | "INR" | "EUR">("USD");

  const content = block.content || {};
  const sectionTitle =
    (content.sectionTitle as string) ||
    (content.title as string) ||
    "Transparent Growth Infrastructure";
  const sectionSubtitle =
    (content.sectionSubtitle as string) ||
    (content.subtitle as string) ||
    "Transparent engagement models engineered for enterprise marketing velocity. No hidden markups, pure deterministic ROI.";

  const rawPlans = (content.plans as PricingPlan[]) || [];
  const plans: PricingPlan[] = rawPlans.length > 0 ? rawPlans : DEFAULT_PLANS;

  const formatPrice = (plan: PricingPlan) => {
    // If it's custom quote
    const rawVal = billingCycle === "annual" ? (plan.annualPrice || plan.monthlyPrice) : plan.monthlyPrice;
    if (typeof rawVal === "string" && (rawVal.toLowerCase().includes("custom") || rawVal.toLowerCase().includes("quote"))) {
      return "Custom Quote";
    }

    if (currency === "INR" && plan.priceInr) {
      if (billingCycle === "annual" && plan.priceInr.startsWith("₹")) {
        const num = parseInt(plan.priceInr.replace(/[^0-9]/g, ""), 10);
        if (!isNaN(num)) {
          const discounted = Math.round(num * 0.8);
          return `₹${discounted.toLocaleString("en-IN")}`;
        }
      }
      return plan.priceInr;
    }

    if (billingCycle === "annual" && plan.annualPrice) {
      if (currency === "EUR") {
        return typeof plan.annualPrice === "string" && plan.annualPrice.startsWith("$")
          ? plan.annualPrice.replace("$", "€")
          : plan.annualPrice;
      }
      return plan.annualPrice;
    }

    if (currency === "EUR" && typeof plan.monthlyPrice === "string" && plan.monthlyPrice.startsWith("$")) {
      return plan.monthlyPrice.replace("$", "€");
    }

    return plan.monthlyPrice || plan.priceUsd || "Contact Us";
  };

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden bg-slate-50/70 border-y border-slate-200/80">
      {/* Background glow accents */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 blur-[160px] rounded-full pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading
          eyebrow="Commercial Retainers & SLA"
          title={sectionTitle}
          description={sectionSubtitle}
          align="center"
        />

        {/* Controls: Billing Cycle & Currency Switcher */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Monthly vs Annual Toggle */}
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-card border border-slate-200/80 shadow-xs">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                billingCycle === "monthly"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("annual")}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                billingCycle === "annual"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Annual Retainer</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                Save 20%
              </span>
            </button>
          </div>

          {/* Currency Toggle */}
          <div className="inline-flex items-center p-1 rounded-xl bg-card border border-slate-200/80 shadow-xs">
            {(["USD", "INR", "EUR"] as const).map((curr) => (
              <button
                key={curr}
                type="button"
                onClick={() => setCurrency(curr)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  currency === curr
                    ? "bg-primary text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {curr === "USD" ? "$ USD" : curr === "INR" ? "₹ INR" : "€ EUR"}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => {
            const isPopular = plan.isPopular || plan.badge === "Most Popular";
            const price = formatPrice(plan);
            const isCustom = price === "Custom Quote" || price === "Contact Us";

            return (
              <div
                key={plan.id || plan.name || idx}
                className={`relative flex flex-col justify-between rounded-3xl p-8 transition-all duration-200 ${
                  isPopular
                    ? "bg-card border-2 border-primary shadow-xl shadow-primary/5 ring-4 ring-primary/5 -translate-y-1 lg:-translate-y-2 z-10"
                    : "bg-card border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-primary text-white shadow-sm">
                      <Sparkles className="w-3 h-3" />
                      {plan.badge || "Most Selected Partner Plan"}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                      {plan.name}
                    </h3>
                    {!isPopular && plan.badge && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed mb-6 min-h-[36px]">
                    {plan.description}
                  </p>

                  <div className="flex items-baseline gap-2 mb-6 pb-6 border-b border-slate-100">
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                      {price}
                    </span>
                    {!isCustom && (
                      <span className="text-xs font-semibold text-slate-400">
                        {billingCycle === "annual" ? "/mo (billed annually)" : "/month"}
                      </span>
                    )}
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3 mb-8">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Included Capabilities &amp; SLA
                    </p>
                    <ul className="space-y-2.5">
                      {(plan.features || []).map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-700">
                          <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3 h-3 stroke-[2.5]" />
                          </div>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card CTA */}
                <div className="pt-4 border-t border-slate-100 mt-auto">
                  <Link
                    href={plan.ctaLink || `/contact?plan=${encodeURIComponent(plan.name)}`}
                    className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                      isPopular
                        ? "bg-primary text-white hover:bg-primary-hover shadow-sm"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    <span>{plan.ctaText || "Deploy Plan"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enterprise Reassurance & Trust Bar */}
        <div className="mt-16 pt-8 border-t border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Deterministic SLA</h4>
              <p className="text-[11px] text-slate-500">Guaranteed response SLAs &amp; monthly KPIs</p>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Zero Lock-In Period</h4>
              <p className="text-[11px] text-slate-500">Transparent 30-day notice period retainers</p>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Dedicated Growth Squad</h4>
              <p className="text-[11px] text-slate-500">Direct Slack channel with senior strategists</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
