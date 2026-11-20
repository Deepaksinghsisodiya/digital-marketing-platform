import { resolveRegion } from "@/config/region";
import { getPublicSiteSettings, getPublicMenu } from "@/lib/cms";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Terms of Service — Nexora",
  description:
    "Terms and conditions governing the use of Nexora's enterprise digital marketing platform and professional services.",
};

export default async function TermsPage() {
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

      <main className="flex-1 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Legal & Compliance
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Terms of Service
            </h1>
            <p className="text-xs text-slate-500">
              Last Updated: November 2026 &bull; Master Services Agreement Guidelines
            </p>
          </div>

          <div className="prose prose-slate max-w-none text-sm leading-relaxed space-y-8">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">1. Acceptance of Terms</h2>
              <p className="text-slate-600">
                By accessing this portal, booking strategic consultations, or engaging in commercial partnerships with Nexora, you agree to comply with and be bound by these Terms of Service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">2. Professional Agency Retainers</h2>
              <p className="text-slate-600">
                All client engagements are governed by formal Statement of Work (SOW) documents outlining specific deliverables, milestone SLAs, performance attribution boundaries, and fee schedules. Inbound quotes or proposal simulators do not constitute a legally binding offer until executed by both parties.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">3. Intellectual Property Rights</h2>
              <p className="text-slate-600">
                Upon full payment of applicable service fees, clients retain exclusive intellectual property ownership of custom creative assets, copywriting, and proprietary landing pages developed under contract. Nexora retains proprietary rights to its core platform engines, design token compilers, and pre-built minimal API microservices.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">4. Limitation of Liability</h2>
              <p className="text-slate-600">
                Nexora provides search engine optimization, paid media advertising, and conversion engineering in accordance with prevailing industry best practices. While our methodologies are designed to maximize acquisition probability, external third-party algorithm updates (e.g. Google Search core updates, Meta auction volatility) remain beyond our unilateral control.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer settings={siteSettings} />
    </div>
  );
}
