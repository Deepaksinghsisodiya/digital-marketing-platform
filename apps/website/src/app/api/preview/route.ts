import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return new NextResponse("Missing preview token", { status: 400 });
  }

  const redirectUrl = new URL(
    `/preview?token=${encodeURIComponent(token)}`,
    request.url,
  );
  return NextResponse.redirect(redirectUrl);
}
