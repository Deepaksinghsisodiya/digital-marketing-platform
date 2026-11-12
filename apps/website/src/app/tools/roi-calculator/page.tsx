import { cookies } from "next/headers";
import { REGION_CONFIG, resolveRegion } from "@/config/region";
import { getPublicSiteSettings, getPublicMenu } from "@/lib/cms";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RoiCalculator } from "@/components/blocks/RoiCalculator";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Enterprise Marketing ROI Calculator — Nexora",
  description:
    "Simulate and project your customer acquisition revenue, conversion lifts, and return on ad spend.",
};

export default async function RoiCalculatorPage() {
  const cookieStore = await cookies();
  const currentRegionCode = cookieStore.get(REGION_CONFIG.cookieName)?.value;
  const region = resolveRegion(currentRegionCode);

  const [siteSettings, headerMenu] = await Promise.all([
    getPublicSiteSettings(),
    getPublicMenu("header", region.code),
  ]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100">
      <Header
        settings={siteSettings}
        currentRegionCode={region.code}
        menu={headerMenu}
      />

      <main className="flex-1 py-16 sm:py-24 px-6 sm:px-10 lg:px-12 xl:px-16 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="sample">Sample Interactive Simulation</Badge>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Enterprise Digital Growth & ROI Simulator
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Adjust monthly marketing investment, website traffic, and deal
            values to model deterministic revenue outcomes powered by
            full-funnel CRO and attribution.
          </p>
        </div>

        <RoiCalculator
          block={{
            id: "dedicated-roi-calculator",
            type: "RoiCalculator",
            schemaVersion: 1,
            enabled: true,
            settings: { region: region.code },
            content: {
              sectionTitle: "Revenue & Pipeline Projection Simulator",
              sectionSubtitle:
                "Simulate conversion rates and lifetime value scaling across quarterly sprint cycles.",
            },
          }}
        />
      </main>

      <Footer settings={siteSettings} />
    </div>
  );
}
