"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Sparkles, X, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

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
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  announcementBarJson,
  defaultMessage,
}) => {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [intervalMs, setIntervalMs] = useState(4000);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
    // Check dismissal session status
    const isDismissed =
      typeof window !== "undefined" &&
      sessionStorage.getItem("nexora_announcement_dismissed") === "true";
    if (isDismissed) return;

    if (announcementBarJson) {
      try {
        const parsed: AnnouncementConfig = JSON.parse(announcementBarJson);

        // Global master toggle: if explicitly disabled, hide announcement bar completely
        if (parsed.enabled === false) {
          setItems([]);
          setDismissed(true);
          return;
        }

        // 1. Multi-item array format
        if (Array.isArray(parsed.items) && parsed.items.length > 0) {
          const activeItems = parsed.items.filter(
            (it) => it.enabled !== false && it.text && it.text.trim().length > 0,
          );
          if (activeItems.length > 0) {
            setItems(activeItems);
            setIntervalMs(
              typeof parsed.interval === "number" ? parsed.interval : 4000,
            );
            setAutoplayEnabled(parsed.autoplay !== false && activeItems.length > 1);
            setDismissed(false);
            return;
          }
        }

        // 2. Legacy single-item format fallback
        if (parsed.text && parsed.text.trim().length > 0) {
          setItems([
            {
              id: "ann-legacy-1",
              badge: parsed.badge || "ANNOUNCEMENT",
              text: parsed.text,
              linkText: "Explore →",
              linkUrl: parsed.link || "/services",
              enabled: true,
            },
          ]);
          setDismissed(false);
          return;
        }
      } catch {
        // Safe fallback
      }
    }

    // 3. Fallback default message if nothing configured
    if (defaultMessage) {
      setItems([
        {
          id: "ann-default-1",
          badge: "GROWTH ENGINE",
          text: defaultMessage,
          linkText: "Explore →",
          linkUrl: "/services",
          enabled: true,
        },
      ]);
      setDismissed(false);
    }
  }, [announcementBarJson, defaultMessage]);

  const isMultiSlide = items.length > 1;

  // Embla Carousel Integration (Identical to Hero Banner slider)
  const [emblaRef, emblaApi] = useEmblaCarousel(
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
      : []
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!mounted || dismissed || items.length === 0) return null;

  const handleDismiss = () => {
    setIsCollapsing(true);
    setTimeout(() => {
      setDismissed(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("nexora_announcement_dismissed", "true");
      }
    }, 250);
  };

  return (
    <div
      className={`relative z-50 w-full bg-[#060913] text-slate-200 text-[10px] sm:text-xs border-b border-white/10 shadow-sm transition-all duration-300 select-none overflow-hidden ${
        isCollapsing
          ? "opacity-0 -translate-y-full max-h-0 py-0"
          : "opacity-100 translate-y-0 max-h-16 py-0.5 sm:py-1.5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Left Carousel Arrow Controls on multi items (Tablet / Desktop) */}
        <div className="hidden md:flex items-center gap-0.5 w-14 shrink-0">
          {isMultiSlide && (
            <>
              <button
                type="button"
                onClick={scrollPrev}
                aria-label="Previous announcement"
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Previous announcement"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={scrollNext}
                aria-label="Next announcement"
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Next announcement"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Embla Carousel Viewport for Smooth Physical Sliding Animation */}
        <div className="overflow-hidden flex-1 min-w-0" ref={emblaRef}>
          <div className="flex w-full">
            {items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="flex-[0_0_100%] min-w-0 flex items-center justify-center gap-1.5 sm:gap-2.5 text-center px-1 sm:px-2"
              >
                {item.badge && (
                  <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full bg-primary/20 text-primary font-extrabold border border-primary/30 text-[9px] sm:text-[10px] uppercase tracking-wider shadow-xs shrink-0">
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary animate-pulse" />
                    <span>{item.badge}</span>
                  </span>
                )}

                <span className="text-slate-200 font-medium text-[11px] sm:text-xs truncate min-w-0 max-w-[210px] xs:max-w-[300px] sm:max-w-xl md:max-w-2xl">
                  {item.text}
                </span>

                {item.linkUrl && (
                  <Link
                    href={item.linkUrl}
                    className="inline-flex items-center gap-0.5 sm:gap-1 font-bold text-primary hover:text-primary-hover transition underline underline-offset-4 shrink-0 text-[11px] sm:text-xs group"
                  >
                    <span>{item.linkText || "Explore"}</span>
                    <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                )}

                {isMultiSlide && (
                  <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 ml-0.5 sm:ml-1 shrink-0">
                    ({selectedIndex + 1}/{items.length})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
          className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition shrink-0 cursor-pointer"
          title="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
