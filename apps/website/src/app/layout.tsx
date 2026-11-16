import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import { CookieBanner } from "../components/layout/CookieBanner";
import { MobileStickyBar } from "../components/layout/MobileStickyBar";
import { FloatingWhatsApp } from "../components/layout/FloatingWhatsApp";
import { getPublicSiteSettings, getPublicTheme } from "../lib/cms";
import { resolveTheme, themeToCss } from "@nexora/design-tokens";

const plusJakartaSans = Plus_Jakarta_Sans({
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
  const [settings, publicTheme] = await Promise.all([
    getPublicSiteSettings(),
    getPublicTheme("website"),
  ]);

  const resolvedTheme = resolveTheme(
    (publicTheme?.config as Parameters<typeof resolveTheme>[0]) ?? null,
  );
  const activeTheme = resolvedTheme.slug || publicTheme?.themeId || "cyber-emerald";
  const themeCss = themeToCss(resolvedTheme, { mode: "both" });

  return (
    <html lang={locale} data-theme={activeTheme} suppressHydrationWarning>
      <head />
      <body
        className={`min-h-screen antialiased bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground ${plusJakartaSans.variable} ${inter.variable}`}
        suppressHydrationWarning
      >
        {themeCss ? (
          <style
            id="nexora-theme-tokens"
            suppressHydrationWarning
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
