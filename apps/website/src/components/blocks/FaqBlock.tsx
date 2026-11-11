import React from "react";
import type { CmsBlock } from "../../lib/cms";
import { HelpCircle, ChevronRight, MessageSquare } from "lucide-react";
import Link from "next/link";

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
  ];

  return (
    <section className="py-24 px-6 sm:px-10 lg:px-12 xl:px-16 max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 uppercase tracking-widest">
          <HelpCircle className="w-3.5 h-3.5" /> Direct Answers
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {title}
        </h2>
        <p className="text-base text-slate-600">
          Everything you need to know about our enterprise infrastructure and
          performance guarantees.
        </p>
      </div>

      <div className="space-y-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                Q{idx + 1}
              </span>
              <div className="space-y-2 flex-1">
                <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                  {item.question}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-left">
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Have a custom question about attribution or enterprise security?
            </h4>
            <p className="text-xs text-slate-500">
              Our engineering and growth team responds within 2 hours.
            </p>
          </div>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition shadow-sm"
        >
          <span>Ask Questions</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
};
