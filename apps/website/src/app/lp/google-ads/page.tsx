import React from "react";
import type { Metadata } from "next";
import { AdLandingHeader } from "@/components/landing-pages/AdLandingHeader";
import { AdLandingFooter } from "@/components/landing-pages/AdLandingFooter";
import { PPCLeadForm } from "@/components/landing-pages/PPCLeadForm";
import {
  Search,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Target,
  BarChart3,
  CheckCircle2,
  FileSearch,
  Layers,
  ArrowRight,
  PhoneCall,
  Clock,
  Zap,
} from "lucide-react";
import { siteConfig, isRealValue } from "@/content/site.config";

export const metadata: Metadata = {
  title: "Google Ads Management & Performance PPC Agency | Nexora",
  description:
    "Stop wasting ad spend on low-intent search terms. Get predictable inbound leads and scalable e-commerce sales from Google Ads. Claim your free 48-hour account audit.",
  robots: {
    index: false, // Prevents organic search cannibalization; dedicated strictly to PPC traffic
    follow: false,
  },
};

const WASTE_VECTORS = [
  {
    title: "Broad Match Keyword Traps",
    description:
      "Google pushes broad match to maximize spend. Without aggressive negative keywords, 30% to 50% of your budget goes to irrelevant searches.",
    stat: "Up to 45% wasted",
  },
  {
    title: "Sending Traffic to the Homepage",
    description:
      "Homepages have 10+ competing links and convert at under 3%. Dedicated, laser-focused landing pages convert at 12% to 25%.",
    stat: "3x to 5x lower CPL",
  },
  {
    title: "Low Quality Score Penalties",
    description:
      "Google secretly charges up to 400% more per click if your ad copy and landing page don't tightly mirror the user's exact search intent.",
    stat: "Cut CPCs by 20–40%",
  },
  {
    title: "Vanity Clicks Over Lead Quality",
    description:
      "Getting cheap clicks means nothing if sales reps spend all day calling invalid numbers, tire-kickers, and low-budget unqualified leads.",
    stat: "Verified offline pipeline",
  },
];

const AUDIT_INCLUSIONS = [
  {
    title: "Search Term Waste Teardown",
    description:
      "We inspect your exact search query reports to identify the exact keywords that drained your budget without generating a single phone call or sale.",
  },
  {
    title: "Quality Score & CPC Penalty Check",
    description:
      "We check each ad group's expected CTR, ad relevance, and landing page experience scores to identify where you're overpaying Google.",
  },
  {
    title: "Competitor Impression Share Gap",
    description:
      "See which competitors are outbidding you on high-intent transactional queries and where they are losing impression share due to low budget.",
  },
  {
    title: "90-Day Campaign Restructure Roadmap",
    description:
      "A concrete, step-by-step gameplan showing how we would restructure your campaigns, fix conversion tracking, and scale monthly lead volume.",
  },
];

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Forensic Account Audit & Waste Elimination",
    description:
      "We comb through your search query logs, apply extensive negative keyword lists, pause bleeding ad groups, and stop budget leakage immediately.",
  },
  {
    step: "02",
    title: "Custom High-Converting Landing Funnels",
    description:
      "We don't send paid traffic to generic site pages. We build lightweight, distraction-free landing pages engineered specifically for high conversion rates.",
  },
  {
    step: "03",
    title: "Single-Theme Ad Groups & Smart Bidding",
    description:
      "We organize keywords into tightly themed ad clusters, test responsive search ads weekly, and calibrate automated bidding to your actual target CPA.",
  },
  {
    step: "04",
    title: "True Revenue Attribution & Scaling",
    description:
      "We pass offline conversion data and lead statuses back into Google Ads so the algorithm optimizes for actual closed deals, not just form fills.",
  },
];

const FAQS = [
  {
    q: "Do you require long-term contracts?",
    a: "No. We work on a transparent 30-day rolling agreement. We earn your business every month through performance, transparent reporting, and consistent lead volume.",
  },
  {
    q: "Who owns the Google Ads account and campaign data?",
    a: "You do — 100%. We work directly inside your existing Google Ads account or build one under your company's billing profile. You retain full ownership, admin access, and historical data forever.",
  },
  {
    q: "What is the minimum monthly ad budget you manage?",
    a: "We work best with companies investing at least ₹40,000 to ₹1,00,000+ per month (or $1,000+ for US/international clients). This ensures enough click volume to statistically optimize bidding and test landing pages.",
  },
  {
    q: "How quickly will we see measurable results?",
    a: "Negative keyword cleanup and budget reallocation stop wasted spend within the first 48 to 72 hours. Significant improvements in Cost Per Lead (CPL) typically materialize within 14 to 21 days as new landing pages launch.",
  },
];

