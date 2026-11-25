"use client";

import React from "react";
import Link from "next/link";
import type { CmsBlock } from "../../lib/cms";
import { ArrowRight, TrendingUp, BarChart3, Target, CheckCircle2 } from "lucide-react";

export const CaseStudyShowcaseBlock: React.FC<{ block: CmsBlock }> = ({ block }) => {
  const { content } = block;
  const title = (content?.title as string) || "Client Success Spotlight";
  const subtitle =
    (content?.subtitle as string) ||
    "Real outcomes, verified attribution data, and documented growth velocity.";

  const defaultCase = {
    company: "NexScale Cloud Platforms",
    industry: "Enterprise SaaS",
    timeline: "90-Day Sprint",
    metrics: [
      { label: "Portfolio ROAS", before: "1.2x", after: "4.85x", change: "+304%", icon: TrendingUp },
      { label: "Qualified Lead Volume", before: "140/mo", after: "920/mo", change: "+557%", icon: BarChart3 },
      { label: "Blended Acquisition Cost", before: "$84", after: "$19", change: "-77%", icon: Target },
    ],
    quote:
      "Nexora redesigned our entire funnel and deployed deterministic server tracking. Our CAC dropped by 77% within the first full quarter.",
    author: "Chief Growth Officer",
    link: "/case-studies",
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background text-foreground w-full relative overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-14">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            <span>Documented Performance</span>
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
            {title}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed font-normal">
            {subtitle}
          </p>
        </div>

        {/* Big Showcase Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-card p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          {/* Top Row: Client Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                {defaultCase.industry} • {defaultCase.timeline}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                {defaultCase.company}
              </h3>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Verified Case Study
            </span>
          </div>

          {/* Metrics 3-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 my-8">
            {defaultCase.metrics.map((m, i) => {
              const Icon = m.icon;
              return (
                <div
                  key={i}
                  className="p-5 sm:p-6 rounded-2xl bg-surface border border-slate-200/90 hover:border-primary/40 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {m.label}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="flex items-end gap-3 mt-2">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Before</div>
                      <div className="text-sm font-bold text-slate-400 line-through font-mono">
                        {m.before}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-primary mb-1 shrink-0" />
                    <div>
                      <div className="text-[10px] text-primary font-bold uppercase">After Nexora</div>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                        {m.after}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                    <span>{m.change} measurable improvement</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quote & CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pt-6 border-t border-slate-100">
            <div className="space-y-1 max-w-xl">
              <p className="text-xs sm:text-sm text-slate-700 italic font-medium leading-relaxed">
                &ldquo;{defaultCase.quote}&rdquo;
              </p>
              <p className="text-xs font-bold text-slate-900">
                — {defaultCase.author}, {defaultCase.company}
              </p>
            </div>

            <Link
              href={defaultCase.link}
              className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-5 sm:px-6 py-3 text-xs sm:text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 hover:shadow-primary/40 transition-all shrink-0 cursor-pointer group"
            >
              <span>Explore All Case Studies</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
