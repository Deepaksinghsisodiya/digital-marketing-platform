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
    (content.sectionTitle as string) || "Predictable Growth Infrastructure";
  const sectionSubtitle =
    (content.sectionSubtitle as string) ||
    "Transparent engagement models engineered for enterprise marketing velocity, verifiable attribution, and compliance.";

  const rawPlans: PricingPlan[] = (content.plans as PricingPlan[]) || [
    {
      name: "Growth Engine",
      description:
        "For scaling B2B businesses establishing full-funnel digital dominance.",
      monthlyPrice: "$2,490",
      annualPrice: "$1,990",
      regionalPricing: {
        IN: { monthly: "₹1,89,000", annual: "₹1,49,000" },
        US: { monthly: "$2,490", annual: "$1,990" },
      },
      features: [
        "Multi-Touch Attribution Engine",
        "Deterministic Lead Scoring & Tracking",
        "Automated Paid Campaign Optimization",
        "Weekly Growth Architect Advisory",
        "Standard SLA & SOC2 Compliance",
      ],
      ctaText: "Launch Growth Engine",
      ctaLink: "/contact",
      isPopular: false,
    },
    {
      name: "Enterprise Scale",
      badge: "Most Selected",
      description:
        "For mid-to-large enterprises requiring multi-region campaign governance.",
      monthlyPrice: "$4,990",
      annualPrice: "$3,990",
      regionalPricing: {
        IN: { monthly: "₹3,79,000", annual: "₹2,99,000" },
        US: { monthly: "$4,990", annual: "$3,990" },
      },
      features: [
        "Everything in Growth Engine, plus:",
        "Cross-Border Multi-Region Routing",
        "Custom Lead Pipeline Automation",
        "Real-Time Server-Side Event Tracking",
        "Dedicated Senior Growth Director",
        "24/7 Dedicated Support & 99.9% SLA",
      ],
      ctaText: "Request Enterprise Pilot",
      ctaLink: "/contact",
      isPopular: true,
    },
    {
      name: "Institutional Sovereign",
      description:
        "Tailored private infrastructure for Fortune 1000 and regulated entities.",
      monthlyPrice: "Custom",
      annualPrice: "Custom",
      regionalPricing: {
        IN: { monthly: "Custom", annual: "Custom" },
        US: { monthly: "Custom", annual: "Custom" },
      },
      features: [
        "Dedicated Isolated Cloud Cluster",
        "Custom Data Protection & DPDP Audits",
        "Full CRM & ERP Bidirectional Sync",
        "Custom Transactional Workflows",
        "Dedicated 4-Person Growth Guild",
        "Executive Strategy Reviews (Quarterly)",
      ],
      ctaText: "Speak with Architecture Team",
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                plan.isPopular
                  ? "bg-indigo-50/50 border-2 border-indigo-600 shadow-xl shadow-indigo-600/10 scale-105 z-10"
                  : "bg-white border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-lg"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md">
                  {plan.badge}
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-xs text-slate-600 min-h-[36px] leading-relaxed mb-6">
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
                      <span className="text-xs text-slate-500 font-medium">
                        / month billed annually
                      </span>
                    )}
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  {plan.features.map((feat, featIdx) => (
                    <div
                      key={featIdx}
                      className="flex items-start gap-2.5 text-xs text-slate-700"
                    >
                      <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-200">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Action */}
              <Link
                href={plan.ctaLink}
                className={`w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl text-xs font-bold transition-all shadow-md ${
                  plan.isPopular
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30 hover:scale-105 active:scale-95"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200"
                }`}
              >
                <span>{plan.ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
