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
    <section className="py-12 bg-white border-y border-slate-200 overflow-hidden select-none">
      <div className="max-w-[1720px] 2xl:max-w-[1920px] mx-auto px-6 text-center space-y-6">
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs uppercase font-bold tracking-widest text-slate-500">
            {title}
          </span>
          <Badge variant="sample">Sample Partners</Badge>
        </div>

        <Marquee speed={speed} pauseOnHover={true}>
          {defaultBrands.map((brand, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 px-8 py-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs hover:border-indigo-300 transition shrink-0"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-black text-sm tracking-wider text-slate-800">
                {brand.name}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-600 font-mono font-medium">
                {brand.badge}
              </span>
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
};
