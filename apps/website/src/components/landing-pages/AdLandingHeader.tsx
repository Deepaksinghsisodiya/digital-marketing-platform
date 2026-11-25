import React from "react";
import Link from "next/link";
import { siteConfig, isRealValue } from "@/content/site.config";
import { Phone, MessageSquare, ShieldCheck, Clock } from "lucide-react";

interface AdLandingHeaderProps {
  campaignBadge?: string;
  phoneLabel?: string;
}

export function AdLandingHeader({
  campaignBadge = "Official Partner Agency",
  phoneLabel,
}: AdLandingHeaderProps) {
  const phone = isRealValue(siteConfig.contact.phone)
    ? siteConfig.contact.phone
    : null;
  const whatsapp = isRealValue(siteConfig.contact.whatsapp)
    ? siteConfig.contact.whatsapp.replace(/[^0-9]/g, "")
    : null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      {/* Top micro-bar for confidence */}
      <div className="bg-slate-900 text-white text-[11px] py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium text-slate-200">
              {campaignBadge} &bull; No Long-Term Lock-in &bull; 100% Account Ownership
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Response guarantee: within 4 business hours</span>
          </div>
        </div>
      </div>

      {/* Main landing navbar: strictly NO distraction links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand logo: returns to anchor #top instead of leaving the funnel */}
        <a
          href="#top"
          className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg"
          aria-label="Nexora Performance Marketing"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-primary via-accent to-primary flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <span className="text-white font-black text-lg sm:text-xl tracking-tighter">N</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none">
              NEXORA
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase mt-0.5">
              Performance Marketing
            </span>
          </div>
        </a>

        {/* Right side direct conversion channels: Phone & WhatsApp */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}?text=Hi%20Nexora,%20I%20am%20interested%20in%20your%20PPC%20ad%20management.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs sm:text-sm font-bold transition shadow-xs"
              aria-label="Chat on WhatsApp"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline">WhatsApp Us</span>
              <span className="md:hidden">WhatsApp</span>
            </a>
          )}

          {phone ? (
            <a
              href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition shadow-md shadow-slate-900/10"
              aria-label={`Call us at ${phone}`}
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Call: {phone}</span>
              <span className="sm:hidden">Call Now</span>
            </a>
          ) : (
            <a
              href="#audit-form"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition shadow-md shadow-emerald-600/20"
            >
              <span>Get Free Audit</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
