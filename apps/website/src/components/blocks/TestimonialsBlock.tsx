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

  const rawItems = (content.testimonials as TestimonialItem[]) || [
    {
      quote:
        "Nexora's attribution engine gave our executive team real-time clarity across multi-region campaigns. We increased pipeline velocity by 340% within two quarters.",
      author: "Aditi Rao",
      role: "VP of Global Marketing",
      company: "Apex Cloud Enterprise",
      rating: 5,
    },
    {
      quote:
        "The automated audience modeling and deterministic lead scoring transformed our conversion rates. The transparency and ROI tracking are unlike anything else in B2B.",
      author: "Marcus Vance",
      role: "Chief Commercial Officer",
      company: "Synapse Financial Networks",
      rating: 5,
    },
    {
      quote:
        "From DPDP and GDPR compliance to cross-border campaign governance, Nexora handled our multi-currency operations with zero friction. An indispensable platform.",
      author: "Vikram Malhotra",
      role: "Managing Director",
      company: "Zenith Retail Group",
      rating: 5,
    },
  ];

  const items = rawItems.filter((item) => item.enabled !== false);
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
              className="w-10 h-10 rounded-full border border-slate-300 bg-white hover:bg-slate-50 hover:border-primary/50 text-slate-700 flex items-center justify-center transition shadow-xs active:scale-95 cursor-pointer"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              className="w-10 h-10 rounded-full border border-slate-300 bg-white hover:bg-slate-50 hover:border-primary/50 text-slate-700 flex items-center justify-center transition shadow-xs active:scale-95 cursor-pointer"
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
                  <div className="h-full rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 md:p-8 hover:border-primary/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between shadow-xs select-none">
                    <div>
                      {/* Rating Stars & Quote Icon */}
                      <div className="flex items-center justify-between mb-4 sm:mb-5">
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: item.rating || 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 fill-amber-400 text-amber-400"
                            />
                          ))}
                        </div>
                        <Quote className="w-6 h-6 text-slate-200" />
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal italic mb-6">
                        &ldquo;{item.quote}&rdquo;
                      </p>
                    </div>

                    {/* Author Monogram & Identity */}
                    <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {item.author}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {item.role} • {item.company}
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
