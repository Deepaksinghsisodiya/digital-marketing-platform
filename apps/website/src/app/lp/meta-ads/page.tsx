import React from "react";
import type { Metadata } from "next";
import { AdLandingHeader } from "@/components/landing-pages/AdLandingHeader";
import { AdLandingFooter } from "@/components/landing-pages/AdLandingFooter";
import { PPCLeadForm } from "@/components/landing-pages/PPCLeadForm";
import {
  Sparkles,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  PlaySquare,
  BarChart3,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight,
  PhoneCall,
  Clock,
  Video,
  Eye,
} from "lucide-react";
import { siteConfig, isRealValue } from "@/content/site.config";

export const metadata: Metadata = {
  title: "Meta Ads (Facebook & Instagram) Growth Agency | Nexora",
  description:
    "Turn Meta Ads into a predictable revenue machine. High-converting direct-response creatives, server-side Conversions API (CAPI), and scalable Instagram & Facebook funnels.",
  robots: {
    index: false,
    follow: false,
  },
};

const META_PITFALLS = [
  {
    title: "Creative Fatigue in Under 14 Days",
    description:
      "Audiences on Instagram scroll fast. When frequency hits 2.5+, your CPMs spike and ROAS plummets. Most brands don't have the bandwidth to produce new angles weekly.",
    stat: "CPMs double after fatigue",
  },
  {
    title: "Browser-Only Pixel Signal Loss",
    description:
      "Since iOS 14.5 and Safari ITP, 30% to 40% of browser events are blocked. Without server-side Meta Conversions API (CAPI), Meta's algorithm is flying half-blind.",
    stat: "Lose 30%+ purchase signals",
  },
  {
    title: "Sending Mobile Shoppers to Heavy Homepages",
    description:
      "Mobile visitors demand sub-2-second load times and one-thumb checkout. Dumping ad clicks on bloated multi-category pages cuts conversions in half.",
    stat: "60% mobile bounce rate",
  },
  {
    title: "Vanity Engagement Over Closed Revenue",
    description:
      "Chasing cheap video views and post likes does not pay payroll. We optimize exclusively for verified purchases, qualified bookings, and high-LTV buyers.",
    stat: "High-AOV customer focus",
  },
];

const META_PLAYBOOK = [
  {
    icon: Video,
    title: "Direct-Response Creative Engine",
    description:
      "We script, design, and edit high-performing video hooks, UGC-style product demos, and comparison carousels engineered specifically to stop the thumb scroll.",
  },
  {
    icon: Cpu,
    title: "Server-Side Conversions API (CAPI)",
    description:
      "We configure server-side tracking with Event Match Quality (EMQ) scores of 8.0+, giving Meta's algorithm the full data feed it needs to find your best buyers.",
  },
  {
    icon: Eye,
    title: "Advantage+ & Broad Targeting Architecture",
    description:
      "We eliminate audience overlap, consolidate fragmented ad sets, and harness Meta's machine learning to scale spend without audience exhaustion.",
  },
  {
    icon: BarChart3,
    title: "Dynamic Retargeting & LTV Funnels",
    description:
      "We build customized post-view retargeting sequences that handle objections, showcase customer reviews, and recover abandoned carts profitably.",
  },
];

const AUDIT_DELIVERABLES = [
  {
    title: "Creative Frequency & Fatigue Audit",
    description:
      "We review your active ads, calculate hook-retention rates, and identify exactly which ad sets are burning out your target audience.",
  },
  {
    title: "Conversions API (CAPI) Signal Diagnostic",
    description:
      "We inspect your Meta Event Manager to check for event deduplication, server match rates, and missing revenue value parameters.",
  },
  {
    title: "Placement & Audience Overlap Analysis",
    description:
      "Find out if your campaigns are competing against each other in internal auctions, artificially driving up your own CPMs.",
  },
  {
    title: "3 Custom Creative Angle Concepts",
    description:
      "We deliver 3 direct-response creative briefs (hooks + scripts) tailored specifically to your product or service to test immediately.",
  },
];

const META_FAQS = [
  {
    q: "Do you produce the ad creatives or do we need to supply them?",
    a: "We do both! We write the direct-response scripts, storyboard angles, and produce motion graphics, static carousels, and edited video assets. If you have existing raw footage, customer testimonials, or product unboxings, we edit them into high-converting ad variations.",
  },
  {
    q: "How do you handle iOS 14+ tracking and data loss?",
    a: "We implement Meta's Conversions API (CAPI) on your server. This bypasses ad-blockers and browser privacy restrictions by sending purchase and lead events directly from the server to Meta with encrypted customer parameters (email, phone, IP), achieving an Event Match Quality score above 8.0.",
  },
  {
    q: "Who owns the Meta Business Manager and Ad Accounts?",
    a: "You retain 100% legal ownership of your Meta Business Manager, ad accounts, pixel data, custom audiences, and credit card billing. You grant us Partner Access, which you can modify or revoke at any time.",
  },
  {
    q: "What is the recommended minimum ad budget for Meta?",
    a: "We recommend a minimum monthly Meta ad spend of ₹40,000 to ₹1,00,000+ (or $1,000+ for international accounts). Meta's machine learning requires approximately 50 conversion events per ad set per week to exit the learning phase and stabilize performance.",
  },
];

