import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { REGION_CONFIG } from "./config/region";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // If cookie is not present, resolve from Accept-Language and set cookie
  if (!request.cookies.has(REGION_CONFIG.cookieName)) {
    const acceptLanguage = request.headers.get("accept-language") || "";
    const initialRegion = acceptLanguage.includes("en-US")
      ? "US"
      : REGION_CONFIG.defaultRegion;

    response.cookies.set(REGION_CONFIG.cookieName, initialRegion, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

  // Set response header for cache-safety tracking
  response.headers.set("x-nexora-region-strategy", REGION_CONFIG.urlStrategy);

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
