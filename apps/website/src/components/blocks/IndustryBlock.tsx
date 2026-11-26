"use client";

import React from "react";
import Link from "next/link";
import type { CmsBlock } from "../../lib/cms";
import { ArrowRight, Building2, CheckCircle2 } from "lucide-react";

interface IndustryItem {
  name: string;
  slug?: string;
  description?: string;
  metric?: string;
  highlights?: string[];
}

export const IndustryBlock: React.FC<{ block: CmsBlock }> = ({ block }) => {
  const { content } = block;
  const eyebrow = (content?.eyebrow as string) || "Sector Expertise";
  const title =
    (content?.title as string) ||
    (content?.sectionTitle as string) ||
    "Industries We Scale";
  const subtitle =
    (content?.subtitle as string) ||
    (content?.sectionSubtitle as string) ||
    "Vertical-specific acquisition playbooks engineered for high-intent B2B and consumer markets.";

  const industries = Array.isArray(content?.industries)
    ? (content.industries as IndustryItem[])
    : [];

  if (industries.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background text-foreground w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-14">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
            <Building2 className="w-3.5 h-3.5 text-primary" />
            <span>{eyebrow}</span>
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
            {title}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((item, idx) => (
            <div
              key={`${item.name}-${idx}`}
              className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-primary/40 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-bold text-foreground">
                    {item.name}
                  </h3>
                  {item.metric && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                      {item.metric}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                )}
                {Array.isArray(item.highlights) && item.highlights.length > 0 && (
                  <ul className="space-y-1.5 pt-2">
                    {item.highlights.map((h, hIdx) => (
                      <li
                        key={hIdx}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {item.slug && (
                <div className="pt-5 mt-5 border-t border-border">
                  <Link
                    href={`/industries/${item.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                  >
                    <span>Explore {item.name} Playbook</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
