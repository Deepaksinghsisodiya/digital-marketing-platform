"use client";

import React from "react";
import type { CmsBlock } from "../../lib/cms";
import { Marquee } from "../ui/marquee";
import { Badge } from "../ui/badge";
import { ShieldCheck, Award, Zap, Star } from "lucide-react";

export const LogoStripBlock: React.FC<{ block: CmsBlock }> = ({ block }) => {
  const { content } = block;
  const title =
    (content.title as string) || "Trusted by High-Velocity Growth Teams";
  const speed = ((content.speed as string) || "normal") as
    "slow" | "normal" | "fast";

  const defaultBrands = [
    { name: "APEX CLOUD", badge: "Enterprise" },
    { name: "ZENITH AI", badge: "SaaS" },
    { name: "VERTEX CORP", badge: "FinTech" },
    { name: "NOVA SCALE", badge: "E-Commerce" },
    { name: "HORIZON B2B", badge: "Healthcare" },
    { name: "DATAPULSE", badge: "Analytics" },
  ];

  return (
    <section className="py-14 bg-gradient-to-b from-white via-slate-50/50 to-white border-y border-slate-200/80 overflow-hidden select-none relative">
      {/* Edge gradient masks for smooth fade in/out */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      <div className="max-w-[1720px] 2xl:max-w-[1920px] mx-auto px-6 text-center space-y-6">
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs uppercase font-extrabold tracking-widest text-slate-500">
            {title}
          </span>
          <Badge variant="sample">Enterprise Ecosystem</Badge>
        </div>

        <Marquee speed={speed} pauseOnHover={true}>
          {defaultBrands.map((brand, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-7 py-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-400 hover:-translate-y-0.5 transition-all duration-300 shrink-0 group mx-2"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-sm tracking-wide text-slate-800 group-hover:text-indigo-600 transition-colors">
                {brand.name}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono font-semibold border border-slate-200">
                {brand.badge}
              </span>
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
};
