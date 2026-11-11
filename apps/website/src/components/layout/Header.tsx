/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { PublicSiteSettings, PublicMenu } from "../../lib/cms";
import { Sparkles, ArrowRight, ShieldCheck, Globe2, Menu, X } from "lucide-react";

interface HeaderProps {
  settings?: PublicSiteSettings | null;
  currentRegionCode?: string;
  menu?: PublicMenu | null;
}

export const Header: React.FC<HeaderProps> = ({ settings, menu }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const defaultLinks = [
    { id: "home", label: "Home", url: "/" },
    { id: "solutions", label: "Solutions & Services", url: "/solutions" },
    { id: "blog", label: "Insights", url: "/blog", badge: "New" },
    { id: "about", label: "Company", url: "/about" },
    { id: "contact", label: "Contact", url: "/contact" },
  ];

  const items = menu?.items && menu.items.length > 0 ? menu.items : defaultLinks;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-all">
      {/* Top micro announcement bar */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-950 to-indigo-950 text-white text-[11px] py-2 px-4 text-center border-b border-indigo-900/40">
        <div className="max-w-[1720px] 2xl:max-w-[1920px] mx-auto flex items-center justify-center gap-2 font-medium">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 text-[10px]">
            <Sparkles className="w-3 h-3 text-amber-300" /> Enterprise Engine 2.0
          </span>
          <span className="text-slate-300">
            Global B2B Performance Marketing & Multi-Touch Attribution Infrastructure
          </span>
          <Link
            href="/contact"
            className="hidden sm:inline-flex items-center gap-1 font-bold text-indigo-400 hover:text-white transition ml-2 underline underline-offset-2"
          >
            Request Diagnostic &rarr;
          </Link>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-[1720px] 2xl:max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 h-20 flex items-center justify-between">
        {/* Brand Monogram & Logo */}
        <Link href="/" className="flex items-center gap-3.5 group">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={companyName}
              className="w-11 h-11 object-contain rounded-2xl bg-slate-900 border border-slate-800 p-1 group-hover:scale-105 transition-all duration-200"
            />
          ) : (
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-600/35 group-hover:scale-105 group-hover:shadow-indigo-600/50 transition-all duration-200">
              {companyName ? companyName.charAt(0).toUpperCase() : "N"}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-white block leading-tight font-sans">
                {companyName}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" /> SOC2 TYPE II
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 block mt-0.5">
              Enterprise Growth Infrastructure
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden lg:flex items-center gap-2 text-sm font-semibold text-slate-300">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.url}
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900/80 transition flex items-center gap-1.5"
            >
              <span>{item.label}</span>
              {"badge" in item && item.badge && (
                <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  {String(item.badge)}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Right Actions (No hardcoded country dropdown, pure global MNC styling) */}
        <div className="flex items-center gap-3.5">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-300">
            <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Worldwide Coverage</span>
          </div>

          {/* Quick link to Admin Portal */}
          <a
            href={process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:5174"}
            target="_blank"
            rel="noreferrer"
            className="hidden xl:inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white hover:border-slate-600 transition"
            title="Open Agency Admin Portal"
          >
            <span>Admin Portal</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
          </a>

          <Link
            href="/contact"
            className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-xs font-bold text-white hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-105 active:scale-95 transition-all"
          >
            <span>Get Diagnostic</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900/80 border border-slate-800 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-indigo-400" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-2xl px-6 py-6 space-y-4">
          <nav className="flex flex-col space-y-1.5">
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.url}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-slate-200 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 text-sm font-semibold flex items-center justify-between transition"
              >
                <span>{item.label}</span>
                {"badge" in item && item.badge ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    {String(item.badge)}
                  </span>
                ) : (
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                )}
              </Link>
            ))}
          </nav>

          <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-3">
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition"
            >
              Request Growth Diagnostic
            </Link>

            <a
              href={process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:5174"}
              target="_blank"
              rel="noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 font-semibold text-xs transition"
            >
              Open Admin Portal &rarr;
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
