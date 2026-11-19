/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PublicSiteSettings, PublicMenu } from "../../lib/cms";
import {
  Sparkles,
  ChevronDown,
  Globe2,
  Menu,
  X,
  TrendingUp,
  SearchCode,
  Mail,
  Building2,
  ShoppingCart,
  Home,
  Stethoscope,
  Briefcase,
  ArrowRight,
  Code2,
  Database,
  CheckCircle2,
  Lightbulb,
  Clock,
  Phone,
  Smartphone,
  BarChart3,
  Users,
  Award,
  Cpu,
  Info,
  FileText,
} from "lucide-react";
import { AnnouncementBar } from "./AnnouncementBar";

interface HeaderProps {
  settings?: PublicSiteSettings | null;
  currentRegionCode?: string;
  menu?: PublicMenu | null;
}

interface ServiceSubLink {
  title: string;
  href: string;
}

interface ServiceTabDef {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  heading: string;
  col1: ServiceSubLink[];
  col2: ServiceSubLink[];
  col3: ServiceSubLink[];
  promo: {
    badge: string;
    stat: string;
    description: string;
    ctaText: string;
    ctaLink: string;
  };
}

const SERVICE_TABS: ServiceTabDef[] = [
  {
    id: "seo",
    label: "Search Engine Optimization",
    icon: SearchCode,
    heading: "Search Engine Optimization",
    col1: [
      { title: "SEO Services", href: "/services/seo" },
      { title: "Agentic AI SEO", href: "/services/seo" },
      { title: "Technical SEO", href: "/services/seo" },
      { title: "Local SEO", href: "/services/seo" },
      { title: "Link Building Services", href: "/services/seo" },
      { title: "SEO Reseller Services", href: "/services/seo" },
    ],
    col2: [
      { title: "AI SEO & GEO", href: "/services/seo" },
      { title: "Enterprise SEO", href: "/services/seo" },
      { title: "SEO Migration Services", href: "/services/seo" },
      { title: "Vernacular SEO Services", href: "/services/seo" },
      { title: "White Label SEO Services", href: "/services/seo" },
      { title: "HyperLocal Marketing", href: "/services/seo" },
    ],
    col3: [
      { title: "LLM Optimization", href: "/services/seo" },
      { title: "Ecommerce SEO", href: "/services/seo" },
      { title: "Javascript SEO", href: "/services/seo" },
      { title: "Multilingual SEO Services", href: "/services/seo" },
      { title: "SEO Audit", href: "/contact" },
      { title: "Google Penalty Recovery", href: "/services/seo" },
    ],
    promo: {
      badge: "NEW • FY 2026-27 DIGITAL REPORT CARD",
      stat: "266M",
      description:
        "Search volume our clients own in AI Overviews and Google Search. Real data from 100+ brands.",
      ctaText: "Download Report Card",
      ctaLink: "/contact",
    },
  },
  {
    id: "software",
    label: "Custom Software & Web",
    icon: Code2,
    heading: "Custom Software & Web Application Development",
    col1: [
      { title: "Custom Web Applications", href: "/services/web-application-development" },
      { title: "Next.js 15 Full-Stack Portals", href: "/services/web-design-development" },
      { title: "SaaS Product Engineering", href: "/services/custom-software-development" },
      { title: "REST & GraphQL API Architecture", href: "/services/api-development" },
      { title: "Microservices Development", href: "/services/custom-software-development" },
      { title: "Cloud Infrastructure (AWS / Azure)", href: "/services/custom-software-development" },
    ],
    col2: [
      { title: "C# .NET Core Microservices", href: "/services/web-application-development" },
      { title: "Node.js & TypeScript Backends", href: "/services/web-application-development" },
      { title: "React Front-End Engineering", href: "/services/web-design-development" },
      { title: "High-Performance Database Design", href: "/services/custom-software-development" },
      { title: "Legacy System Modernization", href: "/services/custom-software-development" },
      { title: "Headless CMS Implementations", href: "/services/web-design-development" },
    ],
    col3: [
      { title: "Sub-Second Speed Optimization", href: "/services/web-design-development" },
      { title: "Bank-Grade Security & OAuth", href: "/services/custom-software-development" },
      { title: "Docker & Kubernetes Orchestration", href: "/services/custom-software-development" },
      { title: "Multi-Tenant SaaS Architecture", href: "/services/custom-software-development" },
      { title: "Code & Architecture Audit", href: "/contact" },
      { title: "Dedicated Engineering Squads", href: "/contact" },
    ],
    promo: {
      badge: "ENTERPRISE CLOUD ARCHITECTURE",
      stat: "99.98%",
      description:
        "Average production uptime and sub-second latency delivered across global client web platforms.",
      ctaText: "Request Tech Scope",
      ctaLink: "/contact",
    },
  },
  {
    id: "mobile",
    label: "App Marketing & Dev",
    icon: Smartphone,
    heading: "Mobile Application Development & ASO",
    col1: [
      { title: "Native iOS App Development", href: "/services/custom-software-development" },
      { title: "Native Android App Development", href: "/services/custom-software-development" },
      { title: "Flutter Cross-Platform Apps", href: "/services/custom-software-development" },
      { title: "React Native Mobile Solutions", href: "/services/custom-software-development" },
      { title: "Mobile App UI/UX Design", href: "/services/ui-ux-design" },
      { title: "App Store Optimization (ASO)", href: "/services/seo" },
    ],
    col2: [
      { title: "Real-Time Push Notifications", href: "/services/custom-software-development" },
      { title: "Offline Data Sync & Caching", href: "/services/custom-software-development" },
      { title: "In-App Purchases & Stripe", href: "/services/ecommerce-development" },
      { title: "Biometric Authentication", href: "/services/custom-software-development" },
      { title: "Cross-Platform QA Testing", href: "/services/custom-software-development" },
      { title: "App Store & Play Store Publishing", href: "/services/custom-software-development" },
    ],
    col3: [
      { title: "60 FPS Native Performance", href: "/services/custom-software-development" },
      { title: "Enterprise Field Force Apps", href: "/services/custom-software-development" },
      { title: "FinTech & Banking Mobile Apps", href: "/services/custom-software-development" },
      { title: "Healthcare & HIPAA Mobile Apps", href: "/services/custom-software-development" },
      { title: "Mobile Lead Intake Funnels", href: "/services/cro" },
      { title: "Free Mobile Prototype Estimate", href: "/contact" },
    ],
    promo: {
      badge: "MOBILE SPEED & FIDELITY",
      stat: "60 FPS",
      description:
        "Silky smooth native mobile experiences for iOS and Android built on high-performance shared codebases.",
      ctaText: "Get Mobile Quote",
      ctaLink: "/contact",
    },
  },
  {
    id: "erp",
    label: "Enterprise ERP & CRM",
    icon: Database,
    heading: "Enterprise ERP, CRM & E-Commerce Systems",
    col1: [
      { title: "Custom Cloud ERP Solutions", href: "/services/custom-software-development" },
      { title: "Sales CRM Workflow Automation", href: "/services/marketing-automation-crm" },
      { title: "Multi-Branch Inventory Sync", href: "/services/custom-software-development" },
      { title: "Supply Chain Logistics Systems", href: "/services/custom-software-development" },
      { title: "Automated Billing & Invoicing", href: "/services/custom-software-development" },
      { title: "Industrial Automation Integration", href: "/services/workflow-automation" },
    ],
    col2: [
      { title: "Headless Shopify Plus Stores", href: "/services/ecommerce-development" },
      { title: "Custom B2B E-Commerce Portals", href: "/services/ecommerce-development" },
      { title: "High-AOV 1-Page Checkout Funnels", href: "/services/ecommerce-development" },
      { title: "WhatsApp Commerce Integration", href: "/services/ai-chatbots" },
      { title: "CRM Lead Scoring & Distribution", href: "/services/marketing-automation-crm" },
      { title: "Customer Data Platforms (CDP)", href: "/services/analytics-reporting" },
    ],
    col3: [
      { title: "Salesforce & HubSpot Sync", href: "/services/marketing-automation-crm" },
      { title: "Automated Quotation Funnels", href: "/services/workflow-automation" },
      { title: "Real-Time BI & Looker Dashboards", href: "/services/analytics-reporting" },
      { title: "Warehouse & Barcode Tracking", href: "/services/custom-software-development" },
      { title: "Role-Based Security & Audit", href: "/services/custom-software-development" },
      { title: "Schedule Custom ERP Demo", href: "/contact" },
    ],
    promo: {
      badge: "OPERATIONAL EFFICIENCY",
      stat: "68%",
      description:
        "Reduction in order fulfillment time and operational overhead achieved for manufacturing and logistics clients.",
      ctaText: "Schedule Live Demo",
      ctaLink: "/book-a-call",
    },
  },
  {
    id: "ppc",
    label: "PPC / Paid Marketing",
    icon: TrendingUp,
    heading: "Pay-Per-Click & Performance Paid Media",
    col1: [
      { title: "Google Ads (PMax & Search)", href: "/services/paid-ads" },
      { title: "Meta (Facebook & Instagram) Ads", href: "/services/paid-social" },
      { title: "LinkedIn B2B Lead Gen Ads", href: "/services/paid-social" },
      { title: "YouTube Video Advertising", href: "/services/paid-ads" },
      { title: "Programmatic Display Networks", href: "/services/paid-ads" },
      { title: "Retargeting & Dynamic Ads", href: "/services/paid-ads" },
    ],
    col2: [
      { title: "Negative Keyword Pruning", href: "/services/paid-ads" },
      { title: "Algorithmic Smart Bidding", href: "/services/paid-ads" },
      { title: "Dynamic Product Retargeting", href: "/services/paid-ads" },
      { title: "Account-Based Marketing (ABM)", href: "/services/paid-social" },
      { title: "High-Converting Creative Sprints", href: "/services/branding-creative" },
      { title: "Ad Spend Waste Diagnostic", href: "/services/paid-ads" },
    ],
    col3: [
      { title: "Multi-Touch Revenue Attribution", href: "/services/analytics-reporting" },
      { title: "Google Merchant Feed Scale", href: "/services/ecommerce-development" },
      { title: "E-Commerce ROAS Optimization", href: "/services/paid-ads" },
      { title: "Local Store Visit Campaigns", href: "/services/paid-ads" },
      { title: "Mobile App Install Campaigns", href: "/services/paid-ads" },
      { title: "Free Paid Ad Account Audit", href: "/contact" },
    ],
    promo: {
      badge: "PERFORMANCE MARKETING",
      stat: "4.8x",
      description:
        "Average attributed ROAS delivered across ecommerce and B2B paid media client accounts.",
      ctaText: "Get Free Ad Audit",
      ctaLink: "/contact",
    },
  },
  {
    id: "martech",
    label: "MarTech / Data Analytics",
    icon: BarChart3,
    heading: "Marketing Technology, Attribution & CRO",
    col1: [
      { title: "Server-Side Meta CAPI Tracking", href: "/services/analytics-reporting" },
      { title: "Google Analytics 4 (GA4) Audits", href: "/services/analytics-reporting" },
      { title: "Closed-Loop Revenue Attribution", href: "/services/analytics-reporting" },
      { title: "Looker Studio Growth Dashboards", href: "/services/analytics-reporting" },
      { title: "BigQuery Data Pipeline Sync", href: "/services/analytics-reporting" },
      { title: "Zero 3rd-Party Cookie Deprecation", href: "/services/analytics-reporting" },
    ],
    col2: [
      { title: "Multivariate Landing Page Split Testing", href: "/services/cro" },
      { title: "Heatmap & Funnel Drop-off Audits", href: "/services/cro" },
      { title: "High-Speed Mobile Landing Pages", href: "/services/web-design-development" },
      { title: "Frictionless Multi-Step Lead Intake", href: "/services/cro" },
      { title: "Instant WhatsApp Lead Qualification", href: "/services/ai-chatbots" },
      { title: "Automated Behavioral Email Drips", href: "/services/email-marketing" },
    ],
    col3: [
      { title: "Executive BI Revenue Dashboards", href: "/services/analytics-reporting" },
      { title: "Customer Lifetime Value (LTV) Models", href: "/services/analytics-reporting" },
      { title: "Offline Conversion Signal Sync", href: "/services/analytics-reporting" },
      { title: "GDPR & DPDP Consent Governance", href: "/services/analytics-reporting" },
      { title: "Conversion Funnel Re-engineering", href: "/services/cro" },
      { title: "Request Tracking Diagnostic", href: "/contact" },
    ],
    promo: {
      badge: "DATA INTEGRITY",
      stat: "100%",
      description:
        "Deterministic revenue tracking directly connecting ad impressions to closed bank revenue.",
      ctaText: "Explore Attribution",
      ctaLink: "/contact",
    },
  },
];

