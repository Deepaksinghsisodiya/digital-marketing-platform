import React from "react";
import type { CmsBlock } from "../../lib/cms";
import Link from "next/link";
import { Check, X, Sparkles } from "lucide-react";

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

  const title = content.sectionTitle || "Why Modern Brands Choose Nexora";
  const subtitle =
    content.sectionSubtitle ||
    "See how our unified digital marketing platform compares against traditional agencies and fragmented teams.";

  const rows: ComparisonRow[] = content.rows || [
    {
      feature: "Attribution Engine",
      category: "Technology",
      nexora: "Deterministic Multi-Touch ML",
      agency: "Manual spreadsheets / Last-click",
      freelancer: "Basic Google Analytics 4",
    },
    {
      feature: "Campaign Launch Time",
      category: "Agility",
      nexora: "48 - 72 Hours",
      agency: "3 - 6 Weeks",
      freelancer: "Unpredictable / Ad-hoc",
    },
    {
      feature: "Multi-Region Governance",
      category: "Compliance",
      nexora: true,
      agency: false,
      freelancer: false,
    },
    {
      feature: "Dedicated Growth Architect",
      category: "Talent",
      nexora: true,
      agency: "Junior account manager",
      freelancer: "Self-directed contractor",
    },
    {
      feature: "Real-time Analytics Dashboard",
      category: "Reporting",
      nexora: true,
      agency: "Monthly PDF reports",
      freelancer: false,
    },
    {
      feature: "Long-term Lock-in Contracts",
      category: "Terms",
      nexora: false,
      agency: "12-month lock-in",
      freelancer: false,
    },
  ];

  const renderCell = (val: string | boolean, isNexora: boolean) => {
    if (typeof val === "boolean") {
      return val ? (
        <span
          className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${
            isNexora
              ? "bg-indigo-600 text-white"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          <Check className="w-4 h-4" />
        </span>
      ) : (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-400">
          <X className="w-4 h-4" />
        </span>
      );
    }
    return (
      <span
        className={`text-sm font-semibold ${
          isNexora
            ? "text-indigo-600 dark:text-indigo-400"
            : "text-slate-600 dark:text-slate-300"
        }`}
      >
        {val}
      </span>
    );
  };

  return (
    <section className="py-24 bg-white dark:bg-slate-950 px-6 sm:px-10 lg:px-12 xl:px-16 border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Competitive Matrix</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-200/60 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
              Sample Comparison
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
            {subtitle}
          </p>
        </div>

        {/* Table Card */}
        <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
                <th className="py-6 px-6 text-sm font-bold text-slate-500 uppercase tracking-wider w-2/5">
                  Capability / Attribute
                </th>
                <th className="py-6 px-6 text-base font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 border-x border-indigo-100 dark:border-indigo-900 w-1/5 text-center">
                  <span className="flex items-center justify-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Nexora Platform
                  </span>
                </th>
                <th className="py-6 px-6 text-sm font-bold text-slate-600 dark:text-slate-400 w-1/5 text-center">
                  Traditional Agency
                </th>
                <th className="py-6 px-6 text-sm font-bold text-slate-600 dark:text-slate-400 w-1/5 text-center">
                  In-House / Freelance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {rows.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-5 px-6">
                    <span className="font-bold text-slate-900 dark:text-white text-sm block">
                      {row.feature}
                    </span>
                    {row.category && (
                      <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                        {row.category}
                      </span>
                    )}
                  </td>
                  <td className="py-5 px-6 text-center bg-indigo-50/30 dark:bg-indigo-950/20 border-x border-indigo-100/60 dark:border-indigo-900/40">
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
        </div>

        {/* CTA below table */}
        <div className="mt-12 text-center">
          <Link
            href={content.ctaLink || "/contact"}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition duration-300"
          >
            <span>{content.ctaText || "Deploy Nexora For Your Brand"}</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
