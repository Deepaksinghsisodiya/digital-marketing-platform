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
    <section className="py-24 px-6 sm:px-10 lg:px-12 xl:px-16 max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto">
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
        <Badge variant="accent">
          <HelpCircle className="w-3.5 h-3.5" /> Direct Answers
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {title}
        </h2>
        <p className="text-base text-slate-600">
          Everything you need to know about our enterprise infrastructure, SLA
          guarantees, and multi-region deployment.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <Accordion type="single" collapsible defaultValue="item-0">
          {items.map((item, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`}>
              <AccordionTrigger className="text-base sm:text-lg">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-slate-600">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="mt-12 text-center p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3 text-left">
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Have a custom question about attribution or enterprise security?
            </h4>
            <p className="text-xs text-slate-500">
              Our engineering and growth team responds within 2 business hours.
            </p>
          </div>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition shadow-xs"
        >
          <span>Ask Custom Question</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
};
