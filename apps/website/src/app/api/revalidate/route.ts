import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  const secret =
    request.headers.get("x-revalidate-secret") ||
    request.nextUrl.searchParams.get("secret");

  const expectedSecret =
    process.env.REVALIDATE_SECRET || "nexora_revalidate_secret_dev";

  if (!secret || secret !== expectedSecret) {
    return NextResponse.json(
      { error: "Invalid revalidation secret." },
      { status: 401 },
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const tag = body.tag || request.nextUrl.searchParams.get("tag");
    const path = body.path || request.nextUrl.searchParams.get("path");

    if (tag) {
      revalidateTag(tag);
      return NextResponse.json({ revalidated: true, tag, now: Date.now() });
    }

    if (path) {
      revalidatePath(path);
      return NextResponse.json({ revalidated: true, path, now: Date.now() });
    }

    // Default revalidate all CMS pages
    revalidateTag("cms-pages");
    return NextResponse.json({
      revalidated: true,
      tag: "cms-pages",
      now: Date.now(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Error during revalidation", details: String(err) },
      { status: 500 },
    );
  }
}
