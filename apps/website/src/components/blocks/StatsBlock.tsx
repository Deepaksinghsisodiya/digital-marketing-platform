import React from "react";
import type { CmsBlock } from "../../lib/cms";
import { TrendingUp, ShieldCheck, DollarSign, Clock } from "lucide-react";

interface MetricItem {
  value: string;
  label: string;
}

const STAT_ICONS = [TrendingUp, DollarSign, ShieldCheck, Clock];

export const StatsBlock: React.FC<{ block: CmsBlock }> = ({ block }) => {
  const { content } = block;
  const metrics = (content.metrics as MetricItem[]) || [
    { value: "340%", label: "Avg Pipeline Velocity" },
    { value: "$120M+", label: "Enterprise Revenue Influenced" },
    { value: "99.8%", label: "Attribution Precision" },
    { value: "14 Days", label: "Time to Deploy & Convert" },
  ];

  return (
    <section className="py-16 bg-slate-50 border-y border-slate-200 text-slate-900 px-6 sm:px-10 lg:px-12 xl:px-16 relative overflow-hidden">
      <div className="max-w-[1720px] 2xl:max-w-[1920px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {metrics.map((m, idx) => {
          const Icon = STAT_ICONS[idx % STAT_ICONS.length] ?? STAT_ICONS[0]!;
          return (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 hover:border-indigo-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  Sample Metric
                </span>
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl lg:text-4xl font-black text-slate-900">
                {m.value}
              </div>
              <div className="text-xs font-semibold text-slate-600 leading-snug">
                {m.label}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
