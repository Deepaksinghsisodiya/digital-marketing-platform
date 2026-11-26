"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Sparkles, ArrowRight } from "lucide-react";

export interface AnnouncementItem {
  id: string;
  badge?: string;
  text: string;
  linkText?: string;
  linkUrl?: string;
  enabled?: boolean;
}

export interface AnnouncementConfig {
  enabled?: boolean;
  autoplay?: boolean;
  interval?: number;
  items?: AnnouncementItem[];
  // Legacy single item fields
  text?: string;
  link?: string;
  badge?: string;
}

interface AnnouncementBarProps {
  announcementBarJson?: string | null;
  defaultMessage?: string | null;
  isScrolled?: boolean;
}

function parseAnnouncementConfig(
  announcementBarJson?: string | null,
  defaultMessage?: string | null,
): {
  items: AnnouncementItem[];
  intervalMs: number;
  autoplayEnabled: boolean;
  explicitlyDisabled: boolean;
} {
  if (announcementBarJson) {
    try {
      const parsed: AnnouncementConfig = JSON.parse(announcementBarJson);

      if (parsed.enabled === false) {
        return { items: [], intervalMs: 4000, autoplayEnabled: false, explicitlyDisabled: true };
      }

      if (Array.isArray(parsed.items) && parsed.items.length > 0) {
        const activeItems = parsed.items.filter(
          (it) => it.enabled !== false && it.text && it.text.trim().length > 0,
        );
        if (activeItems.length > 0) {
          const intervalMs = typeof parsed.interval === "number" && parsed.interval >= 1500 ? parsed.interval : 4000;
          return {
            items: activeItems,
            intervalMs,
            autoplayEnabled: parsed.autoplay !== false && activeItems.length > 1,
            explicitlyDisabled: false,
          };
        }
        return { items: [], intervalMs: 4000, autoplayEnabled: false, explicitlyDisabled: true };
      }

      if (parsed.text && parsed.text.trim().length > 0) {
        return {
          items: [
            {
              id: "ann-legacy-1",
              badge: parsed.badge || "ANNOUNCEMENT",
              text: parsed.text,
              linkText: "Explore",
              linkUrl: parsed.link || "/services",
              enabled: true,
            },
          ],
          intervalMs: 4000,
          autoplayEnabled: false,
          explicitlyDisabled: false,
        };
      }
    } catch {
      // Safe fallback below
    }
  }

  if (defaultMessage) {
    return {
      items: [
        {
          id: "ann-default-1",
          badge: "GROWTH ENGINE",
          text: defaultMessage,
          linkText: "Explore",
          linkUrl: "/services",
          enabled: true,
        },
      ],
      intervalMs: 4000,
      autoplayEnabled: false,
      explicitlyDisabled: false,
    };
  }

  return { items: [], intervalMs: 4000, autoplayEnabled: false, explicitlyDisabled: false };
}

const AnnouncementCarousel: React.FC<{
  items: AnnouncementItem[];
  intervalMs: number;
  autoplayEnabled: boolean;
}> = ({ items, intervalMs, autoplayEnabled }) => {
  const isMultiSlide = items.length > 1;

  // Exact same Embla Carousel + Autoplay loop configuration as HeroBlock (continuous right-to-left)
  const [emblaRef] = useEmblaCarousel(
    {
      loop: isMultiSlide,
      duration: 35,
    },
    autoplayEnabled && isMultiSlide
      ? [
          Autoplay({
            delay: intervalMs,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
          }),
        ]
      : [],
  );

  return (
    <div className="overflow-hidden w-full" ref={emblaRef}>
      <div className="flex w-full">
        {items.map((item, idx) => (
          <div
            key={item.id || idx}
            className="flex-[0_0_100%] min-w-0 flex items-center justify-center gap-2 sm:gap-2.5 text-center px-2"
          >
            {item.badge && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-extrabold border border-teal-200 text-[10px] uppercase tracking-wider shrink-0">
                <Sparkles className="w-3 h-3 text-teal-600" />
                <span>{item.badge}</span>
              </span>
            )}

            <span className="text-slate-800 font-semibold text-[11px] sm:text-xs truncate min-w-0 max-w-[240px] xs:max-w-[340px] sm:max-w-xl md:max-w-2xl">
              {item.text}
            </span>

            {item.linkUrl && (
              <Link
                href={item.linkUrl}
                className="inline-flex items-center gap-1 font-bold text-teal-700 hover:text-teal-900 transition underline underline-offset-4 shrink-0 text-[11px] sm:text-xs group"
              >
                <span>{item.linkText || "Explore"}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  announcementBarJson,
  defaultMessage,
  isScrolled = false,
}) => {
  const { items, intervalMs, autoplayEnabled, explicitlyDisabled } = useMemo(
    () => parseAnnouncementConfig(announcementBarJson, defaultMessage),
    [announcementBarJson, defaultMessage],
  );

  if (explicitlyDisabled || items.length === 0) return null;

  const carouselKey = `${items.map((i) => i.id).join("-")}-${autoplayEnabled}-${intervalMs}`;

  return (
    <div
      aria-hidden={isScrolled}
      className={`relative z-50 w-full bg-slate-50 text-slate-800 text-[11px] sm:text-xs transition-all duration-300 ease-out select-none overflow-hidden ${
        isScrolled
          ? "max-h-0 opacity-0 py-0 border-b-0 pointer-events-none"
          : "max-h-14 opacity-100 py-1.5 sm:py-2 border-b border-slate-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <AnnouncementCarousel
          key={carouselKey}
          items={items}
          intervalMs={intervalMs}
          autoplayEnabled={autoplayEnabled}
        />
      </div>
    </div>
  );
};
