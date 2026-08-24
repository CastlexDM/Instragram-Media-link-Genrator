import type { InstagramLookupResult, InstagramMedia, MediaType } from "./types";

const APIFY_ACTOR = "scraper-engine~instagram-api-scraper";
const APIFY_ENDPOINT = `https://api.apify.com/v2/actors/${APIFY_ACTOR}/run-sync-get-dataset-items`;

type ProviderOptions = {
  mediaType?: "All" | "Post" | "Reel";
  from?: string;
  to?: string;
  limit?: number;
};

type ApifyRow = Record<string, unknown>;

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asDate(value: unknown) {
  const raw = asString(value);
  if (!raw) return "";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function mediaUrl(row: ApifyRow) {
  const video = asString(row.videoUrl);
  if (video) return video;
  const display = asString(row.displayUrl);
  if (display) return display;
  const images = Array.isArray(row.images) ? row.images : [];
  const firstImage = images.find((item) => typeof item === "string");
  return asString(firstImage);
}

function normalizeRow(row: ApifyRow, fallbackType: MediaType): InstagramMedia | null {
  const section = asString(row.section);
  if (section === "accounting" || asString(row.type).toLowerCase() === "accounting") return null;

  const permalink = asString(row.url);
  const directMedia = mediaUrl(row);
  if (!permalink && !directMedia) return null;

  const rowType = asString(row.type).toLowerCase();
  const type: MediaType = fallbackType === "Reel" || section === "reels" || rowType === "video"
    ? "Reel"
    : "Post";

  const images = Array.isArray(row.images) ? row.images : [];
  const firstImage = images.find((item) => typeof item === "string");

  return {
    id: asString(row.id) || asString(row.shortCode) || `${type}-${asString(row.timestamp)}`,
    type,
    date: asDate(row.timestamp),
    caption: asString(row.caption),
    url: directMedia || permalink,
    preview: asString(row.displayUrl) || asString(firstImage),
    permalink,
  };
}

async function runActor(profileUrl: string, type: "Post" | "Reel", options: ProviderOptions) {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    throw new Error("APIFY_TOKEN_MISSING: Add APIFY_API_TOKEN to .env.local.");
  }

  const limit = Math.min(Math.max(options.limit ?? 100, 1), 2400);
  const input: Record<string, unknown> = {
    directUrls: [profileUrl],
    resultsType: type === "Reel" ? "reels" : "posts",
    resultsLimit: limit,
  };

  if (options.from) input.onlyPostsNewerThan = options.from;

  const response = await fetch(`${APIFY_ENDPOINT}?token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`APIFY_REQUEST_FAILED:${response.status}:${detail.slice(0, 300)}`);
  }

  const rows = (await response.json()) as ApifyRow[];
  return rows
    .map((row) => normalizeRow(row, type))
    .filter((item): item is InstagramMedia => Boolean(item))
    .filter((item) => {
      if (!item.date) return true;
      if (options.from && item.date < options.from) return false;
      if (options.to && item.date > options.to) return false;
      return true;
    });
}

export async function lookupPublicInstagramProfile(
  username: string,
  profileUrl: string,
  options: ProviderOptions = {},
): Promise<InstagramLookupResult> {
  const requestedType = options.mediaType ?? "All";

  const types: ("Post" | "Reel")[] = requestedType === "Post"
    ? ["Post"]
    : requestedType === "Reel"
      ? ["Reel"]
      : ["Post", "Reel"];

  const results = await Promise.all(types.map((type) => runActor(profileUrl, type, options)));
  const media = results.flat().sort((a, b) => b.date.localeCompare(a.date));

  return {
    profile: { username, url: profileUrl },
    media,
    source: "Apify Instagram API Scraper",
  };
}
