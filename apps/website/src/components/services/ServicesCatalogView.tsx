"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Layers,
  Tag,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { Reveal } from "../motion/Reveal";
import { Stagger, StaggerItem } from "../motion/Stagger";

export interface ServiceCardData {
  id?: string;
  title: string;
  slug?: string;
  link?: string;
  pillar: string;
  desc: string;
  highlights?: string[];
  badge?: string;
  startingPrice?: string;
}

export interface PillarData {
  name: string;
  badge: string;
  desc: string;
  services: ServiceCardData[];
}

interface ServicesCatalogViewProps {
  pillars: PillarData[];
  title?: string;
  subtitle?: string;
}

export const ServicesCatalogView: React.FC<ServicesCatalogViewProps> = ({
  pillars,
  title = "Full-Funnel Digital Marketing, High-Converting Websites & Lead Automation",
  subtitle = "Everything ambitious businesses need to attract high-intent buyers, generate qualified inquiries, and scale revenue predictably. Explore our services below.",
}) => {
  const [selectedPillar, setSelectedPillar] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Extract all services for flat search or pillar grouping
  const allServices = useMemo(() => {
    const list: ServiceCardData[] = [];
    pillars.forEach((p) => {
      p.services.forEach((s) => {
        list.push({ ...s, pillar: s.pillar || p.name });
      });
    });
    return list;
  }, [pillars]);

  // Filtered services
  const filteredServices = useMemo(() => {
    return allServices.filter((s) => {
      const matchesPillar =
        selectedPillar === "all" ||
        s.pillar.toLowerCase() === selectedPillar.toLowerCase();

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        s.title.toLowerCase().includes(query) ||
        s.desc.toLowerCase().includes(query) ||
        (s.highlights && s.highlights.some((h) => h.toLowerCase().includes(query)));

      return matchesPillar && matchesSearch;
    });
  }, [allServices, selectedPillar, searchQuery]);

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Header Hero */}
      <Reveal variant="fade-up" distance="lg" duration="slower" as="div" className="max-w-4xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Integrated Digital Growth Capabilities</span>
        </div>
        <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-tight">
          {title}
        </h1>
        <p className="text-xs sm:text-base md:text-lg text-muted leading-relaxed font-normal">
          {subtitle}
        </p>
      </Reveal>

      {/* Interactive Controls: Search & Pillar Tabs */}
      <div className="bg-card border border-border rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Pillar Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setSelectedPillar("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                selectedPillar === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-card text-muted hover:text-foreground border border-border"
              }`}
            >
              All Capabilities ({allServices.length})
            </button>
            {pillars.map((p) => {
              const isSelected = selectedPillar.toLowerCase() === p.name.toLowerCase();
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setSelectedPillar(p.name)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-card text-muted hover:text-foreground border border-border"
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search capabilities or keywords..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-card border border-border text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
          </div>
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="py-16 text-center bg-card border border-border rounded-3xl p-8 space-y-3">
          <Layers className="w-10 h-10 text-muted mx-auto" />
          <h3 className="text-base font-bold text-foreground">No Services Found</h3>
          <p className="text-xs text-muted max-w-md mx-auto">
            We couldn&apos;t find any services matching &ldquo;{searchQuery}&rdquo;. Need a bespoke engineering or marketing scope?
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline pt-2"
          >
            <span>Talk to our Growth Directors</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {filteredServices.map((srv, idx) => {
            const linkHref = srv.link || (srv.slug ? `/services/${srv.slug}` : "/contact");

            return (
              <Card
                key={srv.id || srv.title || idx}
                className="bg-card border border-border shadow-xs hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group rounded-3xl overflow-hidden p-0 h-full"
              >
                <CardHeader className="p-6 pb-3">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-foreground/80 bg-muted/20 px-3 py-1 rounded-full border border-border">
                      {srv.pillar}
                    </span>
                    {srv.badge && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                        <Tag className="w-2.5 h-2.5" />
                        {srv.badge}
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    <Link href={linkHref}>{srv.title}</Link>
                  </CardTitle>
                  <CardDescription className="text-muted leading-relaxed mt-2 text-xs sm:text-sm font-normal min-h-[44px]">
                    {srv.desc}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 px-6 pt-0 pb-4">
                  {srv.highlights && srv.highlights.length > 0 && (
                    <div className="space-y-2 border-t border-border/60 pt-4">
                      {srv.highlights.map((h, hIdx) => (
                        <div
                          key={hIdx}
                          className="flex items-center gap-2 text-xs font-semibold text-foreground/80"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {srv.startingPrice && (
                    <div className="pt-2 text-xs text-muted font-semibold">
                      Starting at <span className="font-bold text-foreground">{srv.startingPrice}</span>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="px-6 py-4 border-t border-border/60 bg-muted/5">
                  <Link
                    href={linkHref}
                    className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-primary-hover transition group-hover:translate-x-1"
                  >
                    <span>Explore Scope &amp; Deliverables</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
