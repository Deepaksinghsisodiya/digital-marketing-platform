"use client";

import React from "react";
import type { CmsBlock } from "../../lib/cms";
import { Check, X, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "../ui/SectionHeading";

interface ComparisonRow {
  feature: string;
  category?: string;
  nexora: string | boolean;
  agency: string | boolean;
  freelancer: string | boolean;
}

const DEFAULT_ROWS: ComparisonRow[] = [
  {
    category: "Analytics & Tracking",
    feature: "Attribution Engine",
    nexora: "Deterministic Multi-Touch ML",
    agency: "Manual spreadsheets / Last-click",
    freelancer: "Basic Google Analytics 4",
  },
  {
    category: "Agility & Speed",
    feature: "Campaign Launch Time",
    nexora: "48 - 72 Hours",
    agency: "3 - 6 Weeks",
    freelancer: "Unpredictable / Ad-hoc",
  },
  {
    category: "Engineering & Web",
    feature: "High-Speed Headless Tech (Next.js)",
    nexora: true,
    agency: false,
    freelancer: false,
  },
  {
    category: "Governance",
    feature: "Cross-Border Regulatory Compliance",
    nexora: true,
    agency: false,
    freelancer: false,
  },
  {
    category: "Performance SLA",
    feature: "Dedicated Slack & Sub-2hr Response",
    nexora: true,
    agency: false,
    freelancer: false,
  },
  {
    category: "Accountability",
    feature: "Transparent Retainer (Zero Lock-In)",
    nexora: true,
    agency: false,
    freelancer: true,
  },
];

interface ComparisonTableBlockProps {
  block: CmsBlock;
}

export const ComparisonTableBlock: React.FC<ComparisonTableBlockProps> = ({ block }) => {
  const content = block.content || {};
  const sectionTitle =
    (content.sectionTitle as string) ||
    "Why High-Velocity Brands Choose Nexora";
  const sectionSubtitle =
    (content.sectionSubtitle as string) ||
    "See how our unified digital marketing platform compares against traditional agencies and fragmented teams.";

  const rawRows = (content.rows as ComparisonRow[]) || [];
  const rows = rawRows.length > 0 ? rawRows : DEFAULT_ROWS;

  const renderValue = (val: string | boolean, isNexora: boolean) => {
    if (typeof val === "boolean") {
      return val ? (
        <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${isNexora ? "bg-primary text-white" : "bg-emerald-100 text-emerald-700"}`}>
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </div>
      ) : (
        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400">
          <X className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
      );
    }
    return (
      <span className={`text-xs font-semibold ${isNexora ? "text-primary font-bold" : "text-slate-600"}`}>
        {val}
      </span>
    );
  };

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden bg-background border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading
          eyebrow="Market Comparison Matrix"
          title={sectionTitle}
          description={sectionSubtitle}
          align="center"
        />

        {/* Comparison Table */}
        <div className="mt-12 overflow-x-auto">
          <div className="min-w-[680px] bg-card rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70">
                  <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 w-2/5">
                    Strategic Capability
                  </th>
                  <th className="py-5 px-6 text-center w-1/5 bg-primary/5 border-x border-primary/20">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary text-white shadow-xs">
                      <Sparkles className="w-3 h-3" />
                      Nexora Platform
                    </div>
                  </th>
                  <th className="py-5 px-6 text-center text-xs font-bold text-slate-600 w-1/5">
                    Traditional Agency
                  </th>
                  <th className="py-5 px-6 text-center text-xs font-bold text-slate-600 w-1/5">
                    Freelancer / Ad-Hoc
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-xs text-slate-900">
                        {row.feature}
                      </div>
                      {row.category && (
                        <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">
                          {row.category}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center bg-primary/5 border-x border-primary/20">
                      {renderValue(row.nexora, true)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {renderValue(row.agency, false)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {renderValue(row.freelancer, false)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA Banner below table */}
        <div className="mt-8 flex justify-center">
          <Link
            href={(content.ctaLink as string) || "/contact"}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-sm"
          >
            <span>{(content.ctaText as string) || "Deploy Nexora For Your Brand"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
