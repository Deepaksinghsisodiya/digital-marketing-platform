"use client";

import React from "react";
import type { CmsBlock } from "../../lib/cms";
import { SectionHeading } from "../ui/SectionHeading";
import { Marquee } from "../motion/Marquee";
import { Cpu } from "lucide-react";

interface TechItem {
  name: string;
  category: string;
}

const ROW_1: TechItem[] = [
  { name: "Google Ads", category: "Search & Display" },
  { name: "Meta Ads Manager", category: "Social PPC" },
  { name: "Google Analytics 4", category: "Measurement" },
  { name: "Looker Studio", category: "BI Reporting" },
  { name: "Shopify Plus", category: "E-Commerce" },
  { name: "Klaviyo", category: "Retention" },
  { name: "HubSpot", category: "Inbound CRM" },
  { name: "BigQuery", category: "Data Warehouse" },
];

const ROW_2: TechItem[] = [
  { name: "Next.js", category: "Web Framework" },
  { name: "Vercel", category: "Edge Platform" },
  { name: "Supabase", category: "Cloud Backend" },
  { name: "SEMrush", category: "Keyword Intelligence" },
  { name: "Ahrefs", category: "Backlink Authority" },
  { name: "Stripe", category: "Payment Processing" },
  { name: "Salesforce", category: "Enterprise Sales" },
  { name: "Webflow", category: "Visual CMS" },
];

export const TechEcosystemBlock: React.FC<{ block?: CmsBlock }> = ({ block }) => {
  const content = block?.content;
  const title = (content?.title as string) || "Integrated Technology Ecosystem";
  const eyebrow = (content?.eyebrow as string) || "Modern Tech Stack";
  const description =
    (content?.description as string) ||
    "Built upon industry-standard enterprise marketing, measurement, and engineering infrastructure.";

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-slate-50 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          highlight="Technology"
          description={description}
        />
      </div>

      <div className="space-y-4 sm:space-y-6 mt-8">
        {/* Row 1 - Forward Marquee */}
        <Marquee speedSec={32} pauseOnHover className="py-1">
          {ROW_1.map((item) => (
            <div
              key={item.name}
              className="inline-flex items-center gap-3 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm mx-2.5 transition-colors hover:border-primary/50"
            >
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {item.name}
                </div>
                <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                  {item.category}
                </div>
              </div>
            </div>
          ))}
        </Marquee>

        {/* Row 2 - Reverse Marquee */}
        <Marquee speedSec={30} reverse pauseOnHover className="py-1">
          {ROW_2.map((item) => (
            <div
              key={item.name}
              className="inline-flex items-center gap-3 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm mx-2.5 transition-colors hover:border-primary/50"
            >
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {item.name}
                </div>
                <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                  {item.category}
                </div>
              </div>
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
};
