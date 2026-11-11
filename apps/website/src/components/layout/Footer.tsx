/* eslint-disable @next/next/no-img-element */
import React from "react";
import Link from "next/link";
import type { PublicSiteSettings } from "../../lib/cms";
import { ShieldCheck, Activity, Globe, ArrowUpRight } from "lucide-react";

export const Footer: React.FC<{ settings?: PublicSiteSettings | null }> = ({
  settings,
}) => {
  const companyName = settings?.companyName || "NEXORA";
  const legalName = settings?.legalName || "Nexora Technologies Inc.";
  const supportEmail = settings?.supportEmail || "growth@nexora.digital";
  const supportPhone = settings?.supportPhone || "+1 (800) 555-0199";

  const apiBase =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5201";

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

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 text-xs">
      <div className="max-w-[1720px] 2xl:max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-16 grid grid-cols-1 md:grid-cols-5 gap-10">
        {/* Brand Column */}
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center gap-2.5">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={companyName}
                className="w-10 h-10 object-contain rounded-2xl bg-slate-900 border border-slate-800 p-1"
              />
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-pink-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-600/30">
                {companyName ? companyName.charAt(0).toUpperCase() : "N"}
              </div>
            )}
            <div>
              <span className="font-black text-white text-base tracking-tight block">
                {companyName}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">
                Enterprise Growth Infrastructure
              </span>
            </div>
          </div>

          <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
            Unified digital marketing platform powering deterministic
            attribution, high-intent audience modeling, and verifiable B2B
            revenue conversion across global enterprise markets.
          </p>

          {/* System Status Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">
              All Systems Operational
            </span>
            <span className="text-slate-500">&bull;</span>
            <span className="text-slate-400">99.99% SLA Uptime</span>
          </div>
        </div>

        {/* Column 2: Platform Capabilities */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
            Capabilities
          </h4>
          <ul className="space-y-2.5 text-slate-400 font-medium">
            <li>
              <Link href="/solutions" className="hover:text-white transition">
                Account-Based Marketing (ABM)
              </Link>
            </li>
            <li>
              <Link href="/solutions" className="hover:text-white transition">
                High-Intent Commercial SEO
              </Link>
            </li>
            <li>
              <Link href="/solutions" className="hover:text-white transition">
                Multi-Touch Server-Side Attribution
              </Link>
            </li>
            <li>
              <Link href="/solutions" className="hover:text-white transition">
                Conversion Rate Optimization
              </Link>
            </li>
            <li>
              <Link href="/solutions" className="hover:text-white transition">
                Automated Lead SLA Routing
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Resources */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
            Resources
          </h4>
          <ul className="space-y-2.5 text-slate-400 font-medium">
            <li>
              <Link href="/blog" className="hover:text-white transition">
                Strategic Growth Playbooks
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white transition">
                Platform Architecture
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white transition">
                Request Diagnostic Session
              </Link>
            </li>
            <li>
              <a
                href="http://localhost:5173"
                target="_blank"
                rel="noreferrer"
                className="hover:text-indigo-400 transition flex items-center gap-1 font-bold text-slate-300"
              >
                <span>Agency Admin Console</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-indigo-400" />
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Institutional Governance */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
            Governance
          </h4>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-300 font-bold block">
                Enterprise Compliance
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                SOC-2 Type II Certified &bull; DPDP & GDPR
              </span>
            </div>
            <div className="text-[11px] text-slate-400 pt-1">
              Contact:{" "}
              <a
                href={`mailto:${supportEmail}`}
                className="text-indigo-400 hover:underline"
              >
                {supportEmail}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-900 py-6 px-6 text-center text-[11px] text-slate-500">
        <div className="max-w-[1720px] 2xl:max-w-[1920px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            © {new Date().getFullYear()} {legalName}. All rights reserved.
            Worldwide.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Enterprise Privacy</span>
            <span>&bull;</span>
            <span>Security Architecture</span>
            <span>&bull;</span>
            <span>Status Dashboard</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
