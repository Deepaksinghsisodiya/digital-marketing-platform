/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { CmsBlock } from "../../lib/cms";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Star,
  Globe,
} from "lucide-react";
import { MagneticButton } from "../motion/MagneticButton";
import { HeroResultsVisual, type HeroMetricConfig } from "../home/HeroResultsVisual";

export interface HeroSlide extends HeroMetricConfig {
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
  showQuickAudit?: boolean;
  ratingText?: string;
  socialProofText?: string;
  trustBadges?: string[];
}

export const HeroBlock: React.FC<{ block: CmsBlock }> = ({ block }) => {
  const { content } = block;

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
        primaryCtaText: (content.primaryCtaText as string) || "",
        primaryCtaLink: (content.primaryCtaLink as string) || "/contact",
        secondaryCtaText: (content.secondaryCtaText as string) || "",
        secondaryCtaLink: (content.secondaryCtaLink as string) || "",
        imageUrl: (content.imageUrl as string) || "",
        imageAlt: (content.imageAlt as string) || (content.headline as string),
        imageBadge: (content.imageBadge as string) || "",
        showQuickAudit: content.showQuickAudit as boolean | undefined,
        ratingText: (content.ratingText as string) || "",
        socialProofText: (content.socialProofText as string) || "",
        trustBadges: Array.isArray(content.trustBadges)
          ? (content.trustBadges as string[])
          : undefined,
        metricTitle: (content.metricTitle as string) || "",
        metricBadge: (content.metricBadge as string) || "",
        metricLabel: (content.metricLabel as string) || "",
        metricValue: (content.metricValue as string) || "",
        metricDelta: (content.metricDelta as string) || "",
        metricSubtitle: (content.metricSubtitle as string) || "",
        metricFooterNote: (content.metricFooterNote as string) || "",
        stat1Label: (content.stat1Label as string) || "",
        stat1Value: (content.stat1Value as string) || "",
        stat1Sub: (content.stat1Sub as string) || "",
        stat2Label: (content.stat2Label as string) || "",
        stat2Value: (content.stat2Value as string) || "",
        stat2Sub: (content.stat2Sub as string) || "",
      },
    ];
  }

  const isMultiSlide = rawSlides.length > 1;
  const autoplayEnabled = content?.autoplay !== false && isMultiSlide;
  const interval =
    typeof content?.interval === "number" ? content.interval : 5000;

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
      : [],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [auditDomain, setAuditDomain] = useState("");

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

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
    [emblaApi],
  );

  if (block.enabled === false || rawSlides.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full overflow-hidden text-slate-900 bg-gradient-to-b from-white via-slate-50/75 to-white select-none border-b border-slate-200/80 min-h-[580px] sm:min-h-[660px] lg:min-h-[calc(100vh-100px)] lg:max-h-[900px] flex flex-col justify-between">
      {/* Clean Architectural Dot-Grid & Floating Ambient Glows */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(rgba(15,23,42,0.065)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_40%,#000_55%,transparent_100%)] pointer-events-none"
      />
      <motion.div
        aria-hidden="true"
        animate={{ x: [0, 24, 0], y: [0, -16, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-28 left-1/4 w-[520px] h-[340px] bg-teal-500/12 blur-[130px] rounded-full pointer-events-none"
      />
      <motion.div
        aria-hidden="true"
        animate={{ x: [0, -20, 0], y: [0, 18, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute -bottom-24 right-1/4 w-[440px] h-[300px] bg-rose-400/12 blur-[130px] rounded-full pointer-events-none"
      />

      {/* Embla Carousel Viewport */}
      <div className="relative z-10 overflow-hidden w-full flex-1 flex items-center" ref={emblaRef}>
        <div className="flex w-full items-stretch">
          {rawSlides.map((slide, idx) => {
            const tagText = slide.tag || slide.eyebrow || "";
            const isInvalidBlob =
              typeof slide.imageUrl === "string" &&
              slide.imageUrl.startsWith("blob:");
            const imageUrl =
              !slide.imageUrl || isInvalidBlob ? "" : slide.imageUrl;
            const isActiveSlide = selectedIndex === idx;
            const trustBadges = Array.isArray(slide.trustBadges)
              ? slide.trustBadges.filter(Boolean)
              : [];
            const hasSocialRow = Boolean(
              slide.ratingText || slide.socialProofText || trustBadges.length > 0,
            );

            return (
              <div
                key={slide.id || idx}
                className="flex-[0_0_100%] min-w-0 w-full flex items-center"
              >
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center">
                    {/* Left Column: Staggered Animated Headline, Copy, Actions & Quick Audit */}
                    <motion.div
                      key={`copy-${idx}-${isActiveSlide ? "active" : "idle"}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                      className="lg:col-span-7 flex flex-col items-center text-center lg:items-start lg:text-left space-y-5 sm:space-y-6"
                    >
                      {/* Category / Campaign Badge & Optional Image Badge */}
                      {(tagText || slide.imageBadge) && (
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-2.5">
                          {tagText && (
                            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-extrabold uppercase tracking-widest bg-teal-50 text-teal-700 border border-teal-200/90 shadow-2xs">
                              <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600" />
                              </span>
                              <span>{tagText}</span>
                            </div>
                          )}
                          {slide.imageBadge && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
                              <span>{slide.imageBadge}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Main Headline */}
                      <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.06 }}
                        className="text-[30px] sm:text-4xl md:text-[46px] lg:text-[52px] xl:text-[60px] font-black tracking-[-0.025em] leading-[1.08] sm:leading-[1.06] bg-gradient-to-br from-slate-950 via-slate-900 to-teal-900 bg-clip-text text-transparent max-w-2xl"
                      >
                        {slide.headline}
                      </motion.h1>

                      {/* Subheadline Description */}
                      {slide.subheadline && (
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.45, delay: 0.12 }}
                          className="text-sm sm:text-base md:text-[17px] text-slate-600 max-w-xl leading-relaxed font-normal"
                        >
                          {slide.subheadline}
                        </motion.p>
                      )}

                      {/* Action CTAs */}
                      {(slide.primaryCtaText || slide.secondaryCtaText) && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.45, delay: 0.18 }}
                          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-1 w-full sm:w-auto"
                        >
                          {slide.primaryCtaText && (
                            <MagneticButton>
                              <Link
                                href={slide.primaryCtaLink || "/contact"}
                                className="group relative overflow-hidden inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 px-6 sm:px-7 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-teal-600/25 hover:shadow-xl hover:shadow-teal-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 w-full sm:w-auto text-center cursor-pointer"
                              >
                                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 ease-out pointer-events-none" />
                                <span>{slide.primaryCtaText}</span>
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 shrink-0" />
                              </Link>
                            </MagneticButton>
                          )}

                          {slide.secondaryCtaText && (
                            <Link
                              href={slide.secondaryCtaLink || "/services"}
                              className="inline-flex items-center justify-center gap-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-teal-200 px-6 sm:px-7 py-3.5 text-xs sm:text-sm font-bold text-slate-800 hover:text-teal-700 shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 w-full sm:w-auto text-center"
                            >
                              <span>{slide.secondaryCtaText}</span>
                            </Link>
                          )}
                        </motion.div>
                      )}

                      {/* Optional Admin-Controlled Inline Quick Audit Bar */}
                      {slide.showQuickAudit === true && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.45, delay: 0.22 }}
                          className="w-full max-w-md pt-1"
                        >
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-1.5 p-2 sm:p-1.5 rounded-2xl sm:rounded-full bg-white border border-slate-200/90 shadow-xs focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-500/15 transition-all">
                            <div className="flex items-center gap-2 flex-1 px-2 sm:pl-3">
                              <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                              <input
                                type="text"
                                value={auditDomain}
                                onChange={(e) => setAuditDomain(e.target.value)}
                                placeholder="Enter website URL (e.g. yoursite.com)"
                                aria-label="Website URL for free audit"
                                className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden py-1.5 sm:py-1"
                              />
                            </div>
                            <Link
                              href={
                                auditDomain.trim()
                                  ? `/free-audit?url=${encodeURIComponent(auditDomain.trim())}`
                                  : "/free-audit"
                              }
                              className="inline-flex items-center justify-center gap-1 rounded-xl sm:rounded-full bg-slate-900 hover:bg-teal-700 text-white px-4 py-2.5 sm:py-2 text-[11px] font-bold whitespace-nowrap shrink-0 transition-colors"
                            >
                              <span>Free Audit</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </motion.div>
                      )}

                      {/* Social Proof & Trust Row (100% Admin/DB Driven) */}
                      {hasSocialRow && (
                        <div className="pt-1 space-y-2 w-full">
                          {(slide.ratingText || slide.socialProofText) && (
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-xs text-slate-600">
                              {slide.ratingText && (
                                <div className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                                  <div className="flex items-center text-amber-500">
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                  </div>
                                  <span>{slide.ratingText}</span>
                                </div>
                              )}
                              {slide.ratingText && slide.socialProofText && (
                                <span className="text-slate-300 hidden sm:inline">|</span>
                              )}
                              {slide.socialProofText && (
                                <span className="text-slate-600 font-medium">
                                  {slide.socialProofText}
                                </span>
                              )}
                            </div>
                          )}

                          {trustBadges.length > 0 && (
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-[11px] font-semibold text-slate-700 pt-0.5">
                              {trustBadges.map((badge, bIdx) => (
                                <span
                                  key={bIdx}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-slate-200/80 shadow-2xs"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                                  {badge}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>

                    {/* Right Column: Animated Admin-Driven Bento Visual Showcase */}
                    <div className="lg:col-span-5 w-full flex justify-center lg:justify-end">
                      <HeroResultsVisual
                        imageUrl={imageUrl}
                        imageAlt={slide.imageAlt}
                        slideIndex={idx}
                        metricTitle={slide.metricTitle}
                        metricBadge={slide.metricBadge}
                        metricLabel={slide.metricLabel}
                        metricValue={slide.metricValue}
                        metricDelta={slide.metricDelta}
                        metricSubtitle={slide.metricSubtitle}
                        metricFooterNote={slide.metricFooterNote}
                        stat1Label={slide.stat1Label}
                        stat1Value={slide.stat1Value}
                        stat1Sub={slide.stat1Sub}
                        stat2Label={slide.stat2Label}
                        stat2Value={slide.stat2Value}
                        stat2Sub={slide.stat2Sub}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Titled Slide Switcher Bar + Animated Active Progress */}
      {isMultiSlide && (
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200/70">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              {rawSlides.map((s, i) => {
                const isActive = selectedIndex === i;
                const shortLabel =
                  s.tag || s.eyebrow || s.headline || `Slide ${i + 1}`;
                return (
                  <button
                    key={s.id || i}
                    type="button"
                    onClick={() => scrollTo(i)}
                    className={`relative overflow-hidden inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer border ${
                      isActive
                        ? "bg-white text-teal-700 border-teal-300 shadow-xs font-bold"
                        : "bg-slate-100/80 text-slate-600 border-transparent hover:bg-white hover:text-slate-900"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? "bg-teal-600 text-white"
                          : "bg-slate-200/80 text-slate-600"
                      }`}
                    >
                      0{i + 1}
                    </span>
                    <span className="max-w-[180px] truncate">{shortLabel}</span>
                    {isActive && autoplayEnabled && (
                      <motion.span
                        key={`prog-${selectedIndex}`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: interval / 1000, ease: "linear" }}
                        style={{ originX: 0 }}
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-500 to-emerald-500"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="hidden sm:flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={scrollPrev}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-50 border border-slate-200 hover:border-teal-300 flex items-center justify-center text-slate-600 hover:text-teal-700 transition-colors shadow-2xs cursor-pointer"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={scrollNext}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-50 border border-slate-200 hover:border-teal-300 flex items-center justify-center text-slate-600 hover:text-teal-700 transition-colors shadow-2xs cursor-pointer"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
