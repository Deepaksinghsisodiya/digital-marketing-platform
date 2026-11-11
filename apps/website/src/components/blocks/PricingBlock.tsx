"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { CmsBlock } from "../../lib/cms";
import { Check, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

interface PricingPlan {
  name: string;
  badge?: string;
  description: string;
  monthlyPrice: string;
  annualPrice: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
  isPopular?: boolean;
}

export const PricingBlock: React.FC<{ block: CmsBlock }> = ({ block }) => {
  const { content } = block;
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("annual");

  const sectionTitle = (content.sectionTitle as string) || "Predictable Growth Infrastructure";
  const sectionSubtitle =
    (content.sectionSubtitle as string) ||
    "Transparent engagement models engineered for enterprise marketing velocity, verifiable attribution, and compliance.";

  const plans: PricingPlan[] = (content.plans as PricingPlan[]) || [
    {
      name: "Growth Engine",
      description: "For scaling B2B businesses establishing full-funnel digital dominance.",
      monthlyPrice: "$2,490",
      annualPrice: "$1,990",
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
      description: "For mid-to-large enterprises requiring multi-region campaign governance.",
      monthlyPrice: "$4,990",
      annualPrice: "$3,990",
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
      description: "Tailored private infrastructure for Fortune 1000 and regulated entities.",
      monthlyPrice: "Custom",
      annualPrice: "Custom",
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

  return (
    <section className="relative py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden border-t border-slate-900">
      <div className="relative max-w-6xl xl:max-w-7xl 2xl:max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Investment & Pricing Models</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            {sectionTitle}
          </h2>
          <p className="text-base sm:text-lg text-slate-400 font-medium leading-relaxed">
            {sectionSubtitle}
          </p>

          {/* Billing Switcher */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span className={`text-xs font-bold ${billingPeriod === "monthly" ? "text-white" : "text-slate-400"}`}>
              Monthly Billing
            </span>
            <button
              type="button"
              onClick={() => setBillingPeriod(billingPeriod === "annual" ? "monthly" : "annual")}
              className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${
                billingPeriod === "annual" ? "bg-indigo-600 justify-end" : "bg-slate-700 justify-start"
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
            </button>
            <span className={`text-xs font-bold flex items-center gap-1.5 ${billingPeriod === "annual" ? "text-white" : "text-slate-400"}`}>
              <span>Annual Engagement</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
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
                  ? "bg-gradient-to-b from-indigo-950/80 to-slate-900 border-2 border-indigo-500 shadow-2xl shadow-indigo-600/20 scale-105 z-10"
                  : "bg-slate-900/60 border border-slate-800/90 hover:border-slate-700 backdrop-blur-xl"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md">
                  {plan.badge}
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-xs text-slate-400 min-h-[36px] leading-relaxed mb-6">{plan.description}</p>

                <div className="border-t border-b border-slate-800/80 py-6 mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl lg:text-5xl font-black text-white tracking-tight">
                      {billingPeriod === "annual" ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    {plan.annualPrice !== "Custom" && (
                      <span className="text-xs text-slate-400 font-medium">/ month billed annually</span>
                    )}
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  {plan.features.map((feat, featIdx) => (
                    <div key={featIdx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-500/20">
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
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 hover:scale-105 active:scale-95"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
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

