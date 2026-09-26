// Turns flattened GA4 rows into one record per blog post, for the dev-only
// /analytics page. Pure, so it is tested offline; analytics-report.mjs runs
// the queries in CI and feeds this.

const COLUMN = {
  Direct: "direct",
  "Organic Social": "social",
  "Organic Search": "search",
  Referral: "referral",
};

/** "/blogs/some-post/" -> "some-post"; anything that isn't a post -> null. */
export const postSlug = (path) => path?.match(/^\/blogs\/([a-z0-9-]+)\/?$/)?.[1] ?? null;

const blank = () => ({
  sessions: 0,
  channels: { direct: 0, social: 0, search: 0, referral: 0, other: 0 },
  sources: [],
  shortLinkVisits: 0,
  views: 0,
  engagedSecondsPerView: null,
  shares: { native: 0, clipboard: 0, total: 0 },
});

/**
 * @param {{
 *   landing: {path: string, channel: string, source: string, sessions: number}[],
 *   engagement: {path: string, views: number, engagementSeconds: number}[],
 *   shares: {path: string, method: string, count: number}[],
 * }} rows
 */
export function buildRange({ landing, engagement, shares }) {
  const posts = {};
  const sources = {};
  const seconds = {};
  const post = (path) => {
    const slug = postSlug(path);
    if (slug) posts[slug] ??= blank();
    return slug;
  };

  for (const r of landing) {
    const slug = post(r.path);
    if (!slug) continue;
    const p = posts[slug];
    p.sessions += r.sessions;
    p.channels[COLUMN[r.channel] ?? "other"] += r.sessions;
    if (r.source === "share") p.shortLinkVisits += r.sessions;
    if (r.channel !== "Direct") {
      sources[slug] ??= {};
      sources[slug][r.source] = (sources[slug][r.source] ?? 0) + r.sessions;
    }
  }

  for (const r of engagement) {
    const slug = post(r.path);
    if (!slug) continue;
    posts[slug].views += r.views;
    seconds[slug] = (seconds[slug] ?? 0) + r.engagementSeconds;
  }

  for (const r of shares) {
    const slug = post(r.path);
    if (!slug) continue;
    const s = posts[slug].shares;
    if (r.method === "native" || r.method === "clipboard") s[r.method] += r.count;
    s.total += r.count;
  }

  for (const [slug, p] of Object.entries(posts)) {
    p.sources = Object.entries(sources[slug] ?? {})
      .map(([source, sessions]) => ({ source, sessions }))
      .sort((a, b) => b.sessions - a.sessions || a.source.localeCompare(b.source));
    if (p.views > 0) p.engagedSecondsPerView = Math.round((seconds[slug] ?? 0) / p.views);
  }
  return posts;
}
