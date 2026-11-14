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
  const items = (content.items as FaqItem[]) || [
    {
      question:
        "How quickly can Nexora deploy our custom marketing infrastructure?",
      answer:
        "Initial campaigns and tracking architecture typically go live within 7 to 14 business days, with real-time attribution and CRM synchronization enabled from day one.",
    },
    {
      question: "Does Nexora support global multi-country campaigns worldwide?",
      answer:
        "Yes. Nexora natively handles multi-region routing, localized currencies (USD, EUR, GBP, INR, AED, SGD), international phone formatting, and global regulatory compliance (DPDP, GDPR, CCPA).",
    },
    {
      question:
        "Can our marketing team edit website pages without developer support?",
      answer:
        "Yes, our modern Admin portal provides a visual block builder to update headlines, banners, features, and blog content with live preview and version rollback.",
    },
    {
      question: "How does deterministic server-side attribution work?",
      answer:
        "Unlike fragile browser cookies blocked by Safari and ad-blockers, our server-side engine logs conversion events directly from server to Meta CAPI, Google Ads, and your internal CRM with cryptographic SHA-256 validation.",
    },
  ];

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
    <section className="py-24 lg:py-32 px-6 sm:px-10 lg:px-12 xl:px-16 max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto relative overflow-hidden">
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider shadow-2xs">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
          <span>Knowledge & Clarifications</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          {title}
        </h2>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
          Everything you need to know about our enterprise marketing platform, deterministic tracking, and SLA guarantees.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-lg shadow-slate-100">
        <Accordion type="single" collapsible defaultValue="item-0" className="space-y-4">
          {items.map((item, idx) => (
            <AccordionItem
              key={idx}
              value={`item-${idx}`}
              className="border border-slate-200/80 rounded-2xl px-6 py-1 data-[state=open]:border-indigo-300 data-[state=open]:bg-indigo-50/20 transition-all duration-200"
            >
              <AccordionTrigger className="text-base sm:text-lg font-bold text-slate-900 hover:text-indigo-600 hover:no-underline py-5">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal pb-5 pt-1">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">
              Have a custom question about attribution or enterprise security?
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Our engineering and growth team responds within 2 business hours.
            </p>
          </div>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 rounded-2xl bg-white border border-slate-300 px-6 py-3.5 text-xs font-bold text-slate-800 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-300 transition-all shadow-xs shrink-0"
        >
          <span>Ask Custom Question</span>
          <ChevronRight className="w-4 h-4 text-indigo-600" />
        </Link>
      </div>
    </section>
  );
};
