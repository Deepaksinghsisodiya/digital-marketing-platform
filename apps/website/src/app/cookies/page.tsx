import { resolveRegion } from "@/config/region";
import { getPublicSiteSettings, getPublicMenu } from "@/lib/cms";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Cookie Policy — Nexora",
  description:
    "Explanation of cookie usage, consent management, and regional privacy preferences on the Nexora platform.",
};

export default async function CookiePolicyPage() {
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
              Cookie Policy
            </h1>
            <p className="text-xs text-slate-500">
              Last Updated: November 2026 &bull; Strict Consent-Gated Architecture
            </p>
          </div>

          <div className="prose prose-slate max-w-none text-sm leading-relaxed space-y-8">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">1. How We Use Cookies</h2>
              <p className="text-slate-600">
                Nexora employs cookies and browser storage technologies to maintain secure sessions, remember your regional preferences (e.g. India vs United States), and track anonymous marketing attribution.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">2. Types of Cookies We Deploy</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm">Essential &amp; Security Cookies</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Mandatory for core site operation, CSRF protection (<code>XSRF-TOKEN</code>), and region resolution (<code>nexora_region</code>). Cannot be disabled.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm">Analytics &amp; Performance Cookies</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Google Analytics 4 and Clarity telemetry used to assess page load velocity and interaction drop-offs. Deployed strictly after explicit visitor consent.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm">Marketing &amp; Attribution Cookies</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Meta Pixel and LinkedIn Insight Tags used to measure conversion ROI on commercial ad campaigns.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">3. Managing Your Preferences</h2>
              <p className="text-slate-600">
                You can revisit or update your consent preferences at any time by clearing your browser cookies or clicking the &ldquo;Cookie Preferences&rdquo; link situated in the website footer.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer settings={siteSettings} />
    </div>
  );
}
