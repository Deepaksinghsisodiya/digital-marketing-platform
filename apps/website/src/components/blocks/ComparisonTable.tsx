import React from "react";
import type { CmsBlock } from "../../lib/cms";
import Link from "next/link";
import { Check, X, Sparkles, ShieldCheck, ArrowRight, Zap } from "lucide-react";

interface ComparisonRow {
  feature: string;
  category?: string;
  nexora: string | boolean;
  agency: string | boolean;
  freelancer: string | boolean;
}

interface ComparisonContent {
  sectionTitle?: string;
  sectionSubtitle?: string;
  sampleBadgeText?: string;
  ctaText?: string;
  ctaLink?: string;
  rows?: ComparisonRow[];
}

export const ComparisonTable: React.FC<{ block: CmsBlock }> = ({ block }) => {
  const content = (block.content || {}) as ComparisonContent;

  const title = content.sectionTitle || "Why High-Growth Brands Switch to Nexora";
  const subtitle =
    content.sectionSubtitle ||
    "See how our dedicated performance growth model compares against traditional agencies and fragmented teams.";

  const rows: ComparisonRow[] = content.rows || [
    {
      feature: "Performance Reporting",
      category: "Transparency",
      nexora: "Live 24/7 Revenue & ROAS Dashboard",
      agency: "Monthly PDF reports with vanity clicks",
      freelancer: "Basic Google Analytics 4",
    },
    {
      feature: "Account Leadership",
      category: "Talent",
      nexora: "Dedicated Senior Growth Director (8+ Yrs)",
      agency: "Junior account manager / Intern",
      freelancer: "Self-directed contractor",
    },
    {
      feature: "Campaign Execution Velocity",
      category: "Agility",
      nexora: "48 - 72 Hours Sprint Turnaround",
      agency: "3 - 6 Weeks per iteration",
      freelancer: "Unpredictable / Ad-hoc",
    },
    {
      feature: "High-Converting Landing Pages & CRO",
      category: "Conversion",
      nexora: true,
      agency: false,
      freelancer: false,
    },
    {
      feature: "Closed-Loop Revenue Attribution",
      category: "ROI Tracking",
      nexora: "Direct CRM Sales Mapping",
      agency: "Vanity impressions & reach",
      freelancer: false,
    },
    {
      feature: "Contract Commitments",
      category: "Terms",
      nexora: "Month-to-Month (Zero Lock-in)",
      agency: "Strict 12-Month Lock-in",
      freelancer: "Hourly / Uncertain",
    },
  ];

  const renderCell = (val: string | boolean, isNexora: boolean) => {
    if (typeof val === "boolean") {
      return val ? (
        <span
          className={`inline-flex items-center justify-center w-7 h-7 rounded-full shadow-2xs ${
            isNexora
              ? "bg-indigo-600 text-white"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          <Check className="w-4 h-4 stroke-[2.5]" />
        </span>
      ) : (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-400">
          <X className="w-4 h-4" />
        </span>
      );
    }
    return (
      <span
        className={`text-sm ${
          isNexora
            ? "font-extrabold text-indigo-700"
            : "font-medium text-slate-600"
        }`}
      >
        {val}
      </span>
    );
  };

  return (
    <section className="py-20 lg:py-28 bg-white px-4 sm:px-6 lg:px-8 border-t border-slate-200/80 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/5 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Competitive Matrix</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary/20 text-primary font-extrabold">
              Benchmark
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {title}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            {subtitle}
          </p>
        </div>

        {/* Table Card */}
        <div className="overflow-x-auto rounded-3xl border border-slate-200 shadow-xl bg-white">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90">
                <th className="py-6 px-8 text-xs font-extrabold text-slate-500 uppercase tracking-widest w-2/5">
                  Capability / Attribute
                </th>
                <th className="py-6 px-6 text-base font-black text-indigo-900 bg-indigo-50/80 border-x border-indigo-200/80 w-1/5 text-center relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                    Recommended
                  </div>
                  <span className="flex items-center justify-center gap-1.5 mt-1 text-indigo-700">
                    <Zap className="w-4 h-4 fill-indigo-600 text-indigo-600" />
                    Nexora Platform
                  </span>
                </th>
                <th className="py-6 px-6 text-sm font-bold text-slate-700 w-1/5 text-center">
                  Traditional Agency
                </th>
                <th className="py-6 px-6 text-sm font-bold text-slate-700 w-1/5 text-center">
                  In-House / Freelance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/80 transition-colors duration-150"
                >
                  <td className="py-5 px-8">
                    <span className="font-bold text-slate-900 text-sm block">
                      {row.feature}
                    </span>
                    {row.category && (
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        {row.category}
                      </span>
                    )}
                  </td>
                  <td className="py-5 px-6 text-center bg-indigo-50/40 border-x border-indigo-100">
                    {renderCell(row.nexora, true)}
                  </td>
                  <td className="py-5 px-6 text-center">
                    {renderCell(row.agency, false)}
                  </td>
                  <td className="py-5 px-6 text-center">
                    {renderCell(row.freelancer, false)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Compliance & Trust Bar under table */}
          <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600 px-8">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span className="font-semibold text-slate-700">
                All Nexora deployments include deterministic attribution SLA & SOC2 Type II compliance.
              </span>
            </div>
            <span className="text-slate-400 font-mono text-[11px]">
              Verified Benchmarks Q4 2026
            </span>
          </div>
        </div>

        {/* CTA below table */}
        <div className="mt-14 text-center">
          <Link
            href={content.ctaLink || "/contact"}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <span>{content.ctaText || "Deploy Nexora For Your Brand"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
