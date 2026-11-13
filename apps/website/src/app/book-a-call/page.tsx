import { cookies } from "next/headers";
import { REGION_CONFIG, resolveRegion } from "@/config/region";
import { getPublicSiteSettings, getPublicMenu } from "@/lib/cms";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BookingEmbed } from "@/components/blocks/BookingEmbed";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Schedule Strategic Discovery Session — Nexora",
  description:
    "Reserve a dedicated 30-minute growth diagnostic with Nexora's performance marketing architects.",
};

export default async function BookACallPage() {
  const cookieStore = await cookies();
  const currentRegionCode = cookieStore.get(REGION_CONFIG.cookieName)?.value;
  const region = resolveRegion(currentRegionCode);

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

      <main className="flex-1 py-16 sm:py-24 px-6 sm:px-10 lg:px-12 xl:px-16 max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <Badge variant="accent">Executive Discovery Session</Badge>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Schedule a Growth Strategy Briefing
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            In this 30-minute working session, our marketing strategists analyze
            your commercial search footprint, ad spend efficiency, and
            conversion architecture.
          </p>
        </div>

        <BookingEmbed
          block={{
            id: "dedicated-booking-embed",
            type: "BookingEmbed",
            schemaVersion: 1,
            enabled: true,
            settings: {},
            content: {
              headline: "Reserve Calendar Slot",
              subheadline:
                "Direct booking with our technical performance directors.",
              url:
                siteSettings?.bookingUrl ||
                "https://cal.com/nexora-digital/growth-strategy",
            },
          }}
        />
      </main>

      <Footer settings={siteSettings} />
    </div>
  );
}
