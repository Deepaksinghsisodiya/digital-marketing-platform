/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PublicSiteSettings, PublicMenu, PublicMenuItem } from "../../lib/cms";
import {
  Sparkles,
  Search,
  ChevronDown,
  Globe2,
  Menu,
  X,
  TrendingUp,
  SearchCode,
  Megaphone,
  Share2,
  Mail,
  MessageSquare,
  Layout,
  BarChart3,
  Palette,
  Users,
  Cpu,
  Building2,
  ShoppingCart,
  Home,
  GraduationCap,
  Stethoscope,
  Store,
  Briefcase,
  Hotel,
  ArrowRight,
  ShieldCheck,
  Code2,
  Terminal,
  Bot,
  Workflow,
  Database,
  Cloud,
  CheckCircle2,
  Lightbulb,
  Rocket,
  LineChart,
  Target,
  Clock,
} from "lucide-react";
import { AnnouncementBar } from "./AnnouncementBar";
import { Button } from "../ui/button";

interface HeaderProps {
  settings?: PublicSiteSettings | null;
  currentRegionCode?: string;
  menu?: PublicMenu | null;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  menu,
}) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);
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
    }, 150);
  };

  // Close mobile drawer and dropdown on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setMobileAccordion(null);
  }, [pathname]);

  // Global Escape keyboard shortcut to close dropdowns & drawers
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

  // THREE MAJOR PILLARS: Digital Growth, Technology Solutions, AI & Automation
  const megaMenuPillars = [
    {
      pillar: "Digital Growth",
      badge: "Pillar 1",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      accent: "text-blue-600",
      items: [
        {
          title: "SEO Services",
          href: "/services/seo",
          desc: "High-intent commercial keyword capture",
          icon: SearchCode,
        },
        {
          title: "Paid Media (Google & Meta)",
          href: "/services/paid-ads",
          desc: "Algorithmic bidding & account-based retargeting",
          icon: TrendingUp,
        },
        {
          title: "Conversion Optimization (CRO)",
          href: "/services/cro",
          desc: "Multivariate testing & funnel drop-off remediation",
          icon: Sparkles,
        },
        {
          title: "Social Media Marketing",
          href: "/services/social-media-marketing",
          desc: "Executive brand amplification & engagement",
          icon: Share2,
        },
        {
          title: "Content Marketing",
          href: "/services/content-marketing",
          desc: "Thought leadership & search-driven content engines",
          icon: Megaphone,
        },
        {
          title: "Marketing Analytics",
          href: "/services/analytics-reporting",
          desc: "Deterministic server-side multi-touch attribution",
          icon: BarChart3,
        },
      ],
    },
    {
      pillar: "Technology Solutions",
      badge: "Pillar 2",
      badgeColor: "bg-slate-100 text-slate-800 border-slate-300",
      accent: "text-slate-800",
      items: [
        {
          title: "Corporate Website Development",
          href: "/services/web-design-development",
          desc: "High-speed websites built for maximum sales conversion",
          icon: Layout,
        },
        {
          title: "Custom Web Applications",
          href: "/services/web-application-development",
          desc: "Resilient full-stack applications & clean modular systems",
          icon: Code2,
        },
        {
          title: "Custom Software Engineering",
          href: "/services/custom-software-development",
          desc: "Bespoke business platforms & enterprise tools",
          icon: Terminal,
        },
        {
          title: "E-Commerce Development",
          href: "/services/ecommerce-development",
          desc: "Modern storefronts & high-AOV checkout funnels",
          icon: ShoppingCart,
        },
        {
          title: "UI/UX Design Systems",
          href: "/services/ui-ux-design",
          desc: "Atomic design tokens & human-centered prototypes",
          icon: Palette,
        },
        {
          title: "API & Cloud Integration",
          href: "/services/api-development",
          desc: "High-throughput RESTful services & cloud systems",
          icon: Database,
        },
      ],
    },
    {
      pillar: "AI & Automation",
      badge: "Pillar 3",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      accent: "text-purple-600",
      items: [
        {
          title: "AI Integration & Agents",
          href: "/services/ai-integration",
          desc: "LLM tooling, semantic search & custom agents",
          icon: Bot,
        },
        {
          title: "AI Conversational Chatbots",
          href: "/services/ai-chatbots",
          desc: "Instant customer intake & conversational bots",
          icon: MessageSquare,
        },
        {
          title: "Business Process Automation",
          href: "/services/workflow-automation",
          desc: "Event-driven workflow engines & webhook pipelines",
          icon: Workflow,
        },
        {
          title: "Marketing Automation & CRM",
          href: "/services/marketing-automation-crm",
          desc: "Automated lead scoring, SLA routing & CRM sync",
          icon: Cpu,
        },
        {
          title: "Lifecycle Email Marketing",
          href: "/services/email-marketing",
          desc: "Behavioral nurture sequences & trigger flows",
          icon: Mail,
        },
      ],
    },
  ];

  // 8 Target Industries
  const industriesList = [
    {
      title: "SaaS & Technology",
      href: "/industries/saas",
      icon: Cpu,
      desc: "CAC-to-LTV expansion and product pipeline velocity",
    },
    {
      title: "E-Commerce & Retail",
      href: "/industries/ecommerce",
      icon: ShoppingCart,
      desc: "ROAS maximization, feed optimization & cart recovery",
    },
    {
      title: "Healthcare & Life Sciences",
      href: "/industries/healthcare",
      icon: Stethoscope,
      desc: "DPDP-compliant patient acquisition & credibility",
    },
    {
      title: "Real Estate & Property",
      href: "/industries/real-estate",
      icon: Home,
      desc: "High-ticket investor acquisition & localized search",
    },
    {
      title: "Restaurants & Hospitality",
      href: "/industries/hospitality",
      icon: Hotel,
      desc: "Direct booking maximization & local visibility",
    },
    {
      title: "Education & EdTech",
      href: "/industries/education",
      icon: GraduationCap,
      desc: "Student intake cycles & programmatic landing funnels",
    },
    {
      title: "Manufacturing & Industrial",
      href: "/industries/manufacturing",
      icon: Building2,
      desc: "B2B catalog architectures & global distributor inquiries",
    },
    {
      title: "Professional Services",
      href: "/industries/professional-services",
      icon: Briefcase,
      desc: "RFP generation & partner authority establishment",
    },
  ];

  // 6 Solution Pathways
  const solutionsList = [
    {
      title: "Generate More Leads",
      href: "/solutions/generate-leads",
      desc: "Multi-channel acquisition funnels with verified CRM scoring",
      icon: Target,
    },
    {
      title: "Improve Search Visibility",
      href: "/solutions/improve-search-visibility",
      desc: "Technical SEO, search ranking & AI answer engine visibility",
      icon: SearchCode,
    },
    {
      title: "Build Digital Products",
      href: "/solutions/build-digital-products",
      desc: "Custom web platforms & design systems engineered for scale",
      icon: Code2,
    },
    {
      title: "Automate Business Operations",
      href: "/solutions/automate-operations",
      desc: "Intelligent AI agents, webhook synchronizations & CRM routing",
      icon: Workflow,
    },
    {
      title: "Improve Customer Experience",
      href: "/solutions/improve-customer-experience",
      desc: "Ultra-fast load times, intuitive UI/UX & streamlined intake",
      icon: Sparkles,
    },
    {
      title: "Scale Digital Marketing",
      href: "/solutions/scale-marketing",
      desc: "Deterministic attribution, ROAS scale & creative testing",
      icon: Rocket,
    },
  ];

  // Resolved navigation items dynamically from Admin CMS (/menus) or curated defaults
  const resolvedMenuItems: PublicMenuItem[] =
    menu?.items && menu.items.length > 0
      ? [...menu.items].sort((a, b) => a.displayOrder - b.displayOrder)
      : [
          { id: "nav-services", label: "Services", url: "/services", displayOrder: 0, children: [] },
          { id: "nav-industries", label: "Industries", url: "/industries", displayOrder: 1, children: [] },
          { id: "nav-solutions", label: "Solutions", url: "/solutions", displayOrder: 2, children: [] },
          { id: "nav-work", label: "Our Work", url: "/case-studies", displayOrder: 3, children: [] },
          { id: "nav-insights", label: "Insights", url: "/blog", displayOrder: 4, children: [] },
          { id: "nav-about", label: "About", url: "/about", displayOrder: 5, children: [] },
          { id: "nav-contact", label: "Contact", url: "/contact", displayOrder: 6, children: [] },
        ];

  // Helper to determine if an item has a dropdown menu
  const hasDropdown = (item: PublicMenuItem) => {
    const key = item.label.toLowerCase();
    return (
      key.includes("service") ||
      key.includes("industr") ||
      key.includes("solution") ||
      Boolean(item.children && item.children.length > 0)
    );
  };

  const getItemDropdownKey = (item: PublicMenuItem) => {
    const key = item.label.toLowerCase();
    if (key.includes("service")) return "services";
    if (key.includes("industr")) return "industries";
    if (key.includes("solution")) return "solutions";
    return item.id || item.label;
  };

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      {/* 1. Dynamic Announcement Bar */}
      <AnnouncementBar
        announcementBarJson={settings?.announcementBarJson}
        defaultMessage="Helping ambitious businesses grow through technology, creativity and digital strategy."
      />

      {/* 2. Main Sticky Header Navigation */}
      <div
        className={`w-full transition-all duration-300 border-b border-slate-200/90 ${
          isScrolled
            ? "bg-white/90 backdrop-blur-xl shadow-sm"
            : "bg-white/95 backdrop-blur-md shadow-2xs"
        }`}
      >
        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 transition-all duration-300 ${
            isScrolled ? "h-12 sm:h-14" : "h-12 sm:h-16"
          }`}
        >
          {/* Brand Logo & Wordmark */}
          <Link
            href="/"
            className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 whitespace-nowrap group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
            aria-label={`${companyName} Homepage`}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={companyName}
                className="w-7 h-7 sm:w-9 sm:h-9 object-contain rounded-lg sm:rounded-xl bg-slate-50 border border-slate-200 p-0.5 sm:p-1 shadow-2xs"
              />
            ) : (
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-sm sm:text-lg shadow-md shadow-primary/25 group-hover:scale-105 transition-transform duration-200 shrink-0">
                <span className="font-heading">N</span>
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="font-black text-slate-900 text-xs sm:text-base tracking-tight leading-none group-hover:text-primary transition-colors truncate max-w-[150px] xs:max-w-[200px] sm:max-w-[280px] md:max-w-none">
                {companyName}
              </span>
              <span className="hidden md:block text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 whitespace-nowrap">
                Growth &bull; Technology &bull; AI
              </span>
            </div>
          </Link>

          {/* Desktop/Tablet Navigation Links & Mega Menus (Dynamically Driven by Admin CMS with Curated Defaults) */}
          <nav
            className="hidden lg:flex items-center gap-0.5 xl:gap-1 text-xs xl:text-sm font-semibold text-slate-700 whitespace-nowrap shrink-0"
            aria-label="Main Navigation"
          >
            {resolvedMenuItems.map((item) => {
              const isDropdown = hasDropdown(item);
              const dropdownKey = getItemDropdownKey(item);
              const isItemActive = Boolean(
                pathname &&
                  (pathname === item.url ||
                    (item.url !== "/" && pathname.startsWith(item.url))),
              );

              if (isDropdown) {
                return (
                  <div
                    key={item.id || item.label}
                    className="relative shrink-0"
                    onMouseEnter={() => handleDropdownEnter(dropdownKey)}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <button
                      type="button"
                      className={`px-2.5 xl:px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
                        activeDropdown === dropdownKey
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
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          activeDropdown === dropdownKey
                            ? "rotate-180 text-primary"
                            : "text-slate-400"
                        }`}
                      />
                    </button>

                    {/* 1. SERVICES MEGA MENU CANVAS (100% Solid Opaque Background - Zero Transparency) */}
                    {activeDropdown === dropdownKey && dropdownKey === "services" && (
                      <div
                        className="absolute top-full left-0 w-[840px] xl:w-[920px] max-w-[calc(100vw-3rem)] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 animate-in fade-in-50 zoom-in-95 duration-150 z-50 select-none"
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
                          <Link
                            href={item.url || "/services"}
                            className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 group transition-colors"
                          >
                            <span>Explore all services</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        </div>

                        <div className="grid grid-cols-3 gap-5">
                          {megaMenuPillars.map((pillar) => (
                            <div key={pillar.pillar} className="space-y-2.5">
                              <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                                <span
                                  className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${pillar.badgeColor}`}
                                >
                                  {pillar.badge}
                                </span>
                                <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                                  {pillar.pillar}
                                </span>
                              </div>
                              <ul className="space-y-0.5">
                                {pillar.items.map((it) => {
                                  const IconComponent = it.icon;
                                  return (
                                    <li key={it.href}>
                                      <Link
                                        href={it.href}
                                        className="group flex items-start gap-2.5 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                                      >
                                        <div className="mt-0.5 w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center shrink-0 transition-colors">
                                          <IconComponent className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300 group-hover:text-primary" />
                                        </div>
                                        <div className="min-w-0">
                                          <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors block truncate">
                                            {it.title}
                                          </span>
                                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal line-clamp-1 block">
                                            {it.desc}
                                          </span>
                                        </div>
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          ))}
                        </div>

                        {/* Mega Menu Footer Banner */}
                        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-2.5">
                          <span className="text-slate-600 dark:text-slate-300 font-medium text-[11px]">
                            Need a customized scope or dual marketing + engineering retainer?
                          </span>
                          <Link
                            href="/contact"
                            className="font-bold text-primary hover:text-primary-hover flex items-center gap-1 text-[11px] group"
                          >
                            <span>Request Custom Proposal</span>
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* 2. INDUSTRIES DROPDOWN CANVAS (100% Solid Opaque Background) */}
                    {activeDropdown === dropdownKey && dropdownKey === "industries" && (
                      <div
                        className="absolute top-full left-0 w-[540px] max-w-[calc(100vw-3rem)] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 animate-in fade-in-50 zoom-in-95 duration-150 z-50 select-none"
                      >
                        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Tailored Industry Solutions
                          </span>
                          <Link
                            href={item.url || "/industries"}
                            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                          >
                            <span>View All</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {industriesList.map((ind) => {
                            const IconComponent = ind.icon;
                            return (
                              <Link
                                key={ind.href}
                                href={ind.href}
                                className="group flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
                              >
                                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center shrink-0">
                                  <IconComponent className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300 group-hover:text-primary" />
                                </div>
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary transition block truncate">
                                    {ind.title}
                                  </span>
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 block">
                                    {ind.desc}
                                  </span>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 3. SOLUTIONS DROPDOWN CANVAS (2-Column Solid Opaque Card Grid - ZERO Transparency) */}
                    {activeDropdown === dropdownKey && dropdownKey === "solutions" && (
                      <div
                        className="absolute top-full left-0 w-[620px] max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 animate-in fade-in-50 zoom-in-95 duration-150 z-50 select-none"
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
                            href={item.url || "/solutions"}
                            className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 group"
                          >
                            <span>Explore all pathways</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        </div>

                        {/* 2-Column Cards Grid */}
                        <div className="grid grid-cols-2 gap-2.5">
                          {(item.children && item.children.length > 0
                            ? item.children.map((c) => ({
                                title: c.label,
                                href: c.url,
                                desc: "Configured via Admin Navigation Menus",
                                icon: Sparkles,
                              }))
                            : solutionsList
                          ).map((sol) => {
                            const IconComponent = sol.icon;
                            return (
                              <Link
                                key={sol.href}
                                href={sol.href}
                                className="group flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 hover:bg-primary/5 hover:border-primary/30 border border-slate-100/90 dark:border-slate-800 dark:bg-slate-800/40 transition-all shadow-2xs hover:shadow-sm"
                              >
                                <div className="w-8 h-8 rounded-lg bg-primary/10 group-hover:bg-primary text-primary group-hover:text-primary-foreground flex items-center justify-center shrink-0 transition-colors">
                                  <IconComponent className="w-4 h-4 transition-colors" />
                                </div>
                                <div className="min-w-0">
                                  <span className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-primary transition-colors block truncate">
                                    {sol.title}
                                  </span>
                                  <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 block mt-0.5">
                                    {sol.desc}
                                  </span>
                                </div>
                              </Link>
                            );
                          })}
                        </div>

                        {/* Bottom Banner */}
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/40 rounded-xl px-4 py-2.5">
                          <span className="text-slate-600 dark:text-slate-300 font-medium text-[11px]">
                            Need custom enterprise architecture or technical advisory?
                          </span>
                          <Link
                            href="/book-a-call"
                            className="font-bold text-primary hover:text-primary-hover flex items-center gap-1 text-[11px] group shrink-0"
                          >
                            <span>Schedule Call</span>
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* 4. GENERIC ADMIN CUSTOM DROPDOWN (100% Solid Opaque Background) */}
                    {activeDropdown === dropdownKey &&
                      dropdownKey !== "services" &&
                      dropdownKey !== "industries" &&
                      dropdownKey !== "solutions" &&
                      item.children &&
                      item.children.length > 0 && (
                        <div
                          className="absolute top-full left-0 min-w-[220px] bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl p-2 animate-in fade-in-50 zoom-in-95 duration-150 z-50 space-y-0.5 select-none"
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
                );
              }

              // Standard Direct Link
              return (
                <Link
                  key={item.id || item.label}
                  href={item.url}
                  className={`relative px-2.5 xl:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200 ${
                    isItemActive
                      ? "text-primary font-bold bg-primary/10"
                      : "hover:text-primary hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Tools: Book a Call & Primary CTA */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap">
            {/* Book a Call Link */}
            <Link
              href="/book-a-call"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-primary hover:bg-primary/10 transition border border-slate-200 whitespace-nowrap shrink-0 shadow-2xs"
            >
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>Book a Call</span>
            </Link>

            {/* Primary CTA Button: "Let's Talk" */}
            <Link
              href="/contact"
              className="inline-flex items-center gap-1 sm:gap-1.5 rounded-lg bg-primary hover:bg-primary-hover px-2 sm:px-3.5 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold text-primary-foreground shadow-md shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
            >
              <span>Let&apos;s Talk</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </Link>

            {/* Mobile/Tablet Hamburger Drawer Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1 sm:p-1.5 rounded-lg text-slate-700 hover:text-primary hover:bg-slate-100 transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
              aria-label="Open Mobile Menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ACCESSIBLE MOBILE & TABLET NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
        >
          {/* Backdrop Scrim */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-over Content Sheet */}
          <div className="fixed inset-y-0 right-0 w-full max-w-sm sm:max-w-md md:max-w-lg bg-white shadow-2xl p-5 sm:p-7 flex flex-col justify-between overflow-y-auto border-l border-slate-200 animate-in slide-in-from-right duration-250">
            <div className="space-y-6">
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black text-sm shadow-sm">
                    N
                  </div>
                  <span className="font-black text-slate-900 text-sm tracking-tight">
                    {companyName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Navigation List with Dynamic Accordions & Direct Links */}
              <div className="space-y-1 text-sm font-bold text-slate-800">
                {resolvedMenuItems.map((item) => {
                  const isDropdown = hasDropdown(item);
                  const dropdownKey = getItemDropdownKey(item);

                  if (isDropdown) {
                    return (
                      <div key={item.id || item.label}>
                        <button
                          type="button"
                          onClick={() =>
                            setMobileAccordion(
                              mobileAccordion === dropdownKey ? null : dropdownKey,
                            )
                          }
                          className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50 transition"
                        >
                          <span>{item.label}</span>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${
                              mobileAccordion === dropdownKey
                                ? "rotate-180 text-primary"
                                : "text-slate-400"
                            }`}
                          />
                        </button>

                        {/* Services Sub-tree */}
                        {mobileAccordion === dropdownKey && dropdownKey === "services" && (
                          <div className="pl-3 sm:pl-4 pr-2 py-2 border-l-2 border-primary/30 ml-2 sm:ml-3 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {megaMenuPillars.map((p) => (
                                <div key={p.pillar} className="space-y-1.5">
                                  <span className="font-extrabold text-slate-900 uppercase tracking-wider text-[10px] block">
                                    {p.pillar}
                                  </span>
                                  {p.items.map((it) => (
                                    <Link
                                      key={it.href}
                                      href={it.href}
                                      onClick={() => setMobileMenuOpen(false)}
                                      className="block py-1 text-slate-600 hover:text-primary transition-colors"
                                    >
                                      {it.title}
                                    </Link>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Industries Sub-tree */}
                        {mobileAccordion === dropdownKey && dropdownKey === "industries" && (
                          <div className="pl-3 sm:pl-4 pr-2 py-2 border-l-2 border-primary/30 ml-2 sm:ml-3 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {industriesList.map((ind) => (
                                <Link
                                  key={ind.href}
                                  href={ind.href}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="block py-1 text-slate-600 hover:text-primary transition-colors"
                                >
                                  {ind.title}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Solutions Sub-tree */}
                        {mobileAccordion === dropdownKey && dropdownKey === "solutions" && (
                          <div className="pl-3 sm:pl-4 pr-2 py-2 border-l-2 border-primary/30 ml-2 sm:ml-3 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {solutionsList.map((sol) => (
                                <Link
                                  key={sol.href}
                                  href={sol.href}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="block py-1 text-slate-600 hover:text-primary transition-colors"
                                >
                                  {sol.title}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Generic Admin Sub-items */}
                        {mobileAccordion === dropdownKey &&
                          dropdownKey !== "services" &&
                          dropdownKey !== "industries" &&
                          dropdownKey !== "solutions" &&
                          item.children &&
                          item.children.length > 0 && (
                            <div className="pl-3 sm:pl-4 pr-2 py-2 border-l-2 border-primary/30 ml-2 sm:ml-3 text-xs">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {item.children.map((child) => (
                                  <Link
                                    key={child.id || child.url}
                                    href={child.url}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block py-1 text-slate-600 hover:text-primary transition-colors"
                                  >
                                    {child.label}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    );
                  }

                  // Direct Navigation Link
                  return (
                    <Link
                      key={item.id || item.label}
                      href={item.url}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2.5 px-3 rounded-xl hover:bg-slate-50 transition"
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Drawer Bottom CTAs: Primary & Book a Call */}
            <div className="pt-6 border-t border-slate-100 space-y-2.5">
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover py-3 text-xs font-bold text-primary-foreground shadow-md shadow-primary/25 transition"
              >
                <span>Let&apos;s Talk</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/book-a-call"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 py-2.5 text-xs font-bold text-slate-700 transition"
              >
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>Book a Call</span>
              </Link>

              <div className="text-center text-[10px] sm:text-[11px] text-slate-400 pt-1">
                {settings?.legalName || `${companyName} Technology Pvt. Ltd.`} &bull; Enterprise SLA
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
