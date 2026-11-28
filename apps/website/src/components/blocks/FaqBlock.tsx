import React from "react";
import type { CmsBlock } from "../../lib/cms";
import { HelpCircle, ChevronRight, MessageSquare } from "lucide-react";
import Link from "next/link";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../ui/accordion";
import { Badge } from "../ui/badge";

interface FaqItem {
  question: string;
  answer: string;
}

export const FaqBlock: React.FC<{ block: CmsBlock }> = ({ block }) => {
  const { content } = block;
  const title = (content.title as string) || "Frequently Asked Questions";
  const rawItems = Array.isArray(content?.items)
    ? (content.items as Array<FaqItem & { enabled?: boolean }>)
    : [];

  const items = rawItems.filter((i) => i && i.enabled !== false && i.question);

  if (items.length === 0) {
    return null;
  }

  // FAQPage JSON-LD Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section className="py-10 sm:py-14 lg:py-18 bg-background text-slate-900 border-t border-slate-200/80 w-full relative overflow-hidden">
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Unified max-w-7xl container with exact navbar padding (px-4 sm:px-6 lg:px-8) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2.5 sm:space-y-4 mb-8 sm:mb-12 lg:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-2xs">
            <HelpCircle className="w-3.5 h-3.5 text-primary" />
            <span>Knowledge &amp; FAQ</span>
          </div>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
            Everything you need to know about our growth methodology, revenue tracking, and campaign launch timelines.
          </p>
        </div>

        {/* Clean Responsive Accordion Container */}
        <div className="max-w-3xl lg:max-w-4xl mx-auto">
          <Accordion type="single" collapsible defaultValue="item-0" className="space-y-3 sm:space-y-3.5">
            {items.map((item, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
                className="border border-slate-200/90 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-0.5 sm:py-1 data-[state=open]:border-primary/40 data-[state=open]:bg-primary/5 data-[state=open]:shadow-2xs transition-all duration-200 bg-card"
              >
                <AccordionTrigger className="text-sm sm:text-base md:text-lg font-bold text-slate-900 hover:text-primary hover:no-underline py-3.5 sm:py-4.5 text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed font-normal pb-4 sm:pb-5 pt-1">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Support Question Callout Card */}
        <div className="mt-8 sm:mt-12 max-w-3xl lg:max-w-4xl mx-auto p-4 sm:p-6 lg:p-7 rounded-2xl sm:rounded-3xl bg-slate-50/80 border border-slate-200/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-6 shadow-2xs">
          <div className="flex items-center gap-3 sm:gap-4 text-left">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-md shadow-primary/25">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                Have a custom question about attribution or enterprise security?
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
                Our engineering and growth team responds within 2 business hours.
              </p>
            </div>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-card border border-slate-300 hover:border-primary/50 px-5 py-2.5 sm:py-3 text-xs font-bold text-slate-800 hover:text-primary transition-all shadow-2xs shrink-0 w-full sm:w-auto text-center"
          >
            <span>Ask Custom Question</span>
            <ChevronRight className="w-4 h-4 text-primary" />
          </Link>
        </div>
      </div>
    </section>
  );
};
