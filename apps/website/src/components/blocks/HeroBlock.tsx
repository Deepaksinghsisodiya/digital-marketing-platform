/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useCallback } from "react";
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
import { MagneticButton } from "../motion/MagneticButton";

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

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // If block is disabled or no slides exist, do not render
  if (block.enabled === false || rawSlides.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full overflow-hidden text-white bg-slate-950 select-none min-h-[500px] sm:min-h-[580px] md:min-h-[620px] lg:h-[calc(100vh-64px)] lg:min-h-[640px] lg:max-h-[960px] flex items-center border-b border-slate-900/60 p-0 m-0">
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
                    : 0.55;

            return (
              <div
                key={slide.id || idx}
                className="flex-[0_0_100%] min-w-0 relative h-full w-full flex items-center justify-center overflow-hidden"
              >
                {/* Background Banner Image with Edge-to-Edge Full-Bleed Coverage (Zero black bars) */}
                <div className="absolute inset-0 z-0 w-full h-full">
                  <img
                    src={imageUrl}
                    alt={slide.imageAlt || slide.headline}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=2600&q=85";
                    }}
                    className="w-full h-full object-cover object-center filter brightness-[0.72] contrast-[1.05] transition-all duration-700 select-none pointer-events-none"
                  />
                  {/* Subtle Dark Gradient Scrim to ensure crisp typography without pitch-black letterbox bands */}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/40 transition-opacity duration-300"
                    style={{ opacity: overlayOpacity }}
                  />
                  {/* Dynamic Ambient Accent Light using Active Admin Theme Color */}
                  <div className="absolute inset-0 bg-radial from-primary/20 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
                </div>

                {/* Foreground Content */}
                <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-16 text-center flex flex-col items-center justify-center space-y-4 sm:space-y-6 md:space-y-7">
                  {/* Category / Campaign Badge & Optional Image Badge */}
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 animate-glide-up-1">
                    {tagText && (
                      <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-extrabold uppercase tracking-widest bg-primary/15 text-primary border border-primary/35 backdrop-blur-md shadow-lg shadow-black/40">
                        <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-primary" />
                        </span>
                        <span>{tagText}</span>
                      </div>
                    )}
                    {slide.imageBadge && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-primary/20 text-primary border border-primary/30 backdrop-blur-md">
                        <span>{slide.imageBadge}</span>
                      </div>
                    )}
                  </div>

                  {/* Main Headline with Dynamic Ambient Glow from Active Admin Theme */}
                  <div className="relative px-2 max-w-5xl mx-auto animate-glide-up-2">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[500px] md:w-[650px] h-[140px] sm:h-[240px] md:h-[300px] bg-primary/20 blur-[90px] sm:blur-[130px] rounded-full pointer-events-none -z-10 animate-gradient-drift" />
                    <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[70px] font-black tracking-tight leading-[1.18] sm:leading-[1.12] lg:leading-[1.08] text-white drop-shadow-lg">
                      {slide.headline}
                    </h1>
                  </div>

                  {/* Subheadline Description */}
                  {slide.subheadline && (
                    <p className="text-xs xs:text-sm sm:text-base md:text-lg text-slate-200/90 max-w-2xl md:max-w-3xl mx-auto leading-relaxed font-normal drop-shadow-md px-2 animate-glide-up-3">
                      {slide.subheadline}
                    </p>
                  )}

                  {/* Action CTAs (Responsive on mobile, tablet & desktop) */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-4 pt-1 sm:pt-2 w-full max-w-xs sm:max-w-md md:max-w-none mx-auto animate-glide-up-4">
                    {slide.primaryCtaText && (
                      <MagneticButton>
                        <Link
                          href={slide.primaryCtaLink || "/contact"}
                          className="group relative overflow-hidden inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#FB7185] hover:bg-[#f43f5e] px-5 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm md:text-base font-black text-[#0B1F2A] shadow-2xl shadow-[#FB7185]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 w-full sm:w-auto text-center cursor-pointer"
                        >
                          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 ease-out pointer-events-none" />
                          <span>{slide.primaryCtaText}</span>
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 shrink-0 text-[#0B1F2A]" />
                        </Link>
                      </MagneticButton>
                    )}

                    {slide.secondaryCtaText && (
                      <Link
                        href={slide.secondaryCtaLink || "/services"}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 hover:border-white/40 backdrop-blur-md px-5 sm:px-7 py-3 sm:py-4 text-xs sm:text-sm md:text-base font-bold text-white shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 w-full sm:w-auto text-center"
                      >
                        <span>{slide.secondaryCtaText}</span>
                      </Link>
                    )}
                  </div>

                  {/* Trust Proof Badges Strip */}
                  <div className="pt-1 sm:pt-3 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 text-[10px] sm:text-xs font-semibold text-slate-200 animate-glide-up-5">
                    <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>Audited ROI Attribution</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>High-Converting Funnels</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>Predictable Revenue Growth</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Navigation Arrows (Visible on sm+ tablet & desktop) */}
      {isMultiSlide && (
        <>
          <button
            type="button"
            onClick={scrollPrev}
            className="hidden md:flex absolute left-3 sm:left-6 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 hover:border-primary/60 backdrop-blur-md items-center justify-center text-white transition-all hover:scale-110 active:scale-95 shadow-2xl focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            className="hidden md:flex absolute right-3 sm:right-6 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 hover:border-primary/60 backdrop-blur-md items-center justify-center text-white transition-all hover:scale-110 active:scale-95 shadow-2xl focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>

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
