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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 relative z-10">
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
                    className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-primary hover:text-white text-slate-400 flex items-center justify-center border border-slate-800 transition capitalize text-xs"
                    aria-label={platform}
                  >
                    {platform.charAt(0).toUpperCase()}
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
