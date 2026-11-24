/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { CmsBlock } from "../../lib/cms";
import {
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Building2,
  CheckCircle2,
  Layers,
  ArrowRight,
} from "lucide-react";
import { CountUp } from "../motion/CountUp";
import { Stagger, StaggerItem } from "../motion/Stagger";

export interface CaseStudyItem {
  id?: string;
  title: string;
  client: string;
  category: string;
  metric: string;
  metricLabel?: string;
  summary: string;
  imageUrl?: string;
  clientLogoUrl?: string;
  caseStudyUrl?: string;
  featured?: boolean;
  enabled?: boolean;
}

const DEFAULT_CASE_STUDIES: CaseStudyItem[] = [
  {
    title: "Enterprise B2B Pipeline Scaled by 312% in 6 Months",
    client: "Apex Cloud Infrastructure",
    category: "B2B SaaS & Cloud",
    metric: "312%",
    metricLabel: "Qualified Inbound Pipeline Velocity",
    summary: "Re-engineered global commercial search architecture and implemented deterministic multi-touch attribution, driving $4.2M in net new ARR.",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    caseStudyUrl: "/case-studies/apex-cloud",
    featured: true,
    enabled: true,
  },
  {
    title: "Global DTC E-Commerce Revenue Tripled via Full-Funnel ABM",
    client: "UrbanLux Apparel",
    category: "E-Commerce & DTC",
    metric: "3.4x",
    metricLabel: "Blended Return on Ad Spend (ROAS)",
    summary: "Deployed sub-second headless Next.js storefront paired with predictive Meta + TikTok audience modeling across 14 international markets.",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    caseStudyUrl: "/case-studies/urbanlux",
    featured: true,
    enabled: true,
  },
  {
    title: "Fintech Enterprise Qualified Lead Cost Slashed by 54%",
    client: "Synapse Financial Networks",
    category: "Fintech & Banking",
    metric: "-54%",
    metricLabel: "Cost Per Qualified Institutional Lead",
    summary: "Automated institutional lead scoring and continuous landing page split-testing, yielding 1,800+ compliant financial advisor inquiries.",
    imageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
    caseStudyUrl: "/case-studies/synapse-financial",
    featured: false,
    enabled: true,
  },
];

export const CaseStudiesBlock: React.FC<{ block: CmsBlock }> = ({ block }) => {
  const { content } = block;
  const sectionTitle =
    (content?.sectionTitle as string) ||
    "Proven Commercial Outcomes & Enterprise Case Studies";
  const sectionSubtitle =
    (content?.sectionSubtitle as string) ||
    "Real, verifiable revenue acceleration delivered through bespoke marketing infrastructure, programmatic SEO, and deterministic attribution.";

  const rawCaseStudies = Array.isArray(content?.caseStudies)
    ? (content.caseStudies as CaseStudyItem[])
    : [];

  const rawActive = rawCaseStudies.filter(
    (item) => item && item.enabled !== false && item.title && item.client,
  );
  const activeStudies = rawActive.length > 0 ? rawActive : DEFAULT_CASE_STUDIES;

  const categories = [
    "All",
    ...Array.from(new Set(activeStudies.map((s) => s.category).filter(Boolean))),
  ];

  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const filteredStudies =
    selectedCategory === "All"
      ? activeStudies
      : activeStudies.filter((s) => s.category === selectedCategory);

  if (activeStudies.length === 0) {
    return null;
  }

  return (
    <section className="py-10 sm:py-16 lg:py-20 bg-gradient-to-b from-white via-slate-50/70 to-white text-slate-900 border-t border-slate-200/80 w-full relative overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-primary/5 blur-[160px] pointer-events-none rounded-full" />

      {/* Unified max-w-7xl container with exact navbar padding (px-4 sm:px-6 lg:px-8) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2.5 sm:space-y-4 mb-8 sm:mb-12 lg:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Verifiable Track Record</span>
          </div>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            {sectionTitle}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
            {sectionSubtitle}
          </p>

          {/* Category Filter Pills */}
          {categories.length > 2 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-2.5 sm:pt-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  type="button"
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-105"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-primary/40 hover:text-primary hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 100% Pure CSS Grid for Tablet & Mobile:
            - Mobile (< 640px): 1 clean full-width column (grid-cols-1)
            - Tablet (640px - 1023px): 2 balanced columns (sm:grid-cols-2)
            - Desktop & Large Screen (1024px+): 3 columns (lg:grid-cols-3)
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 items-stretch w-full">
          {filteredStudies.map((study, idx) => {
            const hasCustomImage =
              typeof study.imageUrl === "string" &&
              study.imageUrl.trim().length > 0 &&
              !study.imageUrl.startsWith("blob:");

            return (
              <div
                key={study.id || idx}
                className="group relative rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white overflow-hidden shadow-xs hover:shadow-2xl hover:border-primary/50 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between w-full h-full"
              >
                {/* Visual Thumbnail */}
                <div className="relative h-44 sm:h-52 md:h-56 w-full overflow-hidden bg-slate-100 shrink-0">
                  {hasCustomImage ? (
                    <img
                      src={study.imageUrl}
                      alt={study.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-slate-900 to-indigo-900 text-white p-6">
                      <div className="text-center space-y-2">
                        <Building2 className="w-9 h-9 sm:w-10 sm:h-10 mx-auto text-primary/80" />
                        <span className="font-extrabold text-xs sm:text-sm tracking-wide">
                          {study.client}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Hover Overlay: "View Case Study" Pill */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                    <span className="px-3.5 py-1.5 rounded-full bg-white/95 text-slate-900 text-xs font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-1.5">
                      <span>View case study</span>
                      <ArrowRight className="w-3.5 h-3.5 text-primary" />
                    </span>
                  </div>

                  {/* Category Chip */}
                  <div className="absolute top-2.5 sm:top-3.5 left-2.5 sm:left-3.5 z-10">
                    <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider bg-white/95 backdrop-blur-md text-slate-900 shadow-sm border border-slate-200/60">
                      {study.category}
                    </span>
                  </div>

                  {/* Impact Metric Floating Badge */}
                  <div className="absolute bottom-2.5 sm:bottom-3.5 right-2.5 sm:right-3.5 z-10 bg-black/85 backdrop-blur-md text-white px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl shadow-xl border border-white/15 flex items-center gap-1.5 sm:gap-2">
                    <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-xs sm:text-sm md:text-base font-black tracking-tight text-white leading-none">
                        <CountUp value={study.metric} />
                      </div>
                      {study.metricLabel && (
                        <div className="text-[8px] sm:text-[9px] font-medium text-slate-300 leading-tight mt-0.5">
                          {study.metricLabel}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-4 sm:p-5 md:p-6 lg:p-7 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] sm:text-xs font-extrabold text-primary uppercase tracking-wider mb-1.5 sm:mb-2">
                      {study.client}
                    </div>

                    <h3 className="text-base sm:text-lg lg:text-xl font-black text-slate-900 tracking-tight leading-snug group-hover:text-primary transition-colors">
                      {study.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 mt-2 sm:mt-2.5 leading-relaxed font-normal">
                      {study.summary}
                    </p>
                  </div>

                  <div className="mt-5 sm:mt-6 pt-3.5 sm:pt-4 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={study.caseStudyUrl || "/contact"}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 group-hover:text-primary transition-colors"
                    >
                      <span>Explore Case Study</span>
                      <ArrowUpRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-10 sm:mt-14 text-center">
          <Link
            href="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs sm:text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            <span>Request Custom Case Studies For Your Industry</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </Link>
        </div>
      </div>
    </section>
  );
};
