import { resolveRegion } from "@/config/region";
import { getPublicSiteSettings, getPublicMenu } from "@/lib/cms";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Accessibility Statement — Nexora",
  description:
    "Nexora's commitment to digital accessibility, WCAG 2.2 Level AA compliance, and inclusive design standards.",
};

export default async function AccessibilityPage() {
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
              Standards &amp; Inclusion
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Accessibility Statement
            </h1>
            <p className="text-xs text-slate-500">
              Conforming to Web Content Accessibility Guidelines (WCAG) 2.2 Level AA
            </p>
          </div>

          <div className="prose prose-slate max-w-none text-sm leading-relaxed space-y-8">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">1. Our Commitment</h2>
              <p className="text-slate-600">
                Nexora is committed to ensuring digital accessibility for people of all abilities. We continually audit and optimize the user experience across all digital properties in compliance with WCAG 2.2 Level AA standards.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">2. Technical Measures Implemented</h2>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li><strong>Contrast Compliance:</strong> All text tokens achieve a minimum contrast ratio of 4.5:1 against respective backdrops, verified by automated design-token checks.</li>
                <li><strong>Keyboard Navigation:</strong> Complete navigation and interactive components are operable via keyboard focus rings with visible indicators.</li>
                <li><strong>Reduced Motion Support:</strong> The platform respects <code>prefers-reduced-motion</code> operating system flags, suppressing animations for users with vestibular sensitivities.</li>
                <li><strong>Screen Reader Compatibility:</strong> Form fields feature descriptive aria-labels, error announcements, and semantic HTML5 hierarchy.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">3. Feedback &amp; Assistance</h2>
              <p className="text-slate-600">
                If you encounter any accessibility barriers while browsing our portal, please contact our team at <code>accessibility@nexora.local</code>. We will address the remediation promptly.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer settings={siteSettings} />
    </div>
  );
}
