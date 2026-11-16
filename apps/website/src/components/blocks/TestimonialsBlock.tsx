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
    <section className="relative py-20 bg-slate-50 text-slate-900 overflow-hidden border-t border-slate-200">
      {/* Background radial accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Institutional Social Proof</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            {sectionTitle}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            {sectionSubtitle}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {rawItems
            .filter((item) => (item as { enabled?: boolean }).enabled !== false)
            .map((item, idx) => {
            const initials = item.author
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2);

            return (
              <div
                key={idx}
                className="group relative rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-9 hover:border-indigo-400 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between shadow-sm overflow-hidden"
              >
                {/* Subtle top ambient glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/30 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-200/40 transition-colors" />

                <div>
                  {/* 5-Star Rating Bar & Quote Icon */}
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 shadow-2xs">
                      {Array.from({ length: item.rating || 5 }).map(
                        (_, starIdx) => (
                          <Star
                            key={starIdx}
                            className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                          />
                        ),
                      )}
                      <span className="text-[11px] font-black text-amber-800 ml-1">
                        5.0
                      </span>
                    </div>
                    <Quote className="w-6 h-6 text-indigo-300 group-hover:text-indigo-600 transition-colors" />
                  </div>

                  {/* Quote Text */}
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal mb-8 italic relative z-10">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </div>

                {/* Author Dossier */}
                <div className="border-t border-slate-100 pt-5 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                      {initials}
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900 text-sm">
                        {item.author}
                      </div>
                      <div className="text-xs text-indigo-600 font-semibold">
                        {item.role}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {item.company}
                      </div>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