export default function GoogleAdsLandingPage() {
  const phone = isRealValue(siteConfig.contact.phone)
    ? siteConfig.contact.phone
    : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-emerald-500 selection:text-white" id="top">
      {/* Distraction-Free Header */}
      <AdLandingHeader campaignBadge="Google Ads Performance Agency" />

      <main className="flex-1">
        {/* ========================================================
            HERO SECTION: High-impact hook + Above-The-Fold Form
           ======================================================== */}
        <section className="relative overflow-hidden bg-white border-b border-slate-200/80 pt-10 pb-16 sm:py-20 lg:py-24">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Left Column: Outcome Copy */}
              <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold shadow-xs">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <span>Google Ads Campaign Management & Optimization</span>
                </div>

                <div className="space-y-4">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
                    Stop Burning Ad Spend on Low-Intent Clicks.{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                      Get Predictable Leads & Sales
                    </span>{" "}
                    from Google Ads.
                  </h1>

                  <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl">
                    We eliminate broad-match keyword waste, build custom high-converting landing pages, and optimize your Search & Shopping campaigns for <strong>actual revenue</strong> — not vanity impressions.
                  </p>
                </div>

                {/* Key Bulletproof Guarantees */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm">
                      <strong className="block text-slate-900 font-bold">100% Account Ownership</strong>
                      <span className="text-slate-600">You own the billing, account, and all campaign data forever.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm">
                      <strong className="block text-slate-900 font-bold">No Long-Term Contracts</strong>
                      <span className="text-slate-600">Month-to-month performance retainers. No 12-month lock-in.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm">
                      <strong className="block text-slate-900 font-bold">High-Converting Landing Pages</strong>
                      <span className="text-slate-600">Custom funnels included to maximize conversion rates.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm">
                      <strong className="block text-slate-900 font-bold">Offline Revenue Attribution</strong>
                      <span className="text-slate-600">We optimize for closed deals, not just spam form fills.</span>
                    </div>
                  </div>
                </div>

                {/* Direct Emergency Call Strip */}
                {phone && (
                  <div className="pt-2 flex items-center gap-3 text-xs sm:text-sm text-slate-600">
                    <PhoneCall className="w-4 h-4 text-emerald-600" />
                    <span>Prefer to speak immediately? Call us directly:</span>
                    <a
                      href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                      className="font-bold text-slate-900 hover:text-emerald-600 underline underline-offset-4"
                    >
                      {phone}
                    </a>
                  </div>
                )}
              </div>

              {/* Right Column: High-Impact Lead Form */}
              <div className="lg:col-span-5">
                <PPCLeadForm
                  campaignName="google_ads_lp"
                  defaultService="Google Ads & PPC Management"
                  headline="Get Your Free 48-Hour Google Ads Audit"
                  subheadline="We will audit your campaigns, uncover budget leaks, and provide a 90-day scaling plan."
                  ctaText="Claim Free Google Ads Audit"
                  accentColor="emerald"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            THE PAIN: Where Most Google Ads Budgets Leak
           ======================================================== */}
        <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span>The Truth About Wasted Ad Spend</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                Why 68% of Google Ads Accounts Bleed Money
              </h2>
              <p className="text-sm sm:text-base text-slate-600 font-normal">
                Google makes billions by encouraging settings that drive cheap, unqualified clicks. Here is where your budget is actually leaking:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {WASTE_VECTORS.map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition space-y-3 text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-lg bg-red-50 text-red-600 font-bold flex items-center justify-center text-xs">
                      0{idx + 1}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {item.stat}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            THE AUDIT: What You Get in the Free 48-Hour Audit
           ======================================================== */}
        <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200">
                <FileSearch className="w-3.5 h-3.5 text-emerald-600" />
                <span>Forensic Review</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                What We Uncover in Your Free 48-Hour Audit
              </h2>
              <p className="text-sm sm:text-base text-slate-600 font-normal">
                This is not an automated scanner report. A senior Google Ads strategist manually inspects your search terms, bids, and landing pages:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {AUDIT_INCLUSIONS.map((inc, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition space-y-3 text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{inc.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {inc.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <a
                href="#audit-form"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition shadow-lg shadow-emerald-600/20"
              >
                <span>Request Your Free 48-Hour Audit</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* ========================================================
            THE FRAMEWORK: How Nexora Manages Google Ads
           ======================================================== */}
        <section className="py-16 sm:py-20 bg-slate-900 text-white border-b border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Our 4-Step Performance Engine</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                How We Engineer Profitable Google Campaigns
              </h2>
              <p className="text-sm sm:text-base text-slate-300 font-normal">
                From search term sculpting to post-click conversion rate optimization, every step is designed to drop your CPA:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              {PROCESS_STEPS.map((s, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3 hover:border-emerald-500/50 transition"
                >
                  <div className="text-3xl font-black text-emerald-400 font-mono">
                    {s.step}
                  </div>
                  <h3 className="text-base font-bold text-white">{s.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    {s.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            FAQ SECTION
           ======================================================== */}
        <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-normal">
                Clear, straightforward answers before you hand over any ad budget.
              </p>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, i) => (
                <div
                  key={i}
                  className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
                >
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-start gap-2.5">
                    <span className="text-emerald-600 font-black">Q:</span>
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal pl-6">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            FINAL BOTTOM CONVERSION CTA STRIP
           ======================================================== */}
        <section className="py-16 sm:py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Limited to 5 New Client Audits Per Week</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              Ready to Cut Your Google Ads Waste and Scale Your Pipeline?
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
              Claim your free 48-hour audit today. We will manually inspect your search queries, show you where money is being lost, and present a clear path to lower your CPA.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#audit-form"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm sm:text-base transition shadow-xl shadow-emerald-500/20"
              >
                Claim Your Free Audit Now
              </a>

              {phone && (
                <a
                  href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                  className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base transition border border-white/20 flex items-center justify-center gap-2"
                >
                  <PhoneCall className="w-4 h-4 text-emerald-400" />
                  <span>Call Us: {phone}</span>
                </a>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Compliant Ad Landing Footer */}
      <AdLandingFooter platform="google" />
    </div>
  );
}
