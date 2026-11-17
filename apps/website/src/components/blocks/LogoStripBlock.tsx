import React from "react";
import type { CmsBlock } from "../../lib/cms";
import { Badge } from "../ui/badge";
import { ShieldCheck } from "lucide-react";
import { Marquee } from "../motion/Marquee";

export const LogoStripBlock: React.FC<{ block: CmsBlock }> = ({ block }) => {
  const { content } = block;
  const title =
    (content.title as string) || "Trusted by High-Velocity Growth Teams";

  const defaultBrands = [
    { name: "APEX CLOUD", badge: "Enterprise" },
    { name: "ZENITH AI", badge: "SaaS" },
    { name: "VERTEX CORP", badge: "FinTech" },
    { name: "NOVA SCALE", badge: "E-Commerce" },
    { name: "HORIZON B2B", badge: "Healthcare" },
  ];

  const brands =
    Array.isArray(content.brands) && content.brands.length > 0
      ? (content.brands as Array<{ name: string; badge?: string }>)
      : defaultBrands;

  if (!brands || brands.length === 0) {
    return null;
  }

  return (
    <section className="py-6 sm:py-8 md:py-10 bg-gradient-to-b from-white via-slate-50/50 to-white border-y border-slate-200/80 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full overflow-hidden">
      <div className="text-center space-y-4 sm:space-y-6">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-widest text-slate-500">
            {title}
          </span>
          <Badge variant="sample" className="text-[9px] sm:text-xs">
            Enterprise Ecosystem
          </Badge>
        </div>

        {/* Seamless Infinite Marquee with hover-pause and reduced-motion fallback */}
        <Marquee speedSec={32} gap="1.25rem" className="py-2">
          {brands.map((brand, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-300 group shrink-0"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="flex flex-col min-w-0 text-left">
                <span className="font-extrabold text-[11px] sm:text-xs md:text-sm tracking-tight text-slate-800 group-hover:text-primary transition-colors whitespace-nowrap">
                  {brand.name}
                </span>
                {brand.badge && (
                  <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono font-medium whitespace-nowrap">
                    {brand.badge}
                  </span>
                )}
              </div>
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
};
