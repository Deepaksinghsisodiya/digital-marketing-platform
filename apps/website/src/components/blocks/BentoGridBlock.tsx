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
    (content.sectionTitle as string) ||
    "How We Turn Your Ad Spend Into Predictable Bank Revenue";
  const sectionSubtitle =
    (content.sectionSubtitle as string) ||
    "No vanity metrics. No fluff. An integrated performance growth framework engineered to lower customer acquisition costs and scale your qualified sales pipeline.";

  const rawCaseStudies = content.caseStudies as Array<{
    id: string;
    title: string;
    client: string;
    category: string;
    metric: string;
    metricLabel?: string;
    summary: string;
    imageUrl?: string;
    caseStudyUrl?: string;
    featured?: boolean;
    enabled?: boolean;
  }> | undefined;

  const caseStudies = rawCaseStudies?.filter((cs) => cs.enabled !== false);

  if (caseStudies && caseStudies.length > 0) {
    return (
      <section className="py-12 sm:py-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 sm:space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
          <Badge variant="accent">Proven Commercial Proof</Badge>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {sectionTitle}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed font-normal">
            {sectionSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {caseStudies.map((item) => (
            <div
              key={item.id}
              className="group rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs hover:shadow-2xl hover:border-indigo-400 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              <div>
                {item.imageUrl && (
                  <div className="w-full h-44 sm:h-48 rounded-2xl overflow-hidden mb-5 sm:mb-6 bg-slate-100">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-md">
                    {item.category}
                  </span>
                  <span className="text-xs font-mono font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    {item.metric}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mt-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Client: {item.client}
                </p>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 sm:mt-3 line-clamp-3 leading-relaxed font-normal">
                  {item.summary}
                </p>
              </div>

              {item.caseStudyUrl && (
                <div className="pt-5 sm:pt-6 border-t border-slate-100 mt-5 sm:mt-6">
                  <Link
                    href={item.caseStudyUrl}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition group-hover:translate-x-1"
                  >
                    <span>Read Full Case Study</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 sm:space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
        <Badge variant="accent">High-ROI Growth System</Badge>
        <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          {sectionTitle}
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed font-normal">
          {sectionSubtitle}
        </p>
      </div>

      {/* Bento Grid Layout (3x2 asymmetric) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8">
        {/* Card 1: Large Span 8 (Attribution & Real Revenue) */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-200/90 bg-gradient-to-br from-indigo-50/70 via-white to-slate-50/60 p-5 sm:p-8 lg:p-12 shadow-sm hover:shadow-2xl hover:border-indigo-400 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group">
          {/* Ambient decorative glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-300/40 transition-colors" />

          <div className="space-y-4 sm:space-y-5 relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold shadow-2xs">
              <BarChart3 className="w-4 h-4 text-indigo-600 shrink-0" /> Closed-Loop Revenue Attribution
            </div>
            <h3 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Real Revenue Tracking & Zero Wasted Ad Budget
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed font-normal">
              Stop guessing which marketing campaign is generating sales. We link
              every single ad impression on Google, Meta, and Organic Search
              directly to paying customers in your CRM with complete transparency.
            </p>
            <div className="pt-2 sm:pt-3 flex flex-wrap gap-2.5 sm:gap-4 text-xs">
              <span className="flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-emerald-200 shadow-2xs text-[11px] sm:text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" /> 100% Real Revenue Tracking
              </span>
              <span className="flex items-center gap-1.5 font-bold text-indigo-700 bg-indigo-50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-indigo-200 shadow-2xs text-[11px] sm:text-xs">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 shrink-0" /> Zero Reliance on Third-Party Cookies
              </span>
            </div>
          </div>

          <div className="pt-6 sm:pt-8 border-t border-slate-200/80 mt-6 sm:mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs relative z-10">
            <span className="text-slate-500 font-medium">
              Live automated exports to CRM, Slack & Executive Dashboards
            </span>
            <Link
              href="/services/analytics-reporting"
              className="font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1.5 group-hover:translate-x-1 shrink-0"
            >
              <span>Explore Attribution Blueprint</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Card 2: Span 4 (High-Intent SEO) */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-8 lg:p-10 shadow-sm hover:shadow-xl hover:border-indigo-400 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="space-y-3 sm:space-y-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-600 group-hover:text-white transition-all duration-300 shrink-0">
              <SearchCode className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
              High-Intent Commercial SEO
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Rank #1 on Google for keywords where buyers are actively ready to
              purchase. Technical crawl speed, schema markup, and authoritative
              thought leadership that compounds monthly.
            </p>
          </div>

          <div className="pt-5 sm:pt-6 border-t border-slate-100 mt-5 sm:mt-6">
            <Link
              href="/services/seo"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 group-hover:translate-x-1"
            >
              <span>Explore Search Strategy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 3: Span 4 (Paid Media PPC) */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-8 lg:p-10 shadow-sm hover:shadow-xl hover:border-indigo-400 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="space-y-3 sm:space-y-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shrink-0">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
              Algorithmic Paid Advertising
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Continuous negative keyword matching, automated bid orchestration,
              and scroll-stopping ad creative variations saving 35-40% in wasted
              ad budget while maintaining a 4.5x+ ROAS.
            </p>
          </div>

          <div className="pt-5 sm:pt-6 border-t border-slate-100 mt-5 sm:mt-6">
            <Link
              href="/services/paid-ads"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 group-hover:translate-x-1"
            >
              <span>Explore Paid Ads Sprints</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 4: Span 4 (Scientific CRO) */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-8 lg:p-10 shadow-sm hover:shadow-xl hover:border-indigo-400 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="space-y-3 sm:space-y-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shrink-0">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
              Scientific Landing Page CRO
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Double your sales conversion rate without spending more on media.
              Multivariate split testing on offer hooks, psychological copy, and
              frictionless mobile lead capture funnels.
            </p>
          </div>

          <div className="pt-5 sm:pt-6 border-t border-slate-100 mt-5 sm:mt-6">
            <Link
              href="/services/cro"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 group-hover:translate-x-1"
            >
              <span>Explore CRO Experimentation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 5: Span 4 (Automated Lead Routing) */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-8 lg:p-10 shadow-sm hover:shadow-xl hover:border-indigo-400 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="space-y-3 sm:space-y-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shrink-0">
              <Cpu className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
              Instant WhatsApp & CRM Funnels
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Never let a high-intent lead cool down. Inbound inquiries receive
              automated WhatsApp qualification and personalized email sequences
              within 60 seconds of form submission.
            </p>
          </div>

          <div className="pt-5 sm:pt-6 border-t border-slate-100 mt-5 sm:mt-6">
            <Link
              href="/services/marketing-automation-crm"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 group-hover:translate-x-1"
            >
              <span>Explore Automated Lead Routing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
