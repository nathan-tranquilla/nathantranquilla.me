// Writes reports/analytics.json for the dev-only /analytics page: per post,
// where visits came from, time spent, Share clicks and share-link visits,
// for the last 7, 30 and 90 days and all time.
//
//   pnpm analytics:report
//
// Needs GA4 credentials (see ga4.mjs), so it runs in the Traffic report
// workflow, which commits the file.
import fs from "node:fs";
import { ga4, blogPaths } from "./ga4.mjs";
import { buildRange } from "./analytics-model.mjs";

// The earliest date the GA4 Data API accepts.
const ALL_TIME = "2015-08-14";
const iso = (d) => d.toISOString().slice(0, 10);
const daysAgo = (n) => iso(new Date(Date.now() - n * 86400000));
const today = iso(new Date());

const RANGES = { 7: daysAgo(7), 30: daysAgo(30), 90: daysAgo(90), all: ALL_TIME };

const ga = ga4();
const values = (r) => [...r.dimensionValues.map((v) => v.value), ...r.metricValues.map((v) => Number(v.value))];

async function landing(dateRanges) {
  const report = await ga.run({
    dateRanges,
    dimensions: [{ name: "landingPage" }, { name: "sessionDefaultChannelGroup" }, { name: "sessionSource" }],
    metrics: [{ name: "sessions" }],
    dimensionFilter: blogPaths("landingPage"),
  });
  return (report.rows ?? []).map(values).map(([path, channel, source, sessions]) => ({ path, channel, source, sessions }));
}

async function engagement(dateRanges) {
  const report = await ga.run({
    dateRanges,
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }, { name: "userEngagementDuration" }],
    dimensionFilter: blogPaths("pagePath"),
  });
  return (report.rows ?? []).map(values).map(([path, views, engagementSeconds]) => ({ path, views, engagementSeconds }));
}

// Share button clicks, from the GA4 `share` event the button sends, keyed by
// the page it was clicked on. `method` (native | clipboard) is a standard
// GA4 dimension; if the property rejects it, fall back to totals only.
async function shares(dateRanges) {
  const request = (dimensions) =>
    ga.run({
      dateRanges,
      dimensions,
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        andGroup: {
          expressions: [
            { filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: "share" } } },
            blogPaths("pagePath"),
          ],
        },
      },
    });
  try {
    const report = await request([{ name: "pagePath" }, { name: "method" }]);
    return (report.rows ?? []).map(values).map(([path, method, count]) => ({ path, method, count }));
  } catch (err) {
    console.warn(`  share method unavailable (${err.message}); reporting totals only`);
    const report = await request([{ name: "pagePath" }]);
    return (report.rows ?? []).map(values).map(([path, count]) => ({ path, method: "(not set)", count }));
  }
}

const ranges = {};
for (const [key, startDate] of Object.entries(RANGES)) {
  const dateRanges = [{ startDate, endDate: "today" }];
  const [l, e, s] = await Promise.all([landing(dateRanges), engagement(dateRanges), shares(dateRanges)]);
  ranges[key] = { startDate, endDate: today, posts: buildRange({ landing: l, engagement: e, shares: s }) };
  console.log(`  ${key}: ${Object.keys(ranges[key].posts).length} posts with data`);
}

fs.mkdirSync("reports", { recursive: true });
fs.writeFileSync("reports/analytics.json", JSON.stringify({ generatedAt: new Date().toISOString(), ranges }, null, 2) + "\n");
console.log("Wrote reports/analytics.json");
