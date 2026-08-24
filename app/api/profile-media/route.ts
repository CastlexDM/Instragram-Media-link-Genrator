import { NextRequest, NextResponse } from "next/server";
import { lookupPublicInstagramProfile } from "@/lib/instagram/provider";
import { parseInstagramProfileUrl } from "@/lib/instagram/validate";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams.get("url") ?? "";
  const parsed = parseInstagramProfileUrl(input);

  if (!parsed.ok) {
    return NextResponse.json(
      { ok: false, code: "INVALID_URL", error: parsed.error },
      { status: 400 },
    );
  }

  const rawType = request.nextUrl.searchParams.get("type") ?? "All";
  const mediaType = ["All", "Post", "Reel"].includes(rawType)
    ? (rawType as "All" | "Post" | "Reel")
    : "All";
  const from = request.nextUrl.searchParams.get("from") || undefined;
  const to = request.nextUrl.searchParams.get("to") || undefined;
  const parsedLimit = Number(request.nextUrl.searchParams.get("limit") ?? "100");
  const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(Math.floor(parsedLimit), 1), 2400) : 100;

  try {
    const result = await lookupPublicInstagramProfile(
      parsed.username,
      parsed.canonicalUrl,
      { mediaType, from, to, limit },
    );

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lookup failed.";
    const tokenMissing = message.startsWith("APIFY_TOKEN_MISSING");

    const isProviderRequest = message.startsWith("APIFY_REQUEST_FAILED:");
    const safeDetail = isProviderRequest ? message.replace(/^APIFY_REQUEST_FAILED:/, "").slice(0, 500) : undefined;

    return NextResponse.json(
      {
        ok: false,
        code: tokenMissing ? "APIFY_TOKEN_MISSING" : "LOOKUP_FAILED",
        error: tokenMissing
          ? "Add APIFY_API_TOKEN to .env.local before using live Instagram lookup."
          : "The profile could not be retrieved right now. The public data provider may be unavailable or the profile may not expose public media.",
        ...(safeDetail ? { providerDetail: safeDetail } : {}),
      },
      { status: tokenMissing ? 503 : 502 },
    );
  }
}
