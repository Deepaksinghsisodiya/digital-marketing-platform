import { resolveRegion } from "@/config/region";
import { getPublicSiteSettings, getPublicMenu } from "@/lib/cms";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ContactForm } from "@/components/forms/ContactForm";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ShieldCheck, Zap, Search, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Request Free Enterprise Growth Diagnostic — Nexora",
  description:
    "Claim a comprehensive 20-point digital marketing, technical SEO, and conversion audit tailored for your enterprise domain.",
};

const AUDIT_POINTS = [
  "Core Web Vitals & technical infrastructure bottlenecks",
  "High-intent commercial search keyword gap analysis",
  "Google & Meta ad account spend leakage review",
  "Landing page conversion friction and drop-off milestones",
  "Full-funnel attribution and measurement accuracy",
  "Tailored 90-day pipeline roadmap with ROI projections",
];

export default async function FreeAuditPage() {
  const region = resolveRegion();

  const [siteSettings, headerMenu] = await Promise.all([
    getPublicSiteSettings(),
    getPublicMenu("header", region.code),
  ]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-slate-900">
      <Header
        settings={siteSettings}
        currentRegionCode={region.code}
        menu={headerMenu}
      />

      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Context */}
            <div className="lg:col-span-5 space-y-6">
              <Badge variant="accent">Complimentary Growth Diagnostic</Badge>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Unlock Your Hidden Enterprise Pipeline
              </h1>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Our growth architects audit your website, technical architecture, and ad accounts to uncover conversion leaks and high-intent acquisition opportunities.
              </p>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  What You Receive (Within 48 Hours):
                </span>
                <ul className="space-y-3">
                  {AUDIT_POINTS.map((pt) => (
                    <li key={pt} className="flex items-start gap-2.5 text-xs text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs text-slate-700 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                <span>100% confidential. No credit card required. Zero obligation.</span>
              </div>
            </div>

            {/* Right Column: Intake Form */}
            <div className="lg:col-span-7">
              <ContactForm
                inquiryType="free_marketing_audit"
                heading="Request Your Diagnostic Report"
                subheading="Provide your website URL and contact details. Our senior growth architects will generate and deliver your 20-point diagnostic within 48 hours."
                ctaText="Claim Free 20-Point Audit Report"
                websiteUrlField={true}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer settings={siteSettings} />
    </div>
  );
}
