"use client";

import React from "react";
import { Marquee } from "../ui/marquee";

const CLIENT_PARTNERS = [
  { name: "Google Cloud", tag: "Premier Partner" },
  { name: "Meta Business", tag: "Verified Agency" },
  { name: "HubSpot", tag: "Certified Diamond" },
  { name: "Shopify Plus", tag: "Enterprise Dev" },
  { name: "Cloudflare", tag: "Network Partner" },
  { name: "Stripe", tag: "Verified Partner" },
  { name: "Vercel", tag: "Deployment Engine" },
  { name: "Amazon Ads", tag: "Verified Partner" },
  { name: "Salesforce", tag: "AppExchange" },
  { name: "LinkedIn Ads", tag: "Marketing Partner" },
];

export const ClientLogoMarquee: React.FC = () => {
  return (
    <section className="py-8 sm:py-12 border-y border-border/60 bg-surface/40 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5 sm:mb-6 text-center">
        <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-slate-500">
          Integrated with Global Growth &amp; Technology Platforms
        </p>
      </div>

      <div className="relative w-full overflow-hidden">
        {/* Left and Right Fade Gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <Marquee speed="normal" pauseOnHover className="py-1">
          {CLIENT_PARTNERS.map((partner, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-xl sm:rounded-2xl bg-card border border-border/80 shadow-2xs hover:border-primary/40 hover:shadow-sm transition-all duration-300 shrink-0 group cursor-default"
            >
              <div className="w-2 h-2 rounded-full bg-primary/70 group-hover:scale-125 transition-transform" />
              <span className="text-xs sm:text-sm font-black text-slate-800 tracking-tight whitespace-nowrap">
                {partner.name}
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md whitespace-nowrap">
                {partner.tag}
              </span>
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
};