export default function MetaAdsLandingPage() {
  const phone = isRealValue(siteConfig.contact.phone)
    ? siteConfig.contact.phone
    : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-indigo-500 selection:text-white" id="top">
      {/* Distraction-Free Header */}
      <AdLandingHeader campaignBadge="Meta Ads Growth Partner" />

      <main className="flex-1">
        {/* ========================================================
            HERO SECTION: High-impact hook + Above-The-Fold Form
           ======================================================== */}
        <section className="relative overflow-hidden bg-white border-b border-slate-200/80 pt-10 pb-16 sm:py-20 lg:py-24">
          {/* Subtle gradient pattern */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Left Column: Outcome Copy */}
              <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs sm:text-sm font-bold shadow-xs">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Meta (Facebook & Instagram) Direct-Response Management</span>
                </div>

                <div className="space-y-4">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
                    Turn Meta Ads into a Predictable Revenue Machine.{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                      Not Just Empty Likes.
                    </span>
                  </h1>

                  <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl">
                    High-converting direct-response creatives, server-side Conversions API (CAPI) tracking, and precision scaling funnels across Instagram & Facebook that scale your ROAS.
                  </p>
                </div>

                {/* Key Bulletproof Guarantees */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm">
                      <strong className="block text-slate-900 font-bold">Direct-Response Creative Lab</strong>
                      <span className="text-slate-600">Weekly creative testing with hooks, UGC, and motion graphics.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm">
                      <strong className="block text-slate-900 font-bold">Server-Side CAPI Tracking</strong>
                      <span className="text-slate-600">Bypasses iOS tracking blocks with EMQ 8.0+ server signals.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm">
                      <strong className="block text-slate-900 font-bold">100% Account Ownership</strong>
                      <span className="text-slate-600">You retain full admin rights to your Business Manager & Pixel.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm">
                      <strong className="block text-slate-900 font-bold">No 12-Month Lock-In</strong>
                      <span className="text-slate-600">Month-to-month retainers backed by verifiable performance.</span>
                    </div>
                  </div>
                </div>

                {/* Direct Emergency Call Strip */}
                {phone && (
                  <div className="pt-2 flex items-center gap-3 text-xs sm:text-sm text-slate-600">
                    <PhoneCall className="w-4 h-4 text-indigo-600" />
                    <span>Prefer to speak with a strategist immediately?</span>
                    <a
                      href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                      className="font-bold text-slate-900 hover:text-indigo-600 underline underline-offset-4"
                    >
                      {phone}
                    </a>
                  </div>
                )}
              </div>

              {/* Right Column: High-Impact Lead Form */}
              <div className="lg:col-span-5">
                <PPCLeadForm
                  campaignName="meta_ads_lp"
                  defaultService="Meta Ads (Facebook & Instagram)"
                  headline="Get Your Free Meta Account & Creative Audit"
                  subheadline="We will analyze your ad fatigue, check your CAPI tracking, and deliver 3 new creative hooks."
                  ctaText="Claim Free Meta Ads Audit"
                  accentColor="indigo"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            THE PAIN: Why Most Meta Ad Campaigns Burn Out
           ======================================================== */}
        <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span>The Common Meta Pitfalls</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                Why Most Brands Hit a Ceiling on Facebook & Instagram
              </h2>
              <p className="text-sm sm:text-base text-slate-600 font-normal">
                If your CPA keeps rising every time you increase your ad budget, you are likely suffering from one of these 4 structural flaws:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {META_PITFALLS.map((item, idx) => (
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
            THE PLAYBOOK: The Nexora Meta Scaling Framework
           ======================================================== */}
        <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-900 text-xs font-bold uppercase tracking-wider border border-indigo-200">
                <PlaySquare className="w-3.5 h-3.5 text-indigo-600" />
                <span>The Nexora Difference</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                Our 4 Pillars for Predictable Meta ROAS
              </h2>
              <p className="text-sm sm:text-base text-slate-600 font-normal">
                We combine rapid direct-response creative iteration with server-side telemetry:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {META_PLAYBOOK.map((item, i) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={i}
                    className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition space-y-3 text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                      <IconComponent className="w-5 h-5 text-indigo-700" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 text-center">
              <a
                href="#audit-form"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/20"
              >
                <span>Request Your Free Meta Audit</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* ========================================================
            WHAT YOU GET IN THE AUDIT
           ======================================================== */}
        <section className="py-16 sm:py-20 bg-slate-900 text-white border-b border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider border border-indigo-500/20">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Zero Obligation</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                What We Analyze in Your Free Meta Audit
              </h2>
              <p className="text-sm sm:text-base text-slate-300 font-normal">
                Our media buyers and creative directors inspect your account and deliver a clear diagnosis within 48 hours:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              {AUDIT_DELIVERABLES.map((del, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3 hover:border-indigo-500/50 transition"
                >
                  <div className="text-3xl font-black text-indigo-400 font-mono">
                    0{idx + 1}
                  </div>
                  <h3 className="text-base font-bold text-white">{del.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    {del.description}
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
                Frequently Asked Questions About Meta Ads
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-normal">
                Straightforward answers to the most common questions our clients ask.
              </p>
            </div>

            <div className="space-y-4">
              {META_FAQS.map((faq, i) => (
                <div
                  key={i}
                  className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
                >
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-start gap-2.5">
                    <span className="text-indigo-600 font-black">Q:</span>
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
        <section className="py-16 sm:py-20 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider border border-indigo-500/20">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Limited Weekly Audit Spots Available</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              Ready to Stop Wasting Money on Meta and Scale Your ROAS?
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
              Claim your free 48-hour account and creative audit today. We will pinpoint your tracking leaks, assess creative fatigue, and give you 3 actionable hooks to test right away.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#audit-form"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-black text-sm sm:text-base transition shadow-xl shadow-indigo-500/20"
              >
                Claim Your Free Meta Audit
              </a>

              {phone && (
                <a
                  href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                  className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base transition border border-white/20 flex items-center justify-center gap-2"
                >
                  <PhoneCall className="w-4 h-4 text-indigo-400" />
                  <span>Call Us: {phone}</span>
                </a>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Compliant Ad Landing Footer */}
      <AdLandingFooter platform="meta" />
    </div>
  );
}
