import React from "react";
import type { CmsBlock } from "../../lib/cms";
import { Star, Quote, ShieldCheck, Sparkles } from "lucide-react";

interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  company: string;
  rating?: number;
  avatarUrl?: string;
}

export const TestimonialsBlock: React.FC<{ block: CmsBlock }> = ({ block }) => {
  const { content } = block;
  const sectionTitle =
    (content.sectionTitle as string) || "Validated by Enterprise Leaders";
  const sectionSubtitle =
    (content.sectionSubtitle as string) ||
    "Discover how global brands and fast-scaling enterprises achieve predictable revenue growth with Nexora.";

  const rawItems = (content.testimonials as TestimonialItem[]) || [
    {
      quote:
        "Nexora's attribution engine gave our executive team real-time clarity across multi-region campaigns. We increased pipeline velocity by 340% within two quarters.",
      author: "Aditi Rao",
      role: "VP of Global Marketing",
      company: "Apex Cloud Enterprise",
      rating: 5,
    },
    {
      quote:
        "The automated audience modeling and deterministic lead scoring transformed our conversion rates. The transparency and ROI tracking are unlike anything else in B2B.",
      author: "Marcus Vance",
      role: "Chief Commercial Officer",
      company: "Synapse Financial Networks",
      rating: 5,
    },
    {
      quote:
        "From DPDP and GDPR compliance to cross-border campaign governance, Nexora handled our multi-currency operations with zero friction. An indispensable platform.",
      author: "Vikram Malhotra",
      role: "Managing Director",
      company: "Zenith Retail Group",
      rating: 5,
    },
  ];

  return (
    <section className="relative py-24 bg-slate-950 text-white overflow-hidden border-t border-slate-900">
      {/* Background radial accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="relative max-w-6xl xl:max-w-7xl 2xl:max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Institutional Social Proof</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800">
              Sample Data
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            {sectionTitle}
          </h2>
          <p className="text-base sm:text-lg text-slate-400 font-medium leading-relaxed">
            {sectionSubtitle}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {rawItems.map((item, idx) => (
            <div
              key={idx}
              className="group relative rounded-3xl border border-slate-800/90 bg-slate-900/60 backdrop-blur-xl p-8 hover:border-indigo-500/50 hover:bg-slate-900/90 transition-all duration-300 flex flex-col justify-between shadow-xl shadow-slate-950/60"
            >
              <div>
                {/* 5-Star Rating Bar & Quote Icon */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: item.rating || 5 }).map(
                      (_, starIdx) => (
                        <Star
                          key={starIdx}
                          className="w-4 h-4 fill-amber-400 text-amber-400"
                        />
                      ),
                    )}
                  </div>
                  <Quote className="w-6 h-6 text-indigo-500/40 group-hover:text-indigo-400 transition-colors" />
                </div>

                {/* Quote Text */}
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal mb-8 italic">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              {/* Author Dossier */}
              <div className="border-t border-slate-800/80 pt-5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-sm">
                    {item.author}
                  </div>
                  <div className="text-xs text-indigo-400 font-medium">
                    {item.role}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {item.company}
                  </div>
                </div>

                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified Client</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
