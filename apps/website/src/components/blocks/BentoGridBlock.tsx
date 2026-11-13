import React from "react";
import Link from "next/link";
import type { CmsBlock } from "../../lib/cms";
import { Badge } from "../ui/badge";
import {
  TrendingUp,
  SearchCode,
  Sparkles,
  BarChart3,
  Cpu,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export const BentoGridBlock: React.FC<{ block: CmsBlock }> = ({ block }) => {
  const { content } = block;
  const sectionTitle =
    (content.sectionTitle as string) || "Engineered for Exponential Conversion";
  const sectionSubtitle =
    (content.sectionSubtitle as string) ||
    "A unified digital marketing architecture eliminating attribution loss and maximizing pipeline velocity.";

  return (
    <section className="py-24 px-6 sm:px-10 lg:px-12 xl:px-16 max-w-[1720px] 2xl:max-w-[1920px] mx-auto space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="accent">Full-Funnel Architecture</Badge>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          {sectionTitle}
        </h2>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
          {sectionSubtitle}
        </p>
      </div>

      {/* Bento Grid Layout (3x2 asymmetric) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-6">
        {/* Card 1: Large Span 8 (Attribution & Server Tracking) */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50/60 via-white to-slate-50 p-8 sm:p-10 shadow-lg relative overflow-hidden flex flex-col justify-between group hover:border-indigo-400 hover:shadow-xl transition-all duration-300">
          <div className="space-y-4 relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold">
              <BarChart3 className="w-3.5 h-3.5" /> Deterministic Attribution
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Server-Side Conversion Tracking & Audit Trail
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Bypass browser cookie blocks, iOS ad shields, and client-side
              loss. Nexora logs conversion events directly to Meta CAPI, Google
              Ads, and CRM with cryptographic proof.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 99.8% Tracking Accuracy
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-indigo-700">
                <ShieldCheck className="w-4 h-4 text-indigo-600" /> Zero Third-Party Reliance
              </span>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 mt-8 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Integrated Looker & BI exports
            </span>
            <Link
              href="/services/analytics-reporting"
              className="font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1"
            >
              Learn about Attribution &rarr;
            </Link>
          </div>
        </div>

        {/* Card 2: Span 4 (High-Intent SEO) */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col justify-between group hover:border-indigo-400 hover:shadow-xl transition-all duration-300">
          <div className="space-y-4">
            <div className="p-3 rounded-2xl bg-cyan-50 text-cyan-700 border border-cyan-200 w-fit">
              <SearchCode className="w-6 h-6" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Programmatic SEO Architecture
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dominate commercial search terms through programmatic landing
              templates, sub-second TTFB, and schema-rich FAQ markup.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6">
            <Link
              href="/services/seo"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1"
            >
              Explore Search Strategy &rarr;
            </Link>
          </div>
        </div>

        {/* Card 3: Span 4 (Paid Media PPC) */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col justify-between group hover:border-indigo-400 hover:shadow-xl transition-all duration-300">
          <div className="space-y-4">
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200 w-fit">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Algorithmic Paid Media
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Continuous negative keyword matching and account-based retargeting
              eliminating up to 40% in wasted ad budget.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6">
            <Link
              href="/services/paid-ads"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1"
            >
              Explore Paid Ads &rarr;
            </Link>
          </div>
        </div>

        {/* Card 4: Span 4 (Scientific CRO) */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col justify-between group hover:border-indigo-400 hover:shadow-xl transition-all duration-300">
          <div className="space-y-4">
            <div className="p-3 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 w-fit">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Scientific CRO Lab
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Continuous multivariate split testing on contact forms, value
              propositions, and page layouts to double visitor-to-SQL rates.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6">
            <Link
              href="/services/cro"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1"
            >
              Explore Conversion Lab &rarr;
            </Link>
          </div>
        </div>

        {/* Card 5: Span 4 (Automated Lead Routing) */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col justify-between group hover:border-indigo-400 hover:shadow-xl transition-all duration-300">
          <div className="space-y-4">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Automated Lead Routing & Outbox
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Inbound inquiries are instantly scored [0-100], routed to sales
              reps based on regional territory, and synchronized via SSRF-safe
              webhooks.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6">
            <Link
              href="/services/marketing-automation-crm"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1"
            >
              Explore RevOps Sync &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
