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
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
          {sectionTitle}
        </h2>
        <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
          {sectionSubtitle}
        </p>
      </div>

      {/* Bento Grid Layout (3x2 asymmetric) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-6">
        {/* Card 1: Large Span 8 (Attribution & Server Tracking) */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-indigo-950/40 to-slate-900/90 p-8 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col justify-between group hover:border-indigo-500/50 transition-all duration-300">
          <div className="space-y-4 relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold">
              <BarChart3 className="w-3.5 h-3.5" /> Deterministic Attribution
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Server-Side Conversion Tracking & Audit Trail
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Bypass browser cookie blocks, iOS ad shields, and client-side
              loss. Nexora logs conversion events directly to Meta CAPI, Google
              Ads, and CRM with cryptographic proof.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> 99.8% Tracking Accuracy
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-indigo-400">
                <ShieldCheck className="w-4 h-4" /> Zero Third-Party Reliance
              </span>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/80 mt-8 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Integrated Looker & BI exports
            </span>
            <Link
              href="/services/analytics-reporting"
              className="font-bold text-indigo-400 hover:text-white transition flex items-center gap-1"
            >
              Learn about Attribution &rarr;
            </Link>
          </div>
        </div>

        {/* Card 2: Span 4 (High-Intent SEO) */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl flex flex-col justify-between group hover:border-cyan-500/50 transition-all duration-300">
          <div className="space-y-4">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 w-fit">
              <SearchCode className="w-6 h-6" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Programmatic SEO Architecture
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dominate commercial search terms through programmatic landing
              templates, sub-second TTFB, and schema-rich FAQ markup.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-800/80 mt-6">
            <Link
              href="/services/seo"
              className="text-xs font-bold text-cyan-400 hover:text-white transition flex items-center gap-1"
            >
              Explore Search Strategy &rarr;
            </Link>
          </div>
        </div>

        {/* Card 3: Span 4 (Paid Media PPC) */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl flex flex-col justify-between group hover:border-indigo-500/50 transition-all duration-300">
          <div className="space-y-4">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 w-fit">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Algorithmic Paid Media
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Continuous negative keyword matching and account-based retargeting
              eliminating up to 40% in wasted ad budget.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-800/80 mt-6">
            <Link
              href="/services/paid-ads"
              className="text-xs font-bold text-indigo-400 hover:text-white transition flex items-center gap-1"
            >
              Explore Paid Ads &rarr;
            </Link>
          </div>
        </div>

        {/* Card 4: Span 4 (Scientific CRO) */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl flex flex-col justify-between group hover:border-purple-500/50 transition-all duration-300">
          <div className="space-y-4">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 w-fit">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Scientific CRO Lab
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Continuous multivariate split testing on contact forms, value
              propositions, and page layouts to double visitor-to-SQL rates.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-800/80 mt-6">
            <Link
              href="/services/cro"
              className="text-xs font-bold text-purple-400 hover:text-white transition flex items-center gap-1"
            >
              Explore Conversion Lab &rarr;
            </Link>
          </div>
        </div>

        {/* Card 5: Span 4 (Automated Lead Routing) */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl flex flex-col justify-between group hover:border-emerald-500/50 transition-all duration-300">
          <div className="space-y-4">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Automated Lead Routing & Outbox
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inbound inquiries are instantly scored [0-100], routed to sales
              reps based on regional territory, and synchronized via SSRF-safe
              webhooks.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-800/80 mt-6">
            <Link
              href="/services/marketing-automation-crm"
              className="text-xs font-bold text-emerald-400 hover:text-white transition flex items-center gap-1"
            >
              Explore RevOps Sync &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
