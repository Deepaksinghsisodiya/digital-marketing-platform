/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { CmsBlock } from "../../lib/cms";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";

export interface HeroSlide {
  id?: string;
  enabled?: boolean;
  tag?: string;
  eyebrow?: string;
  headline: string;
  subheadline: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  imageUrl?: string;
  imageAlt?: string;
  imageBadge?: string;
  overlayOpacity?: number;
}

export const HeroBlock: React.FC<{ block: CmsBlock }> = ({ block }) => {
  const { content, settings } = block;

  // Resolve slides purely from CMS APIs with zero fake/dummy fallbacks
  let rawSlides: HeroSlide[] = [];

  if (Array.isArray(content?.slides)) {
    rawSlides = (content.slides as HeroSlide[]).filter(
      (s) => s.enabled !== false && s.headline,
    );
  } else if (content?.headline) {
    rawSlides = [
      {
        id: "slide-1",
        tag: (content.tag as string) || (content.eyebrow as string) || "",
        headline: content.headline as string,
        subheadline: (content.subheadline as string) || "",
        primaryCtaText: (content.primaryCtaText as string) || "Get Started",
        primaryCtaLink: (content.primaryCtaLink as string) || "/contact",
        secondaryCtaText: (content.secondaryCtaText as string) || "",
        secondaryCtaLink: (content.secondaryCtaLink as string) || "",
        imageUrl: (content.imageUrl as string) || "",
        imageAlt: (content.imageAlt as string) || (content.headline as string),
        imageBadge: (content.imageBadge as string) || "",
      },
    ];
  }

  const isMultiSlide = rawSlides.length > 1;
  const autoplayEnabled = content?.autoplay !== false && isMultiSlide;
  const interval =
    typeof content?.interval === "number" ? content.interval : 5000;

  // Embla Carousel Integration
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: isMultiSlide,
      duration: 35,
    },
    autoplayEnabled
      ? [
          Autoplay({
            delay: interval,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
          }),
        ]
      : []
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

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

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  // If block is disabled or no slides exist, do not render
  if (block.enabled === false || rawSlides.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full overflow-hidden text-white bg-[#060913] select-none h-[calc(100vh-80px)] min-h-[720px] max-h-[960px] border-b border-slate-900/60">
      {/* Embla Carousel Viewport */}
      <div className="overflow-hidden w-full h-full" ref={emblaRef}>
        <div className="flex w-full h-full">
          {rawSlides.map((slide, idx) => {
            const tagText =
              slide.tag || slide.eyebrow || "Performance Marketing & Growth";
            const isInvalidBlob =
              typeof slide.imageUrl === "string" &&
              slide.imageUrl.startsWith("blob:");
            const imageUrl =
              !slide.imageUrl || isInvalidBlob
                ? "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=2600&q=85"
                : slide.imageUrl;

            const overlayOpacity =
              typeof slide.overlayOpacity === "number"
                ? slide.overlayOpacity
                : typeof content.overlayOpacity === "number"
                  ? (content.overlayOpacity as number)
                  : typeof settings?.overlayOpacity === "number"
                    ? (settings.overlayOpacity as number)
                    : 0.65;

            return (
              <div
                key={slide.id || idx}
                className="flex-[0_0_100%] min-w-0 relative h-full w-full flex items-center justify-center overflow-hidden"
              >
                {/* Background Banner Image with Active Theme Dark Gradient Overlay */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={imageUrl}
                    alt={slide.imageAlt || slide.headline}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=2600&q=85";
                    }}
                    className="w-full h-full object-cover object-center filter brightness-[0.62] contrast-[1.08] transition-all duration-700 select-none pointer-events-none"
                  />
                  {/* Dynamic Dark Gradient Overlay */}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[#060913] via-[#060913]/60 to-[#060913]/25 transition-opacity duration-300"
                    style={{ opacity: overlayOpacity }}
                  />
                  {/* Dynamic Ambient Accent Light using Active Admin Theme Color */}
                  <div className="absolute inset-0 bg-radial from-primary/20 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
                </div>

                {/* Foreground Content (Aligned to 85% Global Grid) */}
                <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center flex flex-col items-center justify-center space-y-6 sm:space-y-8">
                  {/* Category / Campaign Badge & Optional Image Badge */}
                  <div className="flex flex-wrap items-center justify-center gap-2.5">
                    {tagText && (
                      <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest bg-primary/15 text-primary border border-primary/35 backdrop-blur-md shadow-lg shadow-black/40">
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                        </span>
                        <span>{tagText}</span>
                      </div>
                    )}
                    {slide.imageBadge && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30 backdrop-blur-md">
                        <span>{slide.imageBadge}</span>
                      </div>
                    )}
                    {isMultiSlide && (
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold text-slate-300 bg-black/50 border border-white/15 backdrop-blur-md shadow-sm">
                        {`${String(idx + 1).padStart(2, "0")} / ${String(rawSlides.length).padStart(2, "0")}`}
                      </div>
                    )}
                  </div>

                  {/* Main Headline with Dynamic Ambient Glow from Active Admin Theme */}
                  <div className="relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[300px] bg-primary/20 blur-[140px] rounded-full pointer-events-none -z-10" />
                    <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-black tracking-tight leading-[1.08] text-white max-w-5xl mx-auto drop-shadow-lg">
                      {slide.headline}
                    </h1>
                  </div>

                  {/* Subheadline Description */}
                  {slide.subheadline && (
                    <p className="text-base sm:text-lg md:text-xl text-slate-200/90 max-w-3xl mx-auto leading-relaxed font-normal drop-shadow-md">
                      {slide.subheadline}
                    </p>
                  )}

                  {/* Action CTAs (Styled with Active Theme Token) */}
                  <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                    {slide.primaryCtaText && (
                      <Link
                        href={slide.primaryCtaLink || "/contact"}
                        className="group relative overflow-hidden inline-flex items-center gap-2.5 rounded-xl bg-primary hover:bg-primary-hover px-8 py-4 text-sm sm:text-base font-black text-primary-foreground shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
                      >
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 ease-out pointer-events-none" />
                        <span>{slide.primaryCtaText}</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    )}

                    {slide.secondaryCtaText && (
                      <Link
                        href={slide.secondaryCtaLink || "/services"}
                        className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 hover:border-white/40 backdrop-blur-md px-7 py-4 text-sm sm:text-base font-bold text-white shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
                      >
                        <span>{slide.secondaryCtaText}</span>
                      </Link>
                    )}
                  </div>

                  {/* Trust Proof Badges Strip */}
                  <div className="pt-3 sm:pt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-semibold text-slate-200">
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      <span>Deterministic Attribution</span>
                    </div>
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      <span>Sub-Second CWV</span>
                    </div>
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      <span>Enterprise SLA &amp; Security</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Navigation Arrows (Visible when > 1 slide) */}
      {isMultiSlide && (
        <>
          <button
            type="button"
            onClick={scrollPrev}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 hover:border-primary/60 backdrop-blur-md flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 shadow-2xl focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 hover:border-primary/60 backdrop-blur-md flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 shadow-2xl focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Bottom Bar: Slide Selector Pills Styled with Active Theme */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-full border border-white/15 shadow-2xl">
            {rawSlides.map((s, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollTo(idx)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/35 ring-1 ring-primary scale-105"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                >
                  <span className="font-mono text-[10px] opacity-80">{`0${idx + 1}`}</span>
                  <span className="hidden sm:inline font-medium text-[11px]">
                    {s.tag || `Slide ${idx + 1}`}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom Right: Subtle Scroll indicator styled with Active Theme */}
          <div className="hidden lg:flex absolute bottom-6 right-8 z-20 flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 select-none pointer-events-none">
            <span>Scroll</span>
            <ChevronDown className="w-4 h-4 text-primary animate-bounce" />
          </div>
        </>
      )}
    </section>
  );
};