export const Header: React.FC<HeaderProps> = ({ settings }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeServiceTab, setActiveServiceTab] = useState<string>("seo");
  const [isScrolled, setIsScrolled] = useState(false);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDropdownEnter = (key: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setActiveDropdown(key);
  };

  const handleDropdownLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const companyName = settings?.companyName || "NEXORA";
  const apiBase =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5201";

  const rawLogo =
    settings?.logoUrl ||
    (settings?.logoMediaId
      ? `/api/v1/public/media/${settings.logoMediaId}/download`
      : null);
  const logoUrl = rawLogo
    ? rawLogo.startsWith("http")
      ? rawLogo
      : `${apiBase}${rawLogo.startsWith("/") ? "" : "/"}${rawLogo}`
    : null;

  const currentTab =
    SERVICE_TABS.find((t) => t.id === activeServiceTab) || SERVICE_TABS[0]!;

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      {/* 1. Dynamic Alert / Announcement Bar */}
      <AnnouncementBar
        announcementBarJson={settings?.announcementBarJson}
        defaultMessage="Delivering Digital Growth, Enterprise Software & AI-Powered Engineering across Global Markets."
      />

      {/* 2. Top Utility Contact Strip */}
      <div className="hidden lg:block bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 select-none">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-end gap-6 font-medium">
          <a
            href={`tel:${settings?.supportPhone || "+18005550199"}`}
            className="inline-flex items-center gap-1.5 hover:text-primary transition-colors text-slate-700 dark:text-slate-300 text-xs font-semibold"
          >
            <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{settings?.supportPhone || "+1 (800) 555-0199"}</span>
          </a>

          <a
            href={`mailto:${settings?.supportEmail || "contact@nexora.io"}`}
            className="inline-flex items-center gap-1.5 hover:text-primary transition-colors text-slate-700 dark:text-slate-300 text-xs font-semibold"
          >
            <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{settings?.supportEmail || "contact@nexora.io"}</span>
          </a>

          <Link
            href="/book-a-call"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary text-primary-foreground font-bold rounded-md hover:bg-primary-hover shadow-xs transition-all text-xs"
          >
            <span>Request a Call</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 3. Main Header Navigation (Sticky with Exact Techmagnate Width: max-w-[1360px]) */}
      <div
        className={`w-full transition-all duration-300 border-b border-slate-200/90 dark:border-slate-800/80 ${isScrolled
          ? "bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-sm"
          : "bg-white dark:bg-slate-950 shadow-2xs"
          }`}
      >
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0 group focus-visible:outline-hidden rounded-xl"
            aria-label={`${companyName} Homepage`}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={companyName}
                className="h-9 sm:h-11 w-auto object-contain"
              />
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-lg shadow-md shadow-primary/25 group-hover:scale-105 transition-transform">
                  <span className="font-heading">N</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-slate-950 dark:text-white text-lg sm:text-xl tracking-tight leading-none group-hover:text-primary transition-colors">
                    {companyName}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary mt-0.5">
                    Digital Growth &bull; Technology &bull; AI
                  </span>
                </div>
              </div>
            )}
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden lg:flex items-center gap-0.5 xl:gap-1 text-xs xl:text-sm font-semibold text-slate-700 whitespace-nowrap shrink-0 h-full"
            aria-label="Main Navigation"
          >
            {/* 1. Company Dropdown (Exact 2-Column UI Card from Screenshot) */}
            <div
              className="relative shrink-0"
              onMouseEnter={() => handleDropdownEnter("company")}
              onMouseLeave={handleDropdownLeave}
            >
              <button
                type="button"
                className={`relative px-3 py-2 flex items-center gap-1 transition-colors cursor-pointer text-xs xl:text-sm ${activeDropdown === "company"
                  ? "text-primary font-bold after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:bg-primary"
                  : "text-slate-700 dark:text-slate-200 hover:text-primary"
                  }`}
                aria-expanded={activeDropdown === "company"}
              >
                <span>Company</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === "company" ? "rotate-180 text-primary" : "text-slate-400"
                    }`}
                />
              </button>

              if (isDropdown) {
                return (
              <div
                key={item.id || item.label}
                className="relative shrink-0 h-full flex items-center"
                onMouseEnter={() => handleDropdownEnter(dropdownKey)}
                onMouseLeave={handleDropdownLeave}
              >
                <button
                  type="button"
                  className={`px-2.5 xl:px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${activeDropdown === dropdownKey
                    ? "text-primary bg-primary/10 font-bold"
                    : isItemActive
                      ? "text-primary font-bold"
                      : "hover:text-primary hover:bg-slate-50"
                    }`}
                  aria-expanded={activeDropdown === dropdownKey}
                  aria-haspopup="true"
                  onClick={() =>
                    setActiveDropdown(
                      activeDropdown === dropdownKey ? null : dropdownKey,
                    )
                  }
                >
                  <span>{item.label}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === dropdownKey
                      ? "rotate-180 text-primary"
                      : "text-slate-400"
                      }`}
                  />
                </button>

                {/* 1. SERVICES MEGA MENU CANVAS (100% Solid Opaque Background - Zero Transparency) */}
                {activeDropdown === dropdownKey && dropdownKey === "services" && (
                  <div
                    key={item.id || item.label}
                    className="relative shrink-0 h-full flex items-center"
                    onMouseEnter={() => handleDropdownEnter(dropdownKey)}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                          CAPABILITIES
                        </span>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                          Integrated Digital Growth, Software Engineering &amp; Intelligent AI
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                        Client keywords now cited in AI answers. Real data from 103 brands.
                      </p>
                    </div>

                    {/* 1. SERVICES MEGA MENU CANVAS (100% Solid Opaque Background - Zero Transparency) */}
                    {activeDropdown === dropdownKey && dropdownKey === "services" && (
                      <div
                        className="absolute top-full left-0 w-[840px] xl:w-[920px] max-w-[calc(100vw-3rem)] bg-white dark:bg-slate-900 rounded-b-2xl rounded-t-none border-x border-b border-t-0 border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 animate-in fade-in-50 zoom-in-95 duration-150 z-50 select-none"
                      >
                        <span>Download Report Card</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1.5 pt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        <span>Google Premier Partner</span>
                      </div>
                    </div>
                  </div>
                    </div>
            </div>
        </div>
              )}
      </div>

      {/* 2. OUR SERVICES (EXACT TECHMAGNATE TABBED MEGA MENU) */}
      <div
        className="relative shrink-0"
        onMouseEnter={() => handleDropdownEnter("services")}
        onMouseLeave={handleDropdownLeave}
      >
        <button
          type="button"
          className={`relative px-3 py-2 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${activeDropdown === "services"
            ? "text-primary font-bold after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:bg-primary"
            : "hover:text-primary"
            }`}
          aria-expanded={activeDropdown === "services"}
        >
          <span>Our Services</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === "services" ? "rotate-180 text-primary" : "text-slate-400"
              }`}
          />
        </button>

        {/* EXACT TABBED SERVICES MEGA MENU CANVAS */}
        {activeDropdown === "services" && (
          <div
            className="fixed left-1/2 -translate-x-1/2 top-[92px] sm:top-[116px] w-[1160px] xl:w-[1320px] max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 xl:p-8 animate-in fade-in-50 zoom-in-95 duration-150 z-50 select-none"
          >
            {/* Top Horizontal Category Tabs (Pills) */}
            <div className="flex flex-wrap items-center gap-2 pb-5 border-b border-slate-100 dark:border-slate-800">
              {SERVICE_TABS.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeServiceTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onMouseEnter={() => setActiveServiceTab(tab.id)}
                    onClick={() => setActiveServiceTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${isActive
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white border-2 border-slate-300 dark:border-slate-600 shadow-xs scale-102"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent"
                      }`}
                  >
                    <IconComponent className={`w-4 h-4 ${isActive ? "text-primary" : "text-slate-500"}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Tab Main Content Box (3 Columns of Links + 1 Promo Card) */}
            <div className="mt-5 p-5 xl:p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
              <div className="grid grid-cols-12 gap-6 items-stretch">
                {/* Left: 3 Sub-Link Columns (Span 8) */}
                <div className="col-span-12 lg:col-span-8 space-y-4">
                  <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                    {currentTab.heading}
                  </h4>

                  <div className="grid grid-cols-3 gap-5">
                    {/* Col 1 */}
                    <ul className="space-y-2.5">
                      {currentTab.col1.map((item) => (
                        <li key={item.title}>
                          <Link
                            href={item.href}
                            className="text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-primary transition-colors block truncate"
                          >
                            {item.title}
                          </Link>
                        </li>
                      ))}
                    </ul>

                    {/* 2. INDUSTRIES DROPDOWN CANVAS (100% Solid Opaque Background) */}
                    {activeDropdown === dropdownKey && dropdownKey === "industries" && (
                      <div
                        className="absolute top-full left-0 w-[540px] max-w-[calc(100vw-3rem)] bg-white dark:bg-slate-900 rounded-b-2xl rounded-t-none border-x border-b border-t-0 border-slate-200 dark:border-slate-800 shadow-2xl p-5 animate-in fade-in-50 zoom-in-95 duration-150 z-50 select-none"
                      >
                        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Tailored Industry Solutions
                          </span>
                          <Link
                            href={item.href}
                            className="text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-primary transition-colors block truncate"
                          >
                            {item.title}
                          </Link>
                        </li>
                      ))}
                    </ul>

                    {/* 3. SOLUTIONS DROPDOWN CANVAS (2-Column Solid Opaque Card Grid - ZERO Transparency) */}
                    {activeDropdown === dropdownKey && dropdownKey === "solutions" && (
                      <div
                        className="absolute top-full left-0 w-[620px] max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-b-2xl rounded-t-none border-x border-b border-t-0 border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 animate-in fade-in-50 zoom-in-95 duration-150 z-50 select-none"
                      >
                        {/* Header Row */}
                        <div className="pb-3 mb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                              ENTERPRISE SOLUTIONS
                            </span>
                            <span className="text-xs font-bold text-slate-400">
                              Outcome Pathways
                            </span>
                          </div>
                          <Link
                            href={item.href}
                            className="text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-primary transition-colors block truncate"
                          >
                            {item.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right: Promotional Highlight Card (Span 4) */}
                <div className="col-span-12 lg:col-span-4">
                  <div className="h-full rounded-2xl bg-gradient-to-br from-blue-50/90 via-white to-blue-50/40 dark:from-slate-800 dark:via-slate-850 dark:to-slate-900 border border-blue-100 dark:border-slate-700 p-5 xl:p-6 flex flex-col justify-between shadow-xs">
                    <div className="space-y-3">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
                        {currentTab.promo.badge}
                      </span>
                      <div className="text-3xl xl:text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight leading-none">
                        {currentTab.promo.stat}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                        {currentTab.promo.description}
                      </p>
                    </div>

                    {/* 4. GENERIC ADMIN CUSTOM DROPDOWN (100% Solid Opaque Background) */}
                    {activeDropdown === dropdownKey &&
                      dropdownKey !== "services" &&
                      dropdownKey !== "industries" &&
                      dropdownKey !== "solutions" &&
                      item.children &&
                      item.children.length > 0 && (
                        <div
                          className="absolute top-full left-0 min-w-[220px] bg-white dark:bg-slate-900 rounded-b-xl rounded-t-none border-x border-b border-t-0 border-slate-200 dark:border-slate-800 shadow-xl p-2 animate-in fade-in-50 zoom-in-95 duration-150 z-50 space-y-0.5 select-none"
                        >
                          {item.children.map((child) => (
                            <Link
                              key={child.id || child.url}
                              href={child.url}
                              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                            >
                              <span>{child.label}</span>
                              <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 text-primary transition-all" />
                            </Link>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Our Work Dropdown (2-Column UI Card) */}
      <div
        className="relative shrink-0"
        onMouseEnter={() => handleDropdownEnter("work")}
        onMouseLeave={handleDropdownLeave}
      >
        <button
          type="button"
          className={`relative px-3 py-2 flex items-center gap-1 transition-colors cursor-pointer text-xs xl:text-sm ${activeDropdown === "work"
            ? "text-primary font-bold after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:bg-primary"
            : "text-slate-700 dark:text-slate-200 hover:text-primary"
            }`}
          aria-expanded={activeDropdown === "work"}
        >
          <span>Our Work</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === "work" ? "rotate-180 text-primary" : "text-slate-400"
              }`}
          />
        </button>

        {activeDropdown === "work" && (
          <div className="absolute top-full left-0 w-[600px] xl:w-[650px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 animate-in fade-in-50 zoom-in-95 duration-150 z-50">
            <div className="grid grid-cols-12 gap-5 items-stretch">
              {/* Left Column */}
              <div className="col-span-12 sm:col-span-6 flex flex-col justify-center space-y-1">
                <Link
                  href="/case-studies"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs xl:text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                >
                  <BarChart3 className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors shrink-0" />
                  <span>Case Studies</span>
                </Link>
                <Link
                  href="/case-studies"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs xl:text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors shrink-0" />
                  <span>Client Portfolio</span>
                </Link>
                <Link
                  href="/testimonials"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs xl:text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                >
                  <TrendingUp className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors shrink-0" />
                  <span>Video Testimonials</span>
                </Link>
                <Link
                  href="/about"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs xl:text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                >
                  <Award className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors shrink-0" />
                  <span>Enterprise Results &amp; ROI</span>
                </Link>
              </div>

              {/* Right Column: Promo Card */}
              <div className="col-span-12 sm:col-span-6">
                <div className="h-full rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-emerald-50/30 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-850 border border-emerald-100 dark:border-slate-700/80 p-5 flex flex-col justify-between shadow-xs">
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
                      PROVEN IMPACT &bull; VERIFIED REVIEWS
                    </span>
                    <div className="text-4xl xl:text-5xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight leading-none">
                      4.8x
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                      Average client ROAS across omnichannel search, digital campaigns &amp; custom software deployments.
                    </p>
                  </div>

                  <div className="pt-4 space-y-2.5">
                    <Link
                      href="/case-studies"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer w-fit"
                    >
                      <span>Explore Case Studies</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1.5 pt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      <span>Clutch Global Leader &bull; 99.4% SLA</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. INDUSTRIES DROPDOWN CANVAS (100% Solid Opaque Background) */}
      {activeDropdown === dropdownKey && dropdownKey === "industries" && (
                      <div
                        className="absolute top-full left-0 w-[540px] max-w-[calc(100vw-3rem)] bg-white dark:bg-slate-900 rounded-b-2xl rounded-t-none border-x border-b border-t-0 border-slate-200 dark:border-slate-800 shadow-2xl p-5 animate-in fade-in-50 zoom-in-95 duration-150 z-50 select-none"
                      >
                        <Cpu className="w-3.5 h-3.5 text-slate-500 group-hover:text-primary transition-colors shrink-0" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-primary">SaaS &amp; Tech</span>
                      </Link>
                      <Link
                        href="/industries"
                        className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition group"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 text-slate-500 group-hover:text-primary transition-colors shrink-0" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-primary">E-Commerce</span>
                      </Link>
                      <Link
                        href="/industries"
                        className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition group"
                      >
                        <Stethoscope className="w-3.5 h-3.5 text-slate-500 group-hover:text-primary transition-colors shrink-0" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-primary">Healthcare</span>
                      </Link>
                      <Link
                        href="/industries"
                        className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition group"
                      >
                        <Home className="w-3.5 h-3.5 text-slate-500 group-hover:text-primary transition-colors shrink-0" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-primary">Real Estate</span>
                      </Link>
                      <Link
                        href="/industries"
                        className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition group"
                      >
                        <Building2 className="w-3.5 h-3.5 text-slate-500 group-hover:text-primary transition-colors shrink-0" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-primary">Manufacturing</span>
                      </Link>
                      <Link
                        href="/industries"
                        className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition group"
                      >
                        <Briefcase className="w-3.5 h-3.5 text-slate-500 group-hover:text-primary transition-colors shrink-0" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-primary">FinTech</span>
                      </Link>
                    </div>

                    {/* Right Column: Promo Card */ }
  <div className="col-span-12 sm:col-span-5">
    <div className="h-full rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50/50 to-indigo-50/30 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-850 border border-indigo-100 dark:border-slate-700/80 p-5 flex flex-col justify-between shadow-xs">
      <div className="space-y-2">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
          VERTICAL ARCHITECTURES
        </span>
        <div className="text-4xl xl:text-5xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight leading-none">
          12+
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          Domain blueprints engineered for compliance and high conversion.
        </p>
      </div>

      <div className="pt-4 space-y-2.5">
        <Link
          href="/industries"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer w-fit"
        >
          <span>View Playbooks</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1.5 pt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
          <span>Enterprise Domain Certified</span>
        </div>
      </div>
    </div>
  </div>
                  </div >
                </div >
              )}
            </div >

  {/* 3. SOLUTIONS DROPDOWN CANVAS (2-Column Solid Opaque Card Grid - ZERO Transparency) */ }
{
  activeDropdown === dropdownKey && dropdownKey === "solutions" && (
                      <div
                        className="absolute top-full left-0 w-[620px] max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-b-2xl rounded-t-none border-x border-b border-t-0 border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 animate-in fade-in-50 zoom-in-95 duration-150 z-50 select-none"
                      >
                        <Lightbulb className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors shrink-0" />
                        <span>Search Trends &amp; AI Blog</span>
                      </Link>
                      <Link
                        href="/resources"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs xl:text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                      >
                        <FileText className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors shrink-0" />
                        <span>Research &amp; Whitepapers</span>
                      </Link>
                      <Link
                        href="/resources"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs xl:text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                      >
                        <SearchCode className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors shrink-0" />
                        <span>Web &amp; MarTech Guides</span>
                      </Link>
                      <Link
                        href="/contact"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs xl:text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                      >
                        <Sparkles className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors shrink-0" />
                        <span>Free SEO &amp; Tech Audit</span>
                      </Link>
                    </div >

    {/* Right Column: Promo Card */ }
    < div className = "col-span-12 sm:col-span-6" >
      <div className="h-full rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-50/30 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-850 border border-amber-100 dark:border-slate-700/80 p-5 flex flex-col justify-between shadow-xs">
        <div className="space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
            ORIGINAL RESEARCH &bull; 2026
          </span>
          <div className="text-4xl xl:text-5xl font-black text-amber-600 dark:text-amber-400 tracking-tight leading-none">
            100+
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Data-driven benchmarks on AI Overview citations, LLM visibility &amp; growth architecture.
          </p>
        </div>

        <div className="pt-4 space-y-2.5">
          <Link
            href="/resources"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer w-fit"
          >
            <span>Read Research Reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1.5 pt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
            <span>Cited Globally</span>
          </div>
        </div>
      </div>
                    )
}

{/* 4. GENERIC ADMIN CUSTOM DROPDOWN (100% Solid Opaque Background) */ }
{
  activeDropdown === dropdownKey &&
    dropdownKey !== "services" &&
    dropdownKey !== "industries" &&
    dropdownKey !== "solutions" &&
    item.children &&
    item.children.length > 0 && (
      <div
        className="absolute top-full left-0 min-w-[220px] bg-white dark:bg-slate-900 rounded-b-xl rounded-t-none border-x border-b border-t-0 border-slate-200 dark:border-slate-800 shadow-xl p-2 animate-in fade-in-50 zoom-in-95 duration-150 z-50 space-y-0.5 select-none"
      >
        {item.children.map((child) => (
          <Link
            key={child.id || child.url}
            href={child.url}
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
          >
            <span>{child.label}</span>
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 text-primary transition-all" />
          </Link>
        ))}
      </div>
    )
}
                  </div >
                </div >
              )}
            </div >

  {/* 6. Blog */ }
  < Link
