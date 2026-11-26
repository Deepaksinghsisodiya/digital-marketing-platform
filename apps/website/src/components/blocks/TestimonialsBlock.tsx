"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { CmsBlock } from "../../lib/cms";
import { Star, Quote, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useReducedMotion } from "../motion/useReducedMotion";

interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  company: string;
  rating?: number;
  avatarUrl?: string;
  enabled?: boolean;
}

export const TestimonialsBlock: React.FC<{ block: CmsBlock }> = ({ block }) => {
  const { content } = block;
  const sectionTitle =
    (content.sectionTitle as string) || "Validated by Enterprise Leaders";
  const sectionSubtitle =
    (content.sectionSubtitle as string) ||
    "Discover how global brands and fast-scaling enterprises achieve predictable revenue growth with Nexora.";

  const rawItems = Array.isArray(content?.testimonials)
    ? (content.testimonials as TestimonialItem[])
    : [];

  const items = rawItems.filter(
    (item) => item && item.enabled !== false && item.quote && item.author,
  );

  const isReduced = useReducedMotion();

  // Embla setup with autoplay (6s, paused on hover/focus/reduced-motion)
  const plugins = isReduced
    ? []
    : [
        Autoplay({
          delay: 6000,
          stopOnInteraction: false,
          stopOnMouseEnter: true,
        }),
      ];

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      skipSnaps: false,
    },
    plugins
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="relative py-10 sm:py-14 lg:py-18 bg-slate-50 text-slate-900 overflow-hidden border-t border-slate-200 w-full">
      {/* Background radial accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 w-full">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Institutional Social Proof</span>
            </div>
            <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              {sectionTitle}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 font-normal leading-relaxed">
              {sectionSubtitle}
            </p>
          </div>

          {/* Accessible Carousel Navigation Controls */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={scrollPrev}
              className="w-10 h-10 rounded-full border border-slate-300 bg-card hover:bg-slate-50 hover:border-primary/50 text-slate-700 flex items-center justify-center transition shadow-xs active:scale-95 cursor-pointer"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              className="w-10 h-10 rounded-full border border-slate-300 bg-card hover:bg-slate-50 hover:border-primary/50 text-slate-700 flex items-center justify-center transition shadow-xs active:scale-95 cursor-pointer"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Embla Carousel Viewport */}
        <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
          <div className="flex -ml-4 sm:-ml-6">
            {items.map((item, idx) => {
              const initials = item.author
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2);

              return (
                <div
                  key={idx}
                  className="pl-4 sm:pl-6 min-w-0 flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
                >
                  <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 hover:border-teal-500/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between shadow-xs select-none relative overflow-hidden group">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500/0 via-teal-500/70 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div>
                      {/* Rating Stars & Verified Tag */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: item.rating || 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 fill-amber-400 text-amber-400"
                            />
                          ))}
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                          Verified Client
                        </span>
                      </div>

                      <div className="relative">
                        <Quote className="w-5 h-5 text-teal-500/20 mb-2" />
                        <p className="text-sm text-slate-700 leading-relaxed font-normal mb-6">
                          &ldquo;{item.quote}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* Author Monogram & Identity */}
                    <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center font-bold text-xs shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900 truncate">
                          {item.author}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {item.role} &bull; {item.company}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Dots */}
        {scrollSnaps.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => scrollTo(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === selectedIndex
                    ? "w-8 bg-primary"
                    : "w-2 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
