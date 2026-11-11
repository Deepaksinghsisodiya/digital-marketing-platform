import type { Metadata } from "next";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import { CookieBanner } from "../components/layout/CookieBanner";
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
      if (tokens.primaryColor)
        vars.push(`--nexora-purple: ${tokens.primaryColor};`);
      if (tokens.accentColor)
        vars.push(`--nexora-blue: ${tokens.accentColor};`);
      if (tokens.navyColor) vars.push(`--nexora-navy: ${tokens.navyColor};`);
      if (tokens.radius) {
        vars.push(`--nexora-radius-md: ${tokens.radius};`);
        vars.push(`--nexora-radius-lg: calc(${tokens.radius} * 1.5);`);
      }
      if (tokens.fontSans)
        vars.push(
          `--nexora-font-sans: '${tokens.fontSans}', ui-sans-serif, system-ui, sans-serif;`,
        );
      if (tokens.fontHeading)
        vars.push(
          `--nexora-font-heading: '${tokens.fontHeading}', var(--nexora-font-sans);`,
        );
      if (vars.length > 0) {
        themeCss = `:root { ${vars.join(" ")} }`;
      }
    } catch {
      // Safe fallback to defaults
    }
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {themeCss && (
          <style
            id="nexora-theme-tokens"
            dangerouslySetInnerHTML={{ __html: themeCss }}
          />
        )}
      </head>
      <body
        className="min-h-screen antialiased bg-white text-slate-900 font-sans"
        suppressHydrationWarning
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
