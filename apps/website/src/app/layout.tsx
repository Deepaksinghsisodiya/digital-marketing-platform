import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import { CookieBanner } from "../components/layout/CookieBanner";
import { TrackingScripts } from "../components/layout/TrackingScripts";
import { MobileStickyBar } from "../components/layout/MobileStickyBar";
import { FloatingWhatsApp } from "../components/layout/FloatingWhatsApp";
import { ToastProvider } from "../components/ui/ToastProvider";
import { ScrollProgressBar } from "../components/motion/ScrollProgressBar";
import { ThemeSwitcher } from "../components/ui/ThemeSwitcher";
import { getPublicSiteSettings, getPublicTheme } from "../lib/cms";
import {
  MODERN_GROWTH_PRESET,
  resolveTheme,
  themeToCss,
} from "@nexora/design-tokens";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  const company = settings?.companyName || "Nexora";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${company} | Enterprise Digital Marketing & Growth Platform`,
      template: `%s | ${company}`,
    },
    description:
      "A unified enterprise digital marketing and growth execution platform.",
    icons: settings?.faviconUrl ? { icon: settings.faviconUrl } : undefined,
    openGraph: {
      title: `${company} | Enterprise Digital Marketing & Growth Platform`,
      description:
        "A unified enterprise digital marketing and growth execution platform.",
      type: "website",
      siteName: company,
      url: siteUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: `${company} | Enterprise Digital Marketing & Growth Platform`,
      description:
        "A unified enterprise digital marketing and growth execution platform.",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const [settings, publicTheme] = await Promise.all([
    getPublicSiteSettings(),
    getPublicTheme("website"),
  ]);

  const resolvedTheme = resolveTheme(
    (publicTheme?.config as Parameters<typeof resolveTheme>[0]) ?? null,
  );
  const activeTheme =
    resolvedTheme.slug ||
    publicTheme?.themeId ||
    MODERN_GROWTH_PRESET.slug;
  const themeCss = themeToCss(resolvedTheme, { mode: "both" });

  let trackingCodes: {
    gtmContainerId?: string;
    gaMeasurementId?: string;
    metaPixelId?: string;
    searchConsoleVerification?: string;
  } = {};

  let animationMode = "full";

  if (settings?.trackingCodesJson) {
    try {
      trackingCodes = JSON.parse(settings.trackingCodesJson);
    } catch {
      // safe fallback
    }
  }

  if (settings?.themeTokensJson) {
    try {
      const parsedTheme = JSON.parse(settings.themeTokensJson);
      if (parsedTheme?.animationMode) {
        animationMode = parsedTheme.animationMode;
      }
    } catch {
      // safe fallback
    }
  }

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "MarketingAgency",
    name: settings?.companyName || "Nexora",
    legalName: settings?.legalName || undefined,
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    logo: settings?.logoUrl || undefined,
    contactPoint: settings?.supportPhone
      ? {
        "@type": "ContactPoint",
        telephone: settings.supportPhone,
        contactType: "customer service",
        email: settings.supportEmail,
      }
      : undefined,
  };

  return (
    <html
      lang={locale}
      className={activeTheme === MODERN_GROWTH_PRESET.slug || activeTheme === "dark-charcoal-neon-lime" ? "dark" : undefined}
      data-theme={activeTheme}
      data-animation-mode={animationMode}
      suppressHydrationWarning
    >
      <head>
        {/* Organization Structured Data (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />

        {/* Google Search Console Verification Meta */}
        {trackingCodes.searchConsoleVerification && (
          <meta
            name="google-site-verification"
            content={trackingCodes.searchConsoleVerification}
          />
        )}

        {/* Consent-Gated Tracking Scripts (GTM, GA4, Meta Pixel, Clarity, LinkedIn) */}
        <TrackingScripts codes={trackingCodes} />
      </head>
      <body
        className={`min-h-screen antialiased bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground ${sora.variable} ${inter.variable}`}
        suppressHydrationWarning
      >
        {trackingCodes.gtmContainerId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${trackingCodes.gtmContainerId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        {themeCss ? (
          <style
            id="nexora-theme-tokens"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: themeCss }}
          />
        ) : null}
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ToastProvider />
          <ScrollProgressBar />
          <div className="flex min-h-screen flex-col pb-20 lg:pb-0">
            {children}
          </div>
          <CookieBanner />
          <FloatingWhatsApp phone={settings?.supportPhone} />
          <ThemeSwitcher />
          <MobileStickyBar
            supportPhone={settings?.supportPhone}
            bookingUrl="/book-a-call"
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
