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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Card 1: Large Span 8 (Attribution & Server Tracking) */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-200/90 bg-gradient-to-br from-indigo-50/70 via-white to-slate-50/60 p-8 sm:p-12 shadow-sm hover:shadow-2xl hover:border-indigo-400 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group">
          {/* Ambient decorative glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-300/40 transition-colors" />

          <div className="space-y-5 relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold shadow-2xs">
              <BarChart3 className="w-4 h-4 text-indigo-600" /> Deterministic Attribution Engine
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Server-Side Conversion Tracking & Cryptographic Audit Trail
            </h3>
            <p className="text-base text-slate-600 leading-relaxed font-normal">
              Bypass browser cookie blocks, iOS ad shields, and client-side
              loss. Nexora logs conversion events directly to Meta CAPI, Google
              Ads, and CRM with cryptographic proof.
            </p>
            <div className="pt-3 flex flex-wrap gap-4 text-xs">
              <span className="flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 99.8% Tracking Accuracy
              </span>
              <span className="flex items-center gap-1.5 font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-200 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-indigo-600" /> Zero Third-Party Reliance
              </span>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200/80 mt-8 flex items-center justify-between text-xs relative z-10">
            <span className="text-slate-500 font-medium">
              Integrated Looker, BigQuery & CRM exports
            </span>
            <Link
              href="/services/analytics-reporting"
              className="font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1.5 group-hover:translate-x-1"
            >
              <span>Deep-dive into Attribution</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Card 2: Span 4 (High-Intent SEO) */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-10 shadow-sm hover:shadow-xl hover:border-indigo-400 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-600 group-hover:text-white transition-all duration-300">
              <SearchCode className="w-6 h-6" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
              Programmatic SEO Architecture
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Dominate commercial search terms through programmatic landing
              templates, sub-second TTFB, and schema-rich FAQ markup.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6">
            <Link
              href="/services/seo"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 group-hover:translate-x-1"
            >
              <span>Explore Search Strategy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 3: Span 4 (Paid Media PPC) */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-10 shadow-sm hover:shadow-xl hover:border-indigo-400 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
              Algorithmic Paid Media
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Continuous negative keyword matching and account-based retargeting
              eliminating up to 40% in wasted ad budget.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6">
            <Link
              href="/services/paid-ads"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 group-hover:translate-x-1"
            >
              <span>Explore Paid Ads</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 4: Span 4 (Scientific CRO) */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-10 shadow-sm hover:shadow-xl hover:border-indigo-400 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
              Scientific CRO Lab
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Continuous multivariate split testing on contact forms, value
              propositions, and page layouts to double visitor-to-SQL rates.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6">
            <Link
              href="/services/cro"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 group-hover:translate-x-1"
            >
              <span>Explore Conversion Lab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 5: Span 4 (Automated Lead Routing) */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-10 shadow-sm hover:shadow-xl hover:border-indigo-400 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
              Automated Lead Routing & Outbox
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Inbound inquiries are instantly scored [0-100], routed to sales
              reps based on regional territory, and synchronized via SSRF-safe
              webhooks.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6">
            <Link
              href="/services/marketing-automation-crm"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 group-hover:translate-x-1"
            >
              <span>Explore RevOps Sync</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
