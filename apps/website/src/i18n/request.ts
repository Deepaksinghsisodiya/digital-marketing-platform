import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { REGION_CONFIG, resolveRegion } from "../config/region";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const cookieRegion = cookieStore.get(REGION_CONFIG.cookieName)?.value;
  const acceptLanguage = headerStore.get("accept-language");

  let resolvedCode = cookieRegion;
  if (!resolvedCode && acceptLanguage) {
    if (acceptLanguage.includes("en-US")) {
      resolvedCode = "US";
    } else {
      resolvedCode = "IN";
    }
  }

  const region = resolveRegion(resolvedCode);
  const locale = region.defaultLocale;

  let messages: Record<string, any>;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    messages = (await import(`../../messages/en-IN.json`)).default;
  }

  return {
    locale,
    messages,
  };
});
