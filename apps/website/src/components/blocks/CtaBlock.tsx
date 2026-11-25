import React from "react";
import Link from "next/link";
import type { CmsBlock } from "../../lib/cms";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Clock,
  Layers,
} from "lucide-react";

export const CtaBlock: React.FC<{ block: CmsBlock }> = ({ block }) => {
  const { content } = block;
  const headline =
    (content.headline as string) ||
    "Ready to Scale Revenue with Predictable Marketing ROI?";
  const buttonText =
    (content.buttonText as string) || "Schedule Executive Diagnostic";
  const buttonLink = (content.buttonLink as string) || "/contact";

  return (
    <section className="py-10 sm:py-14 lg:py-18 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative overflow-hidden">
      {/* Executive Card Container */}
      <div className="relative rounded-3xl sm:rounded-4xl border border-primary/30 bg-navy text-white p-6 sm:p-10 lg:p-12 xl:p-14 overflow-hidden shadow-2xl">
        {/* Ambient Gradient Glows (CSS-only, GPU accelerated) */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-gradient-drift" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 bg-accent/15 rounded-full blur-[120px] animate-gradient-drift" />

        {/* 2-Column Responsive Grid: Stacks gracefully on mobile/tablet, 2-col on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          {/* Left Column: Value Proposition & Checklist (Span 7) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            {/* Live Indicator Badge with Radar Ping */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-primary/15 text-primary border border-primary/30 shadow-xs">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>Zero-Obligation Growth Assessment</span>
            </div>

            {/* Headline */}
            <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.18]">
              {headline}
            </h2>

            {/* Subheadline in Plain Customer-Facing Language */}
            <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed font-normal max-w-2xl">
              Book an executive growth diagnostic with our senior performance
              marketing directors. We analyze your customer acquisition funnel,
              ad spend efficiency, attribution models, and present a custom
              90-day ROI roadmap.
            </p>

            {/* 3 High-Value Deliverables Checklist */}
            <div className="pt-2 space-y-2.5 sm:space-y-3">
              <div className="flex items-start gap-3 p-3 sm:p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30 transition-colors">
                <div className="w-6 h-6 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0 mt-0.5">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    Ad Spend &amp; Funnel Efficiency Audit
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                    Identify budget leakage and verify true customer acquisition cost across channels.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 sm:p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30 transition-colors">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    Custom 90-Day Scaling Blueprint
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                    Target ROAS projections, recommended media mix, and conversion optimization plan.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 sm:p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30 transition-colors">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    Direct Senior Strategist Diagnostic
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                    1-on-1 strategy session with senior growth directors — zero sales reps, pure strategic insight.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: High-Impact Action Card (Span 5) */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl sm:rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 p-5 sm:p-7 lg:p-8 shadow-2xl space-y-4 sm:space-y-5 text-center relative overflow-hidden">
              {/* Subtle accent border top */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-cyan-400 to-primary" />

              <div className="space-y-2">
                <span className="inline-block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-3 py-0.5 rounded-full">
                  Complimentary Executive Diagnostic
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Claim Your 2026 Growth Audit
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Limited to 5 qualified enterprise brands per month to ensure deep strategic analysis.
                </p>
              </div>

              <div className="pt-2 space-y-3">
                <Link
                  href={buttonLink}
                  className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl sm:rounded-2xl bg-primary hover:bg-primary-hover px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-black text-primary-foreground shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all group cursor-pointer"
                >
                  <span>{buttonText}</span>
                  <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform text-primary-foreground" />
                </Link>

                <Link
                  href="/case-studies"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl border border-white/20 bg-white/5 hover:bg-white/15 px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-white transition shadow-xs cursor-pointer"
                >
                  <span>Explore Audited Case Studies</span>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-left text-[11px] text-slate-300 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  100% Confidential
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  48-Hour Delivery
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  NDA Backed
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  Zero Sales Pressure
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};