/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PublicSiteSettings, PublicMenu, PublicMenuItem } from "../../lib/cms";
import {
  Search,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  Clock,
} from "lucide-react";
import { AnnouncementBar } from "./AnnouncementBar";

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
  const [logoError, setLogoError] = useState(false);
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

  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setMobileAccordion(null);
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

  const companyName = settings?.companyName || "Nexora";
  const bookingUrl = settings?.bookingUrl || "/book-a-call";

  let navConfig: {
    tagline?: string;
    showSearch?: boolean;
    showCta?: boolean;
    ctaText?: string;
    alignment?: "left" | "center" | "right";
    sticky?: boolean;
    hiddenMenuUrls?: string[];
  } = {};
  if (settings?.themeTokensJson) {
    try {
      const parsed = JSON.parse(settings.themeTokensJson) as {
        navbarConfig?: typeof navConfig;
      };
      navConfig = parsed.navbarConfig || {};
    } catch {
      navConfig = {};
    }
  }

  const tagline = navConfig.tagline?.trim() || "";
  const showSearch = navConfig.showSearch !== false;
  const showCta = navConfig.showCta !== false;
  const ctaText = navConfig.ctaText?.trim() || "Book a Call";
  const alignment = navConfig.alignment || "center";
  const isSticky = navConfig.sticky !== false;
  const hiddenSet = new Set(
    (navConfig.hiddenMenuUrls || []).map((u) => u.trim().toLowerCase()),
  );
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

  // 100% Admin-driven navigation items (from Admin -> Menus -> header), excluding deactivated items
  const resolvedMenuItems: PublicMenuItem[] =
    menu?.items && menu.items.length > 0
      ? [...menu.items]
        .filter((item) => !hiddenSet.has((item.url || "").trim().toLowerCase()))
        .map((item) => ({
          ...item,
          children: (item.children || []).filter(
            (c) => !hiddenSet.has((c.url || "").trim().toLowerCase()),
          ),
        }))
        .sort((a, b) => a.displayOrder - b.displayOrder)
      : [];

  const hasDropdown = (item: PublicMenuItem) =>
    Boolean(item.children && item.children.length > 0);

  const getItemDropdownKey = (item: PublicMenuItem) =>
    item.id || item.label;

  return (
    <header className={`${isSticky ? "sticky top-0" : "relative"} z-50 w-full transition-all duration-300`}>
      {/* 1. Dynamic Announcement Bar (Hides smoothly on scroll) */}
      <AnnouncementBar
        announcementBarJson={settings?.announcementBarJson}
        isScrolled={isSticky && isScrolled}
      />

      {/* 2. Main Sticky Header Navigation */}
      <div
        className={`w-full transition-all duration-300 border-b ${
          isScrolled
            ? "bg-white border-slate-200 shadow-sm"
            : "bg-white/95 backdrop-blur-md border-slate-200/80 shadow-2xs"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 h-14 sm:h-16">
          {/* Brand Logo & Wordmark (from Admin -> Site Settings) */}
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-2.5 shrink-0 whitespace-nowrap group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
            aria-label={`${companyName} Homepage`}
          >
            {logoUrl && !logoError ? (
              <img
                src={logoUrl}
                alt={companyName}
                onError={() => setLogoError(true)}
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-lg sm:rounded-xl bg-slate-50 border border-slate-200 p-0.5 sm:p-1 shadow-2xs"
              />
            ) : (
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-sm sm:text-base shadow-sm shadow-primary/25 group-hover:scale-105 transition-transform duration-200 shrink-0">
                <span className="font-heading">{companyName.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="font-black text-slate-900 text-sm sm:text-base tracking-tight leading-none group-hover:text-teal-700 transition-colors truncate max-w-[160px] sm:max-w-[260px] md:max-w-none">
                {companyName}
              </span>
              {tagline && (
                <span className="hidden md:block text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 whitespace-nowrap">
                  {tagline}
                </span>
              )}
            </div>
          </Link>

          {/* Desktop Navigation Links (100% Admin CMS Driven) */}
          <nav
            className={`hidden lg:flex flex-1 items-center gap-1 text-xs xl:text-sm font-semibold text-slate-700 whitespace-nowrap h-full px-4 ${
              alignment === "left"
                ? "justify-start"
                : alignment === "right"
                  ? "justify-end"
                  : "justify-center"
            }`}
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
                const sortedChildren = [...(item.children || [])].sort(
                  (a, b) => a.displayOrder - b.displayOrder,
                );
                const isWide = sortedChildren.length >= 4;
                const isMega = sortedChildren.length >= 9;

                return (
                  <div
                    key={dropdownKey}
                    className="relative shrink-0 h-full flex items-center"
                    onMouseEnter={() => handleDropdownEnter(dropdownKey)}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <button
                      type="button"
                      className={`h-full px-3 flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary relative ${
                        activeDropdown === dropdownKey || isItemActive
                          ? "text-teal-700 font-bold"
                          : "hover:text-teal-700 hover:bg-slate-50/70"
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
                            ? "rotate-180 text-teal-700"
                            : "text-slate-400"
                        }`}
                      />
                      {(activeDropdown === dropdownKey || isItemActive) && (
                        <span className="absolute bottom-0 inset-x-1.5 h-0.5 bg-teal-600 z-10" />
                      )}
                    </button>

                    {activeDropdown === dropdownKey && (
                      <div
                        className={`absolute top-full left-0 bg-white rounded-b-2xl rounded-t-none border border-slate-200 shadow-2xl p-5 animate-in fade-in-50 zoom-in-95 duration-150 z-50 select-none ${
                          isMega
                            ? "lg:w-[700px] xl:w-[820px] max-w-[calc(100vw-2rem)]"
                            : isWide
                              ? "w-[580px] max-w-[calc(100vw-2rem)]"
                              : "min-w-[260px]"
                        }`}
                      >
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 px-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            {item.label} ({sortedChildren.length})
                          </span>
                          {item.url && (
                            <Link
                              href={item.url}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 transition-colors"
                            >
                              <span>Explore all {item.label}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>
                        <div
                          className={
                            isMega
                              ? "grid grid-cols-3 gap-2"
                              : isWide
                                ? "grid grid-cols-2 gap-2"
                                : "space-y-1"
                          }
                        >
                          {sortedChildren.map((child) => (
                            <Link
                              key={child.id || child.url}
                              href={child.url}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent text-[13px] font-semibold text-slate-700 hover:text-teal-700 hover:bg-teal-50/70 hover:border-teal-100 transition-all group"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-teal-600 transition-colors shrink-0" />
                              <span className="leading-snug">{child.label}</span>
                              <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 text-teal-700 transition-all shrink-0" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div
                  key={dropdownKey}
                  className="relative shrink-0 h-full flex items-center"
                >
                  <Link
                    href={item.url}
                    className={`h-full px-3 flex items-center transition-colors whitespace-nowrap shrink-0 relative hover:text-teal-700 ${
                      isItemActive ? "text-teal-700 font-bold" : "hover:bg-slate-50/70"
                    }`}
                  >
                    <span>{item.label}</span>
                    {isItemActive && (
                      <span className="absolute bottom-0 inset-x-1.5 h-0.5 bg-teal-600 z-10" />
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Right Action Tools: Admin-Controlled Search + Primary CTA */}
          <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
            {showSearch && (
              <Link
                href="/search"
                aria-label="Search site"
                title="Search"
                className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-slate-100 transition border border-slate-200/80"
              >
                <Search className="w-4 h-4" />
              </Link>
            )}

            {showCta && (
              <Link
                href={bookingUrl}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-primary-foreground shadow-sm shadow-primary/25 hover:shadow-primary/35 active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
              >
                <span>{ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}

            {/* Mobile/Tablet Hamburger Drawer Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-slate-700 hover:text-teal-700 hover:bg-slate-100 transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
              aria-label="Open Mobile Menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ACCESSIBLE MOBILE & TABLET NAVIGATION DRAWER (100% Admin Driven) */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl p-5 sm:p-6 flex flex-col justify-between overflow-y-auto border-l border-slate-200 animate-in slide-in-from-right duration-250">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black text-sm shadow-sm">
                    {companyName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-black text-slate-900 text-sm tracking-tight">
                    {companyName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1 text-sm font-bold text-slate-800">
                {resolvedMenuItems.map((item) => {
                  const isDropdown = hasDropdown(item);
                  const dropdownKey = getItemDropdownKey(item);

                  if (isDropdown) {
                    const sortedChildren = [...(item.children || [])].sort(
                      (a, b) => a.displayOrder - b.displayOrder,
                    );
                    return (
                      <div key={dropdownKey}>
                        <button
                          type="button"
                          onClick={() =>
                            setMobileAccordion(
                              mobileAccordion === dropdownKey ? null : dropdownKey,
                            )
                          }
                          className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                        >
                          <span>{item.label}</span>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${
                              mobileAccordion === dropdownKey
                                ? "rotate-180 text-teal-700"
                                : "text-slate-400"
                            }`}
                          />
                        </button>

                        {mobileAccordion === dropdownKey && (
                          <div className="pl-3 pr-2 py-2 border-l-2 border-teal-500/40 ml-3 text-xs space-y-1">
                            {sortedChildren.map((child) => (
                              <Link
                                key={child.id || child.url}
                                href={child.url}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block py-1.5 text-slate-600 hover:text-teal-700 transition-colors"
                              >
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={dropdownKey}
                      href={item.url}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2.5 px-3 rounded-xl hover:bg-slate-50 hover:text-teal-700 transition"
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {showCta && (
              <div className="pt-6 border-t border-slate-200 space-y-2.5">
                <Link
                  href={bookingUrl}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover py-3 text-xs font-bold text-primary-foreground shadow-sm transition"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{ctaText}</span>
                </Link>

                {settings?.legalName && (
                  <div className="text-center text-[11px] text-slate-500 pt-1">
                    {settings.legalName}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
