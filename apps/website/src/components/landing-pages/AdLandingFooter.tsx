import React from "react";
import Link from "next/link";
import { siteConfig, isRealValue } from "@/content/site.config";
import { ShieldCheck, Lock } from "lucide-react";

interface AdLandingFooterProps {
  platform?: "google" | "meta" | "ppc";
}

export function AdLandingFooter({ platform = "google" }: AdLandingFooterProps) {
  const currentYear = new Date().getFullYear();
  const legalName = isRealValue(siteConfig.company.legalName)
    ? siteConfig.company.legalName
    : "Nexora Digital Marketing";

  return (
    <footer className="w-full border-t border-slate-200 bg-slate-50 text-slate-600 text-xs py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Compliance Disclaimer */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 text-[11px] leading-relaxed text-slate-500">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-slate-700">Advertising & Regulatory Disclaimer:</span>
              {platform === "google" && (
                <p>
                  Google and the Google Ads logo are trademarks of Google LLC. Nexora is an independent performance marketing agency and is not an employee, agent, or partner of Google LLC unless expressly certified through the Google Partners directory. All campaign results, case studies, and projections discussed on this page reflect individual client performance under specific market conditions; past results do not guarantee future ad performance.
                </p>
              )}
              {platform === "meta" && (
                <p>
                  This site is not a part of the Facebook or Instagram website or Meta Platforms, Inc. Additionally, this site is NOT endorsed by Meta in any way. FACEBOOK and INSTAGRAM are trademarks of META PLATFORMS, INC. Nexora provides independent media buying, creative production, and performance marketing services.
                </p>
              )}
              {platform === "ppc" && (
                <p>
                  All brand names, trademarks, and registered trademarks mentioned are property of their respective owners. Nexora is an independent digital marketing agency. Results vary based on industry, budget, historical account history, and market demand.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom row: Privacy links, SSL trust, copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 text-slate-500 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit SSL Encrypted. Your data is never sold or shared.</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <Link
              href="/privacy"
              target="_blank"
              className="hover:text-slate-900 transition underline underline-offset-2"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              target="_blank"
              className="hover:text-slate-900 transition underline underline-offset-2"
            >
              Terms of Service
            </Link>
            <Link
              href="/cookies"
              target="_blank"
              className="hover:text-slate-900 transition underline underline-offset-2"
            >
              Cookie Policy
            </Link>
          </div>

          <div>
            &copy; {currentYear} {legalName}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
