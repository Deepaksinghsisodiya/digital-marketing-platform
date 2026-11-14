"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { CmsBlock } from "../../lib/cms";
import { REGION_CONFIG } from "../../config/region";
import { Check, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

interface RegionalPricing {
  monthly: string;
  annual: string;
}

interface PricingPlan {
  name: string;
  badge?: string;
  description: string;
  monthlyPrice: string;
  annualPrice: string;
  regionalPricing?: Record<string, RegionalPricing>;
  features: string[];
  ctaText: string;
  ctaLink: string;
  isPopular?: boolean;
}

export const PricingBlock: React.FC<{ block: CmsBlock }> = ({ block }) => {
  const { content } = block;
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">(
    "annual",
  );
  const [regionCode, setRegionCode] = useState<string>(
    REGION_CONFIG.defaultRegion,
  );

  useEffect(() => {
    if (typeof document !== "undefined") {
      const match = document.cookie.match(
        new RegExp(`(^|;\\s*)(${REGION_CONFIG.cookieName})=([^;]*)`),
      );
      if (match && match[3]) {
        setRegionCode(match[3].toUpperCase());
      } else {
        const params = new URLSearchParams(window.location.search);
        const urlRegion = params.get("region");
        if (urlRegion) setRegionCode(urlRegion.toUpperCase());
      }
    }
  }, []);

  const isIndia = regionCode === "IN";

  const sectionTitle =
    (content.sectionTitle as string) || "Transparent Growth Investment Plans";
  const sectionSubtitle =
    (content.sectionSubtitle as string) ||
    "Simple, ROI-driven engagement models designed for startups, scaling brands, and established enterprises. No hidden fees. Zero long-term lock-in.";

  const rawPlans: PricingPlan[] = (content.plans as PricingPlan[]) || [
    {
      name: "Growth Kickstart",
      description:
        "For brands scaling past $10k/month looking to establish a dominant single acquisition channel.",
      monthlyPrice: "$2,490",
      annualPrice: "$1,990",
      regionalPricing: {
        IN: { monthly: "₹1,89,000", annual: "₹1,49,000" },
        US: { monthly: "$2,490", annual: "$1,990" },
      },
      features: [
        "Google Ads OR Meta Ads Full Management",
        "2 High-Converting Landing Page Variants",
        "Weekly Creative & Copy Sprints",
        "Live 24/7 Revenue & ROAS Dashboard",
        "Month-to-Month Contract (Cancel Anytime)",
      ],
      ctaText: "Launch Growth Kickstart",
      ctaLink: "/contact",
      isPopular: false,
    },
    {
      name: "Omnichannel Scale",
      badge: "Most Selected",
      description:
        "For fast-growing companies requiring full-funnel dominance across paid search, social, and SEO.",
      monthlyPrice: "$4,990",
      annualPrice: "$3,990",
      regionalPricing: {
        IN: { monthly: "₹3,79,000", annual: "₹2,99,000" },
        US: { monthly: "$4,990", annual: "$3,990" },
      },
      features: [
        "Everything in Growth Kickstart, plus:",
        "Both Google Ads & Meta/Instagram Ads",
        "High-Intent Commercial SEO & Content",
        "Automated WhatsApp & Email Lead Funnels",
        "Dedicated Senior Growth Director",
        "Weekly Strategy Review & Direct Slack Access",
      ],
      ctaText: "Request Scale Diagnostic",
      ctaLink: "/contact",
      isPopular: true,
    },
    {
      name: "Enterprise Dominance",
      description:
        "Comprehensive bespoke growth infrastructure for multi-region leaders with high media spend.",
      monthlyPrice: "Custom",
      annualPrice: "Custom",
      regionalPricing: {
        IN: { monthly: "Custom", annual: "Custom" },
        US: { monthly: "Custom", annual: "Custom" },
      },
      features: [
        "Multi-Region & Global Campaign Management",
        "Dedicated 4-Person Creative & Growth Pod",
        "Bespoke CRM & RevOps Pipeline Integration",
        "Continuous Multivariate CRO Lab",
        "Quarterly Executive Board Strategy Roadmap",
        "24/7 Priority Emergency Channel Support",
      ],
      ctaText: "Speak with Growth Director",
      ctaLink: "/contact",
      isPopular: false,
    },
  ];

  const plans = rawPlans.map((plan) => {
    const regionPricing = plan.regionalPricing?.[regionCode];
    if (regionPricing) {
      return {
        ...plan,
        monthlyPrice: regionPricing.monthly,
        annualPrice: regionPricing.annual,
      };
    }
    if (isIndia && !plan.regionalPricing) {
      if (plan.name.includes("Growth")) {
        return { ...plan, monthlyPrice: "₹1,89,000", annualPrice: "₹1,49,000" };
      }
      if (plan.name.includes("Enterprise")) {
        return { ...plan, monthlyPrice: "₹3,79,000", annualPrice: "₹2,99,000" };
      }
    }
    return plan;
  });

  return (
    <section className="relative py-24 bg-white text-slate-900 overflow-hidden border-t border-slate-200">
      <div className="relative max-w-6xl xl:max-w-7xl 2xl:max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Investment & Pricing Models</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            {sectionTitle}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            {sectionSubtitle}
          </p>

          {/* Billing Switcher */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span
              className={`text-xs font-bold ${billingPeriod === "monthly" ? "text-slate-900" : "text-slate-500"}`}
            >
              Monthly Billing
            </span>
            <button
              type="button"
              onClick={() =>
                setBillingPeriod(
                  billingPeriod === "annual" ? "monthly" : "annual",
                )
              }
              className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${
                billingPeriod === "annual"
                  ? "bg-indigo-600 justify-end"
                  : "bg-slate-300 justify-start"
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
            </button>
            <span
              className={`text-xs font-bold flex items-center gap-1.5 ${billingPeriod === "annual" ? "text-slate-900" : "text-slate-500"}`}
            >
              <span>Annual Engagement</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch pt-4">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-3xl p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 ${
                plan.isPopular
                  ? "bg-gradient-to-b from-indigo-50/70 via-white to-indigo-50/40 border-2 border-indigo-600 shadow-2xl shadow-indigo-600/15 md:-translate-y-2 z-10"
                  : "bg-white border border-slate-200/90 shadow-sm hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white text-[11px] font-black uppercase tracking-wider shadow-lg shadow-indigo-600/30">
                  {plan.badge}
                </div>
              )}

              <div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
                  {plan.name}
                </h3>
                <p className="text-xs text-slate-600 min-h-[36px] leading-relaxed mb-6 font-normal">
                  {plan.description}
                </p>

                <div className="border-t border-b border-slate-200/80 py-6 mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                      {billingPeriod === "annual"
                        ? plan.annualPrice
                        : plan.monthlyPrice}
                    </span>
                    {plan.annualPrice !== "Custom" && (
                      <span className="text-xs text-slate-500 font-semibold">
                        / month {billingPeriod === "annual" ? "billed annually" : "billed monthly"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">
                    What&apos;s Included
                  </span>
                  {plan.features.map((feat, featIdx) => (
                    <div
                      key={featIdx}
                      className="flex items-start gap-2.5 text-xs text-slate-700 font-medium"
                    >
                      <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-200 shadow-2xs">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Action */}
              <Link
                href={plan.ctaLink}
                className={`w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl text-xs font-bold transition-all duration-200 shadow-md ${
                  plan.isPopular
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-105 active:scale-95"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 hover:scale-102 active:scale-98"
                }`}
              >
                <span>{plan.ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>

        {/* Enterprise Compliance Guarantee Footer */}
        <div className="mt-14 p-6 rounded-3xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-semibold text-slate-700">
              Need custom multi-region invoicing, sovereign cloud isolation, or a formal vendor risk questionnaire?
            </span>
          </div>
          <Link
            href="/contact"
            className="font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 shrink-0"
          >
            <span>Request Enterprise Procurement Pack</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
