import type { Metadata } from "next";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import { CookieBanner } from "../components/layout/CookieBanner";
import { MobileStickyBar } from "../components/layout/MobileStickyBar";
import { FloatingWhatsApp } from "../components/layout/FloatingWhatsApp";
import { getPublicSiteSettings } from "../lib/cms";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  const company = settings?.companyName || "Nexora";
  return {
    title: {
      default: `${company} | Enterprise Digital Marketing & Growth Platform`,
      template: `%s | ${company}`,
    },
    description:
      "A unified enterprise digital marketing and growth execution platform.",
    icons: settings?.faviconUrl ? { icon: settings.faviconUrl } : undefined,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const settings = await getPublicSiteSettings();

  let themeCss = "";
  if (settings?.themeTokensJson) {
    try {
      const tokens = JSON.parse(settings.themeTokensJson);
      const vars: string[] = [];

      // Color Palette Tokens
      if (tokens.primaryColor) {
        vars.push(`--nexora-primary: ${tokens.primaryColor};`);
        vars.push(`--nexora-purple: ${tokens.primaryColor};`);
      }
      if (tokens.accentColor) {
        vars.push(`--nexora-accent: ${tokens.accentColor};`);
        vars.push(`--nexora-blue: ${tokens.accentColor};`);
      }
      if (tokens.navyColor) {
        vars.push(`--nexora-navy: ${tokens.navyColor};`);
        vars.push(`--nexora-dark-bg: ${tokens.navyColor};`);
      }

      // Radii
      if (tokens.radius) {
        vars.push(`--nexora-radius-md: ${tokens.radius};`);
        vars.push(`--nexora-radius-lg: calc(${tokens.radius} * 1.5);`);
      }

      // Typography
      if (tokens.fontSans) {
        vars.push(
          `--nexora-font-sans: '${tokens.fontSans}', ui-sans-serif, system-ui, sans-serif;`,
        );
      }
      if (tokens.fontHeading) {
        vars.push(
          `--nexora-font-heading: '${tokens.fontHeading}', var(--nexora-font-sans);`,
        );
      }

      // Animation Settings
      if (tokens.animation) {
        const anim = tokens.animation;
        if (anim.enabled === false) {
          vars.push(`--nexora-anim-duration: 0.001s;`);
          vars.push(`--nexora-anim-play: paused;`);
        } else {
          const speedFactor =
            anim.speed === "fast"
              ? "0.15s"
              : anim.speed === "slow"
                ? "0.6s"
                : "0.3s";
          vars.push(`--nexora-anim-duration: ${speedFactor};`);
          vars.push(`--nexora-anim-play: running;`);
        }
      }

      if (vars.length > 0) {
        themeCss = `:root { ${vars.join(" ")} }`;
      }
    } catch {
      // Safe fallback to defaults
    }
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <head />
      <body
        className="min-h-screen antialiased bg-white text-slate-900 font-sans selection:bg-indigo-600 selection:text-white"
        suppressHydrationWarning
      >
        {themeCss ? (
          <style
            id="nexora-theme-tokens"
            dangerouslySetInnerHTML={{ __html: themeCss }}
          />
        ) : null}
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <CookieBanner />
          <FloatingWhatsApp phone={settings?.supportPhone} />
          <MobileStickyBar
            supportPhone={settings?.supportPhone}
            bookingUrl="/book-a-call"
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
