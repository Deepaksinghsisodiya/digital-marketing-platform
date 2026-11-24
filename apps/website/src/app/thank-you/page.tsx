import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle2, ArrowRight, MessageSquare } from "lucide-react";
import { siteConfig, isRealValue } from "@/content/site.config";

export const metadata: Metadata = {
  title: "Thank You — Your Inquiry Has Been Received | Nexora",
  description:
    "Thank you for contacting Nexora. Our digital marketing team has received your details and will get in touch shortly.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThankYouPage() {
  const whatsapp = isRealValue(siteConfig.contact.whatsapp)
    ? siteConfig.contact.whatsapp.replace(/[^0-9]/g, "")
    : null;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-slate-900">
      <Header />

      <main className="flex-1 flex items-center justify-center py-16 sm:py-24 px-4">
        <div className="max-w-xl w-full text-center p-8 sm:p-12 rounded-3xl bg-slate-50 border border-slate-200 shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Inquiry Received!
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Thank you for reaching out to Nexora. One of our senior strategists
              is reviewing your website and requirements right now.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-600 text-left space-y-2">
            <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              What happens next?
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[11px] shrink-0">
                1
              </span>
              <span>We audit your domain and current market presence</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[11px] shrink-0">
                2
              </span>
              <span>We prepare initial growth observations and ideas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[11px] shrink-0">
                3
              </span>
              <span>We contact you via phone or email within 4 business hours</span>
            </div>
          </div>

          {whatsapp && (
            <div className="pt-2">
              <a
                href={`https://wa.me/${whatsapp}?text=Hi%20Nexora,%20I%20just%20submitted%20a%20form%20on%20your%20website.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm w-full justify-center"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Need Urgent Answer? Message on WhatsApp</span>
              </a>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200">
            <Link
              href="/"
              className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
            >
              <span>Back to Homepage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
