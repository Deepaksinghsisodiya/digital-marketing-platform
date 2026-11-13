/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { PublicSiteSettings } from "../../lib/cms";
import {
  ShieldCheck,
  Globe,
  ArrowUp,
  ArrowUpRight,
  Send,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Button } from "../ui/button";

export const Footer: React.FC<{ settings?: PublicSiteSettings | null }> = ({
  settings,
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const companyName = settings?.companyName || "NEXORA";
  const legalName = settings?.legalName || "Nexora Technologies Inc.";
  const supportEmail = settings?.supportEmail || "growth@nexora.digital";
  const supportPhone = settings?.supportPhone || "+1 (800) 555-0199";
  const address =
    settings?.address || "Global Performance Marketing Infrastructure";

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

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim().includes("@")) {
      setSubscribed(true);
      setNewsletterEmail("");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openCookiePreferences = () => {
    window.dispatchEvent(new CustomEvent("nexora_open_cookie_preferences"));
  };

  return (
    <footer className="border-t border-slate-200 bg-slate-50 text-slate-600 text-xs">
      <div className="max-w-[1720px] 2xl:max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
        {/* Brand & Mission Column (Span 2) */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2.5">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={companyName}
                className="w-10 h-10 object-contain rounded-xl bg-white border border-slate-200 p-1 shadow-xs"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-pink-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-600/30">
                {companyName ? companyName.charAt(0).toUpperCase() : "N"}
              </div>
            )}
            <div>
              <span className="font-black text-slate-900 text-base tracking-tight block">
                {companyName}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600">
                Digital Marketing Platform
              </span>
            </div>
          </div>

          <p className="text-slate-600 text-xs leading-relaxed max-w-sm">
            Institutional digital marketing engine powering deterministic
            multi-touch attribution, commercial SEO, and high-velocity demand
            generation across global enterprise markets.
          </p>

          {/* System Status Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[11px] text-slate-700 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-900">
              All Systems Operational
            </span>
            <span className="text-slate-400">&bull;</span>
            <span className="text-slate-600">99.99% SLA Uptime</span>
          </div>

          {/* Contact Details */}
          <div className="space-y-1 text-slate-600 text-[11px] pt-2">
            <div>
              <span className="text-slate-500">Inquiries:</span>{" "}
              <a
                href={`mailto:${supportEmail}`}
                className="text-slate-800 hover:text-indigo-600 font-medium transition"
              >
                {supportEmail}
              </a>
            </div>
            <div>
              <span className="text-slate-500">Phone:</span>{" "}
              <a
                href={`tel:${supportPhone}`}
                className="text-slate-800 hover:text-indigo-600 font-medium transition"
              >
                {supportPhone}
              </a>
            </div>
            <div className="text-slate-500 text-[10px]">{address}</div>
          </div>
        </div>

        {/* Column 2: Digital Marketing Services */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
            Services
          </h4>
          <ul className="space-y-2.5 text-slate-600 font-medium">
            <li>
              <Link
                href="/services/seo"
                className="hover:text-indigo-600 transition"
              >
                Enterprise SEO
              </Link>
            </li>
            <li>
              <Link
                href="/services/paid-ads"
                className="hover:text-indigo-600 transition"
              >
                Paid Ads (Google / Meta)
              </Link>
            </li>
            <li>
              <Link
                href="/services/web-design-development"
                className="hover:text-indigo-600 transition"
              >
                High-Speed Web Architecture
              </Link>
            </li>
            <li>
              <Link
                href="/services/cro"
                className="hover:text-indigo-600 transition"
              >
                Conversion Rate Optimization
              </Link>
            </li>
            <li>
              <Link
                href="/services/analytics-reporting"
                className="hover:text-indigo-600 transition"
              >
                Multi-Touch Attribution
              </Link>
            </li>
            <li>
              <Link
                href="/services"
                className="font-semibold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 mt-1"
              >
                All 12 Services &rarr;
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Industry Verticals */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
            Industries
          </h4>
          <ul className="space-y-2.5 text-slate-600 font-medium">
            <li>
              <Link
                href="/industries/saas"
                className="hover:text-indigo-600 transition"
              >
                SaaS & Cloud Platforms
              </Link>
            </li>
            <li>
              <Link
                href="/industries/ecommerce"
                className="hover:text-indigo-600 transition"
              >
                E-Commerce & DTC
              </Link>
            </li>
            <li>
              <Link
                href="/industries/healthcare"
                className="hover:text-indigo-600 transition"
              >
                Healthcare & Life Sciences
              </Link>
            </li>
            <li>
              <Link
                href="/industries/real-estate"
                className="hover:text-indigo-600 transition"
              >
                Real Estate Development
              </Link>
            </li>
            <li>
              <Link
                href="/industries/education"
                className="hover:text-indigo-600 transition"
              >
                Education & EdTech
              </Link>
            </li>
            <li>
              <Link
                href="/industries"
                className="font-semibold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 mt-1"
              >
                All 8 Verticals &rarr;
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Platform & Playbooks */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
            Growth & Tools
          </h4>
          <ul className="space-y-2.5 text-slate-600 font-medium">
            <li>
              <Link
                href="/case-studies"
                className="hover:text-indigo-600 transition"
              >
                Client Case Studies
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-indigo-600 transition">
                Transparent Pricing
              </Link>
            </li>
            <li>
              <Link
                href="/tools/roi-calculator"
                className="hover:text-indigo-600 transition"
              >
                Interactive ROI Calculator
              </Link>
            </li>
            <li>
              <Link href="/resources" className="hover:text-indigo-600 transition">
                Playbooks & Whitepapers
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-indigo-600 transition">
                Growth Insights Blog
              </Link>
            </li>
            <li>
              <Link
                href="/book-a-call"
                className="font-semibold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 mt-1"
              >
                Schedule Diagnostic &rarr;
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 5: Newsletter & Governance */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
            Growth Intelligence
          </h4>
          <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
            Join 12,000+ digital leaders receiving our weekly attribution and
            conversion tear-downs.
          </p>

          {subscribed ? (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              Subscribed to Growth Briefing!
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter business email"
                  required
                  className="w-full h-10 rounded-xl bg-white border border-slate-300 px-3.5 pr-10 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition shadow-xs"
                />
                <button
                  type="submit"
                  aria-label="Subscribe to newsletter"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[10px] text-slate-500 block">
                No spam. Unsubscribe anytime.
              </span>
            </form>
          )}

          {/* Cookie Preferences Link */}
          <div className="pt-4 mt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={openCookiePreferences}
              className="text-[11px] text-slate-600 hover:text-indigo-600 transition underline underline-offset-2 flex items-center gap-1 font-medium"
            >
              <Lock className="w-3 h-3 text-indigo-600" /> Cookie Preferences
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Legal & Copyright */}
      <div className="border-t border-slate-200 bg-white">
        <div className="max-w-[1720px] 2xl:max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span>
              &copy; {new Date().getFullYear()} {legalName}. All rights
              reserved.
            </span>
            <Link href="/privacy" className="hover:text-slate-900 transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-900 transition">
              Terms of Service
            </Link>
            <Link href="/cookies" className="hover:text-slate-900 transition">
              Cookie Policy
            </Link>
            <Link
              href="/accessibility"
              className="hover:text-slate-900 transition"
            >
              Accessibility (WCAG AA)
            </Link>
            <Link href="/trust" className="hover:text-slate-900 transition">
              Security & Trust
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500">
              Multi-Region Single URL Engine
            </span>
            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Scroll back to top"
              className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 transition"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
