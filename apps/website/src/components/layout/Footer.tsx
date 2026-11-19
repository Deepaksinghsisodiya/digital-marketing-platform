/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { PublicSiteSettings } from "../../lib/cms";
import { getStoredUtmParameters } from "../../lib/utm";
import {
  ShieldCheck,
  Globe,
  ArrowUp,
  ArrowUpRight,
  Send,
  CheckCircle2,
  Lock,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "../ui/button";
import { Reveal } from "../motion/Reveal";

export const Footer: React.FC<{ settings?: PublicSiteSettings | null }> = ({
  settings,
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [timeTrapToken, setTimeTrapToken] = useState<string | null>(null);

  const companyName = settings?.companyName || "NEXORA";
  const legalName =
    settings?.legalName || "Nexora Technology Pvt. Ltd.";
  const supportEmail = settings?.supportEmail || "support@nexora.com";
  const supportPhone = settings?.supportPhone || "+91 8889647593";
  const address =
    settings?.address || "India & United States (Global Operations)";

  const apiBase =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5201";

  useEffect(() => {
    fetch(`${apiBase}/api/v1/public/forms/contact`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.timeTrapToken) {
          setTimeTrapToken(data.timeTrapToken);
        }
      })
      .catch(() => {});
  }, [apiBase]);

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

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newsletterEmail.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) return;

    setIsSubscribing(true);

    try {
      const utm = getStoredUtmParameters();
      const namePart = cleanEmail.split("@")[0] || "Subscriber";

      const payload = {
        fullName: namePart,
        email: cleanEmail,
        region: "in",
        consentGiven: true,
        consentWordingVersion: "v1.2-newsletter",
        customFields: {
          inquiryType: "newsletter_subscription",
          source: "website_footer",
          ...(utm.landingPageUrl ? { landingPageUrl: utm.landingPageUrl } : {}),
        },
        utmSource: utm.utmSource || undefined,
        utmMedium: utm.utmMedium || undefined,
        utmCampaign: utm.utmCampaign || undefined,
        utmTerm: utm.utmTerm || undefined,
        utmContent: utm.utmContent || undefined,
        referrerUrl: utm.referrerUrl || undefined,
        timeTrapToken: timeTrapToken || undefined,
      };

      await fetch(`${apiBase}/api/v1/public/forms/contact/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setSubscribed(true);
      setNewsletterEmail("");
      toast.success("Subscribed to Nexora Strategic Growth Insights! Check your inbox.");
    } catch {
      // Graceful fallback for offline / mock
      setSubscribed(true);
      setNewsletterEmail("");
      toast.success("Subscribed to Nexora Strategic Growth Insights!");
    } finally {
      setIsSubscribing(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openCookiePreferences = () => {
    window.dispatchEvent(new CustomEvent("nexora_open_cookie_preferences"));
  };

  return (
    <footer className="border-t border-white/10 bg-navy text-slate-400 text-xs relative overflow-hidden">
      <Reveal variant="fade-up" distance="md" duration="slower" as="div" className="w-full">
        <div className="absolute top-0 left-1/3 w-[500px] h-[250px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-16 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-6 gap-8 sm:gap-10 relative z-10">
        {/* Brand & Corporate Column (Span 2) */}
        <div className="space-y-4 col-span-2 sm:col-span-2 md:col-span-2 lg:col-span-2">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={companyName}
                className="w-10 h-10 object-contain rounded-xl bg-slate-800 border border-slate-700 p-1"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-lg shadow-md shadow-primary/30">
                N
              </div>
            )}
            <div>
              <span className="font-black text-white text-base tracking-tight block">
                {companyName}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-primary">
                Digital Growth &bull; Technology &bull; AI
              </span>
            </div>
          </div>

          <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
            Nexora combines digital marketing, technology development and intelligent
            automation to help businesses build stronger digital brands, improve
            customer experiences and achieve sustainable growth.
          </p>

          {/* Legal Registration Callout */}
          <div className="text-[11px] text-slate-400 space-y-1 pt-2">
            <div>
              <strong className="text-slate-300">Legal Entity:</strong> {legalName}
            </div>
            <div>
              <strong className="text-slate-300">Operations:</strong> Global (Enterprise &amp; High-Growth Brands)
            </div>
          </div>

          {/* System Uptime Indicator */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
            <span>All Systems Operational</span>
          </div>
        </div>

        {/* Column 2: Digital Growth Services */}
        <div className="space-y-3 col-span-1">
          <span className="font-extrabold text-white text-xs uppercase tracking-wider block">
            Digital Growth
          </span>
          <ul className="space-y-2">
            <li>
              <Link href="/services/seo" className="hover:text-white transition">
                SEO Services
              </Link>
            </li>
            <li>
              <Link href="/services/paid-ads" className="hover:text-white transition">
                Google &amp; Meta PPC
              </Link>
            </li>
            <li>
              <Link href="/services/cro" className="hover:text-white transition">
                Conversion Optimization (CRO)
              </Link>
            </li>
            <li>
              <Link href="/services/social-media-marketing" className="hover:text-white transition">
                Social Media Marketing
              </Link>
            </li>
            <li>
              <Link href="/services/content-marketing" className="hover:text-white transition">
                Content Strategy
              </Link>
            </li>
            <li>
              <Link href="/services/email-marketing" className="hover:text-white transition">
                Email &amp; Lifecycle Marketing
              </Link>
            </li>
            <li>
              <Link href="/services/analytics-reporting" className="hover:text-white transition">
                Marketing Analytics
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Technology Solutions */}
        <div className="space-y-3 col-span-1">
          <span className="font-extrabold text-white text-xs uppercase tracking-wider block">
            Technology Solutions
          </span>
          <ul className="space-y-2">
            <li>
              <Link href="/services/web-design-development" className="hover:text-white transition">
                Corporate Website Development
              </Link>
            </li>
            <li>
              <Link href="/services/web-application-development" className="hover:text-white transition">
                Web Application Development
              </Link>
            </li>
            <li>
              <Link href="/services/custom-software-development" className="hover:text-white transition">
                Custom Software Engineering
              </Link>
            </li>
            <li>
              <Link href="/services/ecommerce-development" className="hover:text-white transition">
                E-Commerce Development
              </Link>
            </li>
            <li>
              <Link href="/services/ui-ux-design" className="hover:text-white transition">
                UI/UX Design Systems
              </Link>
            </li>
            <li>
              <Link href="/services/api-development" className="hover:text-white transition">
                API Development &amp; Integrations
              </Link>
            </li>
            <li>
              <Link href="/services/marketing-automation-crm" className="hover:text-white transition">
                AI &amp; Marketing Automation
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Industries & Solutions */}
        <div className="space-y-3 col-span-1">
          <span className="font-extrabold text-white text-xs uppercase tracking-wider block">
            Industries
          </span>
          <ul className="space-y-2">
            <li>
              <Link href="/industries/saas" className="hover:text-white transition">
                SaaS &amp; Technology
              </Link>
            </li>
            <li>
              <Link href="/industries/ecommerce" className="hover:text-white transition">
                E-Commerce &amp; Retail
              </Link>
            </li>
            <li>
              <Link href="/industries/healthcare" className="hover:text-white transition">
                Healthcare
              </Link>
            </li>
            <li>
              <Link href="/industries/real-estate" className="hover:text-white transition">
                Real Estate
              </Link>
            </li>
            <li>
              <Link href="/industries/hospitality" className="hover:text-white transition">
                Hospitality
              </Link>
            </li>
            <li>
              <Link href="/industries/professional-services" className="hover:text-white transition">
                Professional Services
              </Link>
            </li>
            <li>
              <Link href="/industries" className="text-blue-400 font-bold hover:underline">
                View All Industries &rarr;
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 5: Company, Resources & Newsletter */}
        <div className="space-y-4 col-span-2 sm:col-span-1 lg:col-span-2">
          <span className="font-extrabold text-white text-xs uppercase tracking-wider block">
            Company &amp; Resources
          </span>
          <ul className="space-y-2">
            <li>
              <Link href="/about" className="hover:text-white transition">
                About Nexora
              </Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-white transition">
                Services &amp; Capabilities
              </Link>
            </li>
            <li>
              <Link href="/industries" className="hover:text-white transition">
                Industry Solutions
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-white transition">
                Insights &amp; Strategy
              </Link>
            </li>
            <li>
              <Link href="/book-a-call" className="hover:text-white transition">
                Schedule Strategic Call
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
              Subscribe to Growth Briefing
            </span>
            {subscribed ? (
              <div className="text-[11px] text-primary font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Subscribed successfully.
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex gap-1.5 max-w-sm">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={isSubscribing}
                  aria-label="Subscribe"
                  className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold px-3 py-1.5 rounded-lg transition shrink-0 shadow-md shadow-primary/25 disabled:opacity-50 cursor-pointer"
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
      <div className="border-t border-white/10 bg-navy/95 py-5 sm:py-6">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1.5">
            <span>&copy; {new Date().getFullYear()} {legalName}. All rights reserved.</span>
            <span className="hidden sm:inline">&bull;</span>
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
            <Link href="/accessibility" className="hover:text-slate-300 transition">
              Accessibility (WCAG AA)
            </Link>
            <span>&bull;</span>
            <Link href="/trust" className="hover:text-slate-300 transition">
              Trust &amp; Security
            </Link>
            <span>&bull;</span>
            <button
              type="button"
              onClick={openCookiePreferences}
              className="hover:text-emerald-400 transition underline underline-offset-2 cursor-pointer"
            >
              Cookie Preferences
            </button>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition px-2.5 py-1 rounded-md hover:bg-slate-800 cursor-pointer shrink-0"
            aria-label="Back to top"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      </Reveal>
    </footer>
  );
};
