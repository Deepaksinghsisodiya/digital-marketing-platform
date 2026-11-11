import React from "react";
import Link from "next/link";
import type { PublicSiteSettings } from "../../lib/cms";
import { Sparkles, ArrowRight, ShieldCheck, Globe2, Layers } from "lucide-react";

interface HeaderProps {
  settings?: PublicSiteSettings | null;
  currentRegionCode?: string;
}

export const Header: React.FC<HeaderProps> = ({ settings }) => {
  const companyName = settings?.companyName || "NEXORA";

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
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-600/35 group-hover:scale-105 group-hover:shadow-indigo-600/50 transition-all duration-200">
            N
          </div>
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
          <Link
            href="/"
            className="px-4 py-2 rounded-xl text-white hover:text-indigo-400 hover:bg-slate-900/80 transition"
          >
            Home
          </Link>
          <Link
            href="/solutions"
            className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900/80 transition"
          >
            Solutions & Services
          </Link>
          <Link
            href="/blog"
            className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900/80 transition flex items-center gap-1.5"
          >
            <span>Insights</span>
            <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
              New
            </span>
          </Link>
          <Link
            href="/about"
            className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900/80 transition"
          >
            Company
          </Link>
          <Link
            href="/contact"
            className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900/80 transition"
          >
            Contact
          </Link>
        </nav>

        {/* Right Actions (No hardcoded country dropdown, pure global MNC styling) */}
        <div className="flex items-center gap-3.5">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-300">
            <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Worldwide Coverage</span>
          </div>

          {/* Quick link to Admin Portal */}
          <a
            href="http://localhost:5173"
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
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-xs font-bold text-white hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-105 active:scale-95 transition-all"
          >
            <span>Get Diagnostic</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
};
