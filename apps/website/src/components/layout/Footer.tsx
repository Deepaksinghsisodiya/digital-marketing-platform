/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { PublicSiteSettings } from "../../lib/cms";
import { siteConfig, isRealValue } from "../../content/site.config";
import {
  ArrowUp,
  Send,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Loader2,
  Sparkles,
} from "lucide-react";

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  linkedin: (
    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  ),
  twitter: (
    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  x: (
    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  instagram: (
    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
  facebook: (
    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  youtube: (
    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
};

export const Footer: React.FC<{ settings?: PublicSiteSettings | null }> = () => {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const companyName = siteConfig.company.brandName;
  const legalName = isRealValue(siteConfig.company.legalName)
    ? siteConfig.company.legalName
    : `${companyName} Digital Marketing Agency`;

  const supportPhone = isRealValue(siteConfig.contact.phone)
    ? siteConfig.contact.phone
    : null;
  const supportEmail = isRealValue(siteConfig.contact.email)
    ? siteConfig.contact.email
    : null;

  const address =
    isRealValue(siteConfig.contact.address.city) &&
    isRealValue(siteConfig.contact.address.state)
      ? `${siteConfig.contact.address.city}, ${siteConfig.contact.address.state}, ${siteConfig.contact.address.country}`
      : null;

  const workingHours = siteConfig.contact.workingHours;

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) return;

    setIsSubscribing(true);
    setTimeout(() => {
      setSubscribed(true);
      setNewsletterEmail("");
      setIsSubscribing(false);
      toast.success("Subscribed to Nexora Growth Insights!");
    }, 400);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Only real social profiles that are verified
  const activeSocials = Object.entries(siteConfig.social).filter(
    ([, url]) => isRealValue(url)
  );

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 text-xs relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[250px] bg-primary/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 relative z-10">
        {/* Brand & Corporate Column (Span 2) */}
        <div className="space-y-4 lg:col-span-2">
          <Link href="/" className="inline-block" aria-label="Nexora Home">
            <img
              src="/images/brand/logo-white.svg"
              alt={companyName}
              className="h-9 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </Link>

          <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
            {siteConfig.company.description}
          </p>

          {/* Contact Details (Only real ones shown) */}
          <div className="text-xs text-slate-400 space-y-2 pt-2">
            {supportPhone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                <a href={`tel:${supportPhone}`} className="hover:text-white transition">
                  {supportPhone}
                </a>
              </div>
            )}
            {supportEmail && (
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                <a href={`mailto:${supportEmail}`} className="hover:text-white transition">
                  {supportEmail}
                </a>
              </div>
            )}
            {address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span>{address}</span>
              </div>
            )}
            {workingHours && (
              <div className="flex items-center gap-2 text-slate-500">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>{workingHours}</span>
              </div>
            )}
          </div>

          {/* Real Social Links (Hidden if none configured) */}
          {activeSocials.length > 0 && (
            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2">
                Follow Us
              </span>
              <div className="flex items-center gap-2">
                {activeSocials.map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-primary hover:text-primary-foreground text-slate-400 flex items-center justify-center border border-slate-800 hover:border-primary/40 transition-all text-xs"
                    aria-label={platform}
                  >
                    {SOCIAL_ICONS[platform.toLowerCase()] || platform.charAt(0).toUpperCase()}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Column 2: Digital Marketing Services */}
        <div className="space-y-3">
          <span className="font-bold text-white text-xs uppercase tracking-wider block">
            Services
          </span>
          <ul className="space-y-2">
            {siteConfig.services.map((srv) => (
              <li key={srv.slug}>
                <Link
                  href={`/services/${srv.slug}`}
                  className="hover:text-white transition block truncate"
                >
                  {srv.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Industries */}
        <div className="space-y-3">
          <span className="font-bold text-white text-xs uppercase tracking-wider block">
            Industries
          </span>
          <ul className="space-y-2">
            {siteConfig.industries.map((ind) => (
              <li key={ind.slug}>
                <Link
                  href={`/industries/${ind.slug}`}
                  className="hover:text-white transition block truncate"
                >
                  {ind.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Quick Links & Free Audit CTA */}
        <div className="space-y-4">
          <span className="font-bold text-white text-xs uppercase tracking-wider block">
            Company & Resources
          </span>
          <ul className="space-y-2">
            <li>
              <Link href="/about" className="hover:text-white transition">
                About Nexora
              </Link>
            </li>
            <li>
              <Link href="/case-studies" className="hover:text-white transition">
                Our Work & Results
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-white transition">
                Pricing & Packages
              </Link>
            </li>
            <li>
              <Link href="/free-audit" className="hover:text-white transition">
                Free Marketing Audit
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white transition">
                Contact Us
              </Link>
            </li>
          </ul>

          {/* Newsletter Box */}
          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-300 block mb-1.5">
              Marketing Tips in Your Inbox
            </span>
            {subscribed ? (
              <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Subscribed successfully!
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex gap-1.5 max-w-sm">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={isSubscribing}
                  aria-label="Subscribe"
                  className="bg-primary hover:bg-primary-hover text-white font-bold px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {isSubscribing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Legal & Regulatory Sub-Footer */}
      <div className="border-t border-slate-800 bg-slate-950 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1.5">
            <span>&copy; {new Date().getFullYear()} {legalName}. All rights reserved.</span>
            <span>&bull;</span>
            <Link href="/privacy" className="hover:text-slate-300 transition">
              Privacy Policy
            </Link>
            <span>&bull;</span>
            <Link href="/terms" className="hover:text-slate-300 transition">
              Terms of Service
            </Link>
            <span>&bull;</span>
            <Link href="/cookies" className="hover:text-slate-300 transition">
              Cookie Policy
            </Link>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new Event("nexora_open_cookie_preferences"));
                }
              }}
              className="hover:text-slate-300 transition cursor-pointer text-[11px] underline underline-offset-2"
            >
              Cookie Settings
            </button>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition px-2.5 py-1 rounded-md hover:bg-slate-900 cursor-pointer shrink-0"
            aria-label="Back to top"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