href = "/blog"
className = {`px-3 py-2 rounded-lg transition-colors hover:text-primary ${pathname === "/blog" ? "text-primary font-bold" : ""
  }`}
            >
  Blog
            </Link >

  {/* 7. Contact */ }
  < Link
href = "/contact"
className = {`px-3 py-2 rounded-lg transition-colors hover:text-primary ${pathname === "/contact" ? "text-primary font-bold" : ""
  }`}
            >
  Contact
            </Link >
          </nav >

  {/* Right Action: Contact / Quote Button */ }
  < div className = "flex items-center gap-3" >
    <Link
      href="/contact"
      className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
    >
      <span>Get Free Proposal</span>
      <ArrowRight className="w-4 h-4" />
    </Link>

{/* Mobile Hamburger */ }
<button
  type="button"
  onClick={() => setMobileMenuOpen(true)}
  className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
  aria-label="Toggle menu"
>
  <Menu className="w-6 h-6" />
</button>
          </div >
        </div >
      </div >

  {/* MOBILE DRAWER */ }
{
  mobileMenuOpen && (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        onClick={() => setMobileMenuOpen(false)}
      />
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-slate-900 p-6 overflow-y-auto border-l border-slate-200 dark:border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <span className="font-black text-slate-900 dark:text-white text-base">{companyName}</span>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 rounded-lg text-slate-600 dark:text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3">
          <Link
            href="/services"
            className="block text-sm font-bold text-slate-900 dark:text-white py-1.5"
          >
            Our Services
          </Link>
          <Link
            href="/case-studies"
            className="block text-sm font-bold text-slate-900 dark:text-white py-1.5"
          >
            Our Work
          </Link>
          <Link
            href="/industries"
            className="block text-sm font-bold text-slate-900 dark:text-white py-1.5"
          >
            Industry
          </Link>
          <Link
            href="/blog"
            className="block text-sm font-bold text-slate-900 dark:text-white py-1.5"
          >
            Blog &amp; Insights
          </Link>
          <Link
            href="/contact"
            className="block text-sm font-bold text-slate-900 dark:text-white py-1.5"
          >
            Contact Us
          </Link>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <a
            href={`tel:${settings?.supportPhone || "+919910308266"}`}
            className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300"
          >
            <Phone className="w-4 h-4 text-primary" />
            <span>{settings?.supportPhone || "+91-9910308266"}</span>
          </a>
          <Link
            href="/book-a-call"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs"
          >
            <Clock className="w-4 h-4 text-primary" />
            <span>Book a Strategy Call</span>
          </Link>
          <Link
            href="/contact"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md"
          >
            <span>Request a Call</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
    </header >
  );
};