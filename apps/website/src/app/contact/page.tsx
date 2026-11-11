import { cookies } from "next/headers";
import { REGION_CONFIG, resolveRegion } from "../../config/region";
import { getPublicSiteSettings } from "../../lib/cms";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { ContactForm } from "../../components/forms/ContactForm";
import type { Metadata } from "next";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Building2,
  Mail,
  Phone,
  Globe2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Executive Consultation & Discovery — Nexora",
  description:
    "Schedule an institutional discovery session with our digital marketing architects. Multi-country routing across India and global markets.",
};

export default async function ContactPage() {
  const cookieStore = await cookies();
  const currentRegionCode = cookieStore.get(REGION_CONFIG.cookieName)?.value;
  const region = resolveRegion(currentRegionCode);
  const siteSettings = await getPublicSiteSettings();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900">
      <Header settings={siteSettings} currentRegionCode={region.code} />

      <main className="flex-1 py-16 sm:py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column: Enterprise Value Proposition & Trust */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Confidential Advisory</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                  Accelerate Your Pipeline Velocity.
                </h1>
                <p className="mt-4 text-slate-600 text-base leading-relaxed">
                  Connect directly with our senior growth architects for a diagnostic on your full-funnel attribution, search dominance, and multi-region conversion mechanics.
                </p>
              </div>

              {/* Guarantees Strip */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">4-Hour SLA Response</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Dedicated enterprise account directors evaluate every submission promptly.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 flex-shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Zero-Compromise Compliance</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Fully compliant with Digital Personal Data Protection (DPDP) Act 2023 & GDPR standards.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600 flex-shrink-0">
                    <Globe2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Cross-Border Execution</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Dual-entity operations spanning India (Bengaluru) and North America (San Francisco).
                    </p>
                  </div>
                </div>
              </div>

              {/* Testimonial Quote */}
              <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4">
                <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                  &ldquo;Nexora restructured our commercial demand generation architecture across both US and India markets within 3 weeks. Pipeline predictability increased 340%.&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-black text-xs">
                    AC
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">Ananya Rao</div>
                    <div className="text-[11px] text-slate-400">Head of Global Demand &bull; Apex Cloud Solutions</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: The Form */}
            <div className="lg:col-span-7">
              <ContactForm initialRegion={region.code} />
            </div>
          </div>
        </div>
      </main>

      <Footer settings={siteSettings} />
    </div>
  );
}
