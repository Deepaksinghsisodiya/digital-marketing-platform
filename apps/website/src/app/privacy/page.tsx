import { resolveRegion } from "@/config/region";
import { getPublicSiteSettings, getPublicMenu } from "@/lib/cms";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Privacy Policy — Nexora",
  description:
    "Nexora's commitment to data privacy, DPDP Act 2023 compliance, GDPR, and enterprise data governance.",
};

export default async function PrivacyPolicyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-500">
              Last Updated: November 2026 &bull; Compliant with Digital Personal Data Protection Act 2023 (India) &amp; GDPR / CCPA
            </p>
          </div>

          <div className="prose prose-slate max-w-none text-sm leading-relaxed space-y-8">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">1. Overview & Commitment</h2>
              <p className="text-slate-600">
                Nexora Digital Marketing Platform (&ldquo;Nexora&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) operates in strict adherence to data privacy standards. This policy governs how we collect, process, store, and safeguard corporate and personal information captured via our public website, consultation forms, and client services.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">2. Data We Collect</h2>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li><strong>Identity & Contact Information:</strong> Full name, corporate email address, international phone number, job role, and company name provided voluntarily during lead inquiries.</li>
                <li><strong>Technical & Telemetry Data:</strong> IP address, browser type, referral URLs, region cookies (<code>nexora_region</code>), and UTM attribution tags.</li>
                <li><strong>Consent Records:</strong> Cryptographic timestamps and purpose identifiers recorded upon form submission.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">3. Purpose of Processing</h2>
              <p className="text-slate-600">
                We process your information solely to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>Evaluate project feasibility and compute lead scoring diagnostics.</li>
                <li>Schedule and conduct executive growth strategy sessions.</li>
                <li>Fulfill contractual SLAs, client account onboarding, and transactional communications.</li>
                <li>Maintain immutable security audit logs to protect against fraudulent activities and unauthorized bot submissions.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">4. Data Subject Rights (DPDP Act 2023 & GDPR)</h2>
              <p className="text-slate-600">
                You possess the statutory right to request access, correction, summary, or permanent erasure of your personal data stored within our systems. To exercise these rights, submit a formal request to our Data Protection Officer at <code>privacy@nexora.local</code>.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">5. Data Retention & Security</h2>
              <p className="text-slate-600">
                Personal data is stored in enterprise-grade, encrypted databases with append-only tamper-proof audit trails. Lead records that remain inactive for more than 24 months are routinely pruned in accordance with our data retention schedule.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer settings={siteSettings} />
    </div>
  );
}
