/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PublicSiteSettings, PublicMenu } from "../../lib/cms";
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
} from "lucide-react";
import { AnnouncementBar } from "./AnnouncementBar";
import { SearchDialog } from "./SearchDialog";
import { RegionSwitcher } from "../RegionSwitcher";
import { Button } from "../ui/button";

interface HeaderProps {
  settings?: PublicSiteSettings | null;
  currentRegionCode?: string;
  menu?: PublicMenu | null;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  currentRegionCode = "IN",
  menu,
}) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveMegaMenu(null);
  }, [pathname]);

  // Global Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
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

  // 12 Institutional Services
  const servicesList = [
    {
      category: "Demand Generation",
      items: [
        {
          title: "Enterprise SEO",
          href: "/services/seo",
          desc: "Commercial keyword intent & technical scale",
          icon: SearchCode,
        },
        {
          title: "Paid Ads (PPC)",
          href: "/services/paid-ads",
          desc: "Google & Meta high-intent retargeting",
          icon: TrendingUp,
        },
        {
          title: "Content Marketing",
          href: "/services/content-marketing",
          desc: "Authoritative editorial & search funnels",
          icon: Megaphone,
        },
        {
          title: "Social Media (SMM)",
          href: "/services/social-media-marketing",
          desc: "Executive LinkedIn & audience amplification",
          icon: Share2,
        },
      ],
    },
    {
      category: "Conversion & Tech",
      items: [
        {
          title: "Web Architecture",
          href: "/services/web-design-development",
          desc: "Sub-second Next.js conversion sites",
          icon: Layout,
        },
        {
          title: "CRO & Split Testing",
          href: "/services/cro",
          desc: "Scientific multivariate funnel testing",
          icon: Sparkles,
        },
        {
          title: "Attribution & Reporting",
          href: "/services/analytics-reporting",
          desc: "Deterministic server-side ROI dashboards",
          icon: BarChart3,
        },
        {
          title: "Brand & Creative",
          href: "/services/branding-creative",
          desc: "Visual systems & conversion assets",
          icon: Palette,
        },
      ],
    },
    {
      category: "Retention & Lifecycle",
      items: [
        {
          title: "Lifecycle Email",
          href: "/services/email-marketing",
          desc: "Automated B2B drip lead nurturing",
          icon: Mail,
        },
        {
          title: "WhatsApp Marketing",
          href: "/services/whatsapp-marketing",
          desc: "Conversational intake & click-to-chat",
          icon: MessageSquare,
        },
        {
          title: "Influencer Marketing",
          href: "/services/influencer-marketing",
          desc: "Creator partnerships & co-marketing",
          icon: Users,
        },
        {
          title: "Marketing CRM & RevOps",
          href: "/services/marketing-automation-crm",
          desc: "SLA routing, lead scoring & CRM sync",
          icon: Cpu,
        },
      ],
    },
  ];

  // 8 Industry Verticals
  const industriesList = [
    {
      title: "SaaS & Cloud",
      href: "/industries/saas",
      icon: Cpu,
      desc: "CAC-to-LTV & pipeline velocity",
    },
    {
      title: "E-Commerce",
      href: "/industries/ecommerce",
      icon: ShoppingCart,
      desc: "ROAS scale & cart recovery",
    },
    {
      title: "Real Estate",
      href: "/industries/real-estate",
      icon: Home,
      desc: "High-ticket investor acquisition",
    },
    {
      title: "Education & EdTech",
      href: "/industries/education",
      icon: GraduationCap,
      desc: "Student enrollment funnels",
    },
    {
      title: "Healthcare & Med",
      href: "/industries/healthcare",
      icon: Stethoscope,
      desc: "Compliant patient acquisition",
    },
    {
      title: "Local Businesses",
      href: "/industries/local-business",
      icon: Store,
      desc: "Multi-location Google Maps SEO",
    },
    {
      title: "Professional Services",
      href: "/industries/professional-services",
      icon: Briefcase,
      desc: "RFP capture & consulting leads",
    },
    {
      title: "Hospitality & Travel",
      href: "/industries/hospitality",
      icon: Hotel,
      desc: "Direct booking engine",
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl transition-all">
      {/* Announcement Bar (from SiteSettings) */}
      <AnnouncementBar announcementBarJson={settings?.announcementBarJson} />

      {/* Main Navbar */}
      <div className="max-w-[1720px] 2xl:max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
        {/* Brand Logo & Monogram */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={companyName}
              className="w-10 h-10 object-contain rounded-xl bg-slate-900 border border-slate-800 p-1 group-hover:scale-105 transition-all duration-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/35 group-hover:scale-105 transition-all">
              {companyName ? companyName.charAt(0).toUpperCase() : "N"}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight text-white block leading-tight font-sans">
                {companyName}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" /> SOC2
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 block">
              Digital Marketing Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation (>= 1024px) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {/* Services Mega Menu Trigger */}
          <div
            className="relative"
            onMouseEnter={() => setActiveMegaMenu("services")}
            onMouseLeave={() => setActiveMegaMenu(null)}
          >
            <button
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition"
            >
              Services
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" />
            </button>

            {/* Mega Menu Dropdown */}
            {activeMegaMenu === "services" && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-[850px] p-6 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-slate-800 shadow-2xl grid grid-cols-3 gap-6 animate-in fade-in-0 zoom-in-95 duration-150">
                {servicesList.map((col, idx) => (
                  <div key={idx} className="space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block px-2.5">
                      {col.category}
                    </span>
                    <div className="space-y-1">
                      {col.items.map((item, itemIdx) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={itemIdx}
                            href={item.href}
                            className="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-800/80 transition"
                          >
                            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition shrink-0 mt-0.5">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition block">
                                {item.title}
                              </span>
                              <span className="text-[11px] text-slate-400 line-clamp-1 block mt-0.5">
                                {item.desc}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div className="col-span-3 pt-4 border-t border-slate-800 flex items-center justify-between px-2 text-xs text-slate-400">
                  <span>Looking for full multi-channel managed delivery?</span>
                  <Link
                    href="/services"
                    className="font-semibold text-indigo-400 hover:text-white transition flex items-center gap-1"
                  >
                    View all 12 services <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Industries Mega Menu Trigger */}
          <div
            className="relative"
            onMouseEnter={() => setActiveMegaMenu("industries")}
            onMouseLeave={() => setActiveMegaMenu(null)}
          >
            <button
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition"
            >
              Industries
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" />
            </button>

            {/* Industries Dropdown */}
            {activeMegaMenu === "industries" && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-[720px] p-6 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-slate-800 shadow-2xl grid grid-cols-2 gap-3 animate-in fade-in-0 zoom-in-95 duration-150">
                {industriesList.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={idx}
                      href={item.href}
                      className="group flex items-start gap-3 p-3 rounded-xl hover:bg-slate-800/80 transition"
                    >
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-slate-950 transition shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition block">
                          {item.title}
                        </span>
                        <span className="text-[11px] text-slate-400 line-clamp-1 block mt-0.5">
                          {item.desc}
                        </span>
                      </div>
                    </Link>
                  );
                })}
                <div className="col-span-2 pt-3 border-t border-slate-800 flex items-center justify-between px-2 text-xs text-slate-400">
                  <span>Custom ICP modeling for enterprise markets</span>
                  <Link
                    href="/industries"
                    className="font-semibold text-cyan-400 hover:text-white transition flex items-center gap-1"
                  >
                    Explore vertical solutions{" "}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Direct Nav Links */}
          <Link
            href="/case-studies"
            className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition"
          >
            Case Studies
          </Link>
          <Link
            href="/pricing"
            className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition"
          >
            Pricing
          </Link>
          <Link
            href="/about"
            className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition"
          >
            About
          </Link>
          <Link
            href="/blog"
            className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition"
          >
            Insights
          </Link>
          <Link
            href="/contact"
            className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition"
          >
            Contact
          </Link>
        </nav>

        {/* Right Section: Search Trigger, Region Switcher, Primary CTA */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Quick Search Button */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition text-xs"
            aria-label="Search platform"
          >
            <Search className="w-4 h-4 text-indigo-400" />
            <span className="hidden xl:inline">Search...</span>
            <kbd className="hidden xl:inline-block px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono border border-slate-700">
              ⌘K
            </kbd>
          </button>

          {/* Region Switcher */}
          <RegionSwitcher currentRegionCode={currentRegionCode} />

          {/* CTA */}
          <Button asChild variant="gradient" size="default" shape="pill">
            <Link href="/book-a-call">
              Book a Call <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </Button>
        </div>

        {/* Mobile Navbar Controls (< 1024px) */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            <Search className="w-4 h-4 text-indigo-400" />
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-indigo-400" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Full-Height Overlay) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-20 z-50 bg-slate-950/98 backdrop-blur-2xl overflow-y-auto px-6 py-8 flex flex-col justify-between border-t border-slate-800 animate-in fade-in-0 duration-200">
          <div className="space-y-6">
            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/services"
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center font-bold text-sm text-white hover:bg-slate-800 transition"
              >
                12 Services
              </Link>
              <Link
                href="/industries"
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center font-bold text-sm text-white hover:bg-slate-800 transition"
              >
                Industries
              </Link>
              <Link
                href="/case-studies"
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center font-bold text-sm text-white hover:bg-slate-800 transition"
              >
                Case Studies
              </Link>
              <Link
                href="/pricing"
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center font-bold text-sm text-white hover:bg-slate-800 transition"
              >
                Pricing Tiers
              </Link>
            </div>

            {/* Nav list */}
            <nav className="space-y-1 border-t border-slate-800 pt-4">
              <Link
                href="/about"
                className="block py-3 px-2 text-base font-semibold text-slate-200 hover:text-white border-b border-slate-900"
              >
                About Us
              </Link>
              <Link
                href="/blog"
                className="block py-3 px-2 text-base font-semibold text-slate-200 hover:text-white border-b border-slate-900"
              >
                Growth Insights & Playbooks
              </Link>
              <Link
                href="/tools/roi-calculator"
                className="block py-3 px-2 text-base font-semibold text-slate-200 hover:text-white border-b border-slate-900"
              >
                Interactive ROI Calculator
              </Link>
              <Link
                href="/contact"
                className="block py-3 px-2 text-base font-semibold text-slate-200 hover:text-white border-b border-slate-900"
              >
                Contact & Diagnostics
              </Link>
            </nav>
          </div>

          {/* Bottom Drawer Actions */}
          <div className="pt-8 border-t border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">
                Select Region:
              </span>
              <RegionSwitcher currentRegionCode={currentRegionCode} />
            </div>

            <Button
              asChild
              variant="gradient"
              size="lg"
              shape="pill"
              className="w-full h-12"
            >
              <Link href="/book-a-call">
                Book a Strategy Call <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Global Cmd+K Search Dialog */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
};
