import { resolveRegion } from "@/config/region";
import { getPublicSiteSettings, getPublicMenu } from "@/lib/cms";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BookingEmbed } from "@/components/blocks/BookingEmbed";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Schedule Strategic Discovery Session — Nexora",
  description:
    "Reserve a dedicated 30-minute growth diagnostic with Nexora's performance marketing architects.",
};

export default async function BookACallPage() {
  const region = resolveRegion();

  const [siteSettings, headerMenu] = await Promise.all([
    getPublicSiteSettings(),
    getPublicMenu("header", region.code),
  ]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground">
      <Header
        settings={siteSettings}
        currentRegionCode={region.code}
        menu={headerMenu}
      />

      <main className="flex-1 py-12 sm:py-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto px-4 mb-8">
          <Badge variant="accent">Executive Discovery Session</Badge>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Schedule a Growth Strategy Briefing
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
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
              bookingUrl: siteSettings?.bookingUrl || "",
            },
          }}
        />
      </main>

      <Footer settings={siteSettings} />
    </div>
  );
}
