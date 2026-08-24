const RESERVED_PATHS = new Set([
  "p",
  "reel",
  "reels",
  "explore",
  "accounts",
  "direct",
  "stories",
  "about",
  "developer",
]);

export function parseInstagramProfileUrl(value: string) {
  const raw = value.trim();
  if (!raw) return { ok: false as const, error: "Instagram profile URL is required." };

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false as const, error: "Enter a complete Instagram profile URL." };
  }

  const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
  if (hostname !== "instagram.com") {
    return { ok: false as const, error: "Only Instagram profile URLs are supported." };
  }

  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length !== 1) {
    return { ok: false as const, error: "Enter a profile URL, not a post, reel, or other Instagram page." };
  }

  const username = parts[0];
  if (RESERVED_PATHS.has(username.toLowerCase())) {
    return { ok: false as const, error: "That Instagram path is not a profile." };
  }

  return {
    ok: true as const,
    username,
    canonicalUrl: `https://www.instagram.com/${encodeURIComponent(username)}/`,
  };
}
