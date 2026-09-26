// Where do visits to each blog post come from?
//
// Counts sessions that *landed* on a post (so internal clicks between pages
// don't count), grouped by GA4's default channel (Organic Search, Organic
// Social, Referral, Direct, ...) and by the exact source (google, t.co,
// linkedin.com, share = our short links).
//
//   pnpm traffic            last 90 days
//   pnpm traffic 30         last 30 days
//   pnpm traffic 365 --csv  CSV of every post x channel x source row
//
// Needs GA4_SERVICE_ACCOUNT_JSON and GA4_PROPERTY_ID, from the environment or
// .env.local (gitignored), the same as `pnpm fetch:analytics`.
import fs from "node:fs";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

const days = Number(process.argv.find((a) => /^\d+$/.test(a)) ?? 90);
const csv = process.argv.includes("--csv");

if (fs.existsSync(".env.local")) {
  for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.trim().match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}
const { GA4_SERVICE_ACCOUNT_JSON: json, GA4_PROPERTY_ID: propertyId } = process.env;
if (!json || !propertyId) {
  console.error("Set GA4_SERVICE_ACCOUNT_JSON and GA4_PROPERTY_ID (env or .env.local).");
  process.exit(1);
}

const client = new BetaAnalyticsDataClient({ credentials: JSON.parse(json) });
const [report] = await client.runReport({
  property: `properties/${propertyId}`,
  dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
  dimensions: [{ name: "landingPage" }, { name: "sessionDefaultChannelGroup" }, { name: "sessionSource" }],
  metrics: [{ name: "sessions" }, { name: "engagedSessions" }],
  dimensionFilter: {
    filter: { fieldName: "landingPage", stringFilter: { matchType: "BEGINS_WITH", value: "/blogs/" } },
  },
  orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
  limit: 10000,
});

const rows = (report.rows ?? []).map((r) => ({
  post: r.dimensionValues[0].value.replace(/^\/blogs\//, "").replace(/\/$/, ""),
  channel: r.dimensionValues[1].value,
  source: r.dimensionValues[2].value,
  sessions: Number(r.metricValues[0].value),
  engaged: Number(r.metricValues[1].value),
}));

if (csv) {
  console.log("post,channel,source,sessions,engaged_sessions");
  for (const r of rows) console.log([r.post, r.channel, r.source, r.sessions, r.engaged].map((v) => `"${v}"`).join(","));
  process.exit(0);
}

// One block per post: channels, then the sources inside each channel.
const byPost = new Map();
for (const r of rows) {
  const post = byPost.get(r.post) ?? { total: 0, channels: new Map() };
  post.total += r.sessions;
  const ch = post.channels.get(r.channel) ?? { total: 0, sources: [] };
  ch.total += r.sessions;
  ch.sources.push(r);
  post.channels.set(r.channel, ch);
  byPost.set(r.post, post);
}

const pct = (n, of) => `${Math.round((100 * n) / of)}%`.padStart(4);
console.log(`Sessions landing on blog posts, last ${days} days\n`);
for (const [post, { total, channels }] of [...byPost].sort((a, b) => b[1].total - a[1].total)) {
  console.log(`${post}  (${total} sessions)`);
  for (const [channel, ch] of [...channels].sort((a, b) => b[1].total - a[1].total)) {
    const sources = ch.sources.map((s) => `${s.source} ${s.sessions}`).join(", ");
    console.log(`  ${pct(ch.total, total)}  ${channel.padEnd(16)} ${String(ch.total).padStart(5)}   ${sources}`);
  }
  console.log();
}

const totals = new Map();
for (const r of rows) totals.set(r.channel, (totals.get(r.channel) ?? 0) + r.sessions);
const all = rows.reduce((n, r) => n + r.sessions, 0);
console.log(`All posts  (${all} sessions)`);
for (const [channel, n] of [...totals].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${pct(n, all)}  ${channel.padEnd(16)} ${String(n).padStart(5)}`);
}
