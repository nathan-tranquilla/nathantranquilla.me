import { test, expect } from "@playwright/test";
import { buildRange } from "../../scripts/analytics-model.mjs";

// buildRange turns flattened GA4 rows into one record per post. The CI
// workflow runs the queries; this is the part that can be tested offline.
const empty = { landing: [], engagement: [], shares: [] };

test("folds /blogs/x and /blogs/x/ into one post and ignores other pages", () => {
  const posts = buildRange({
    ...empty,
    landing: [
      { path: "/blogs/a/", channel: "Direct", source: "(direct)", sessions: 2 },
      { path: "/blogs/a", channel: "Direct", source: "(direct)", sessions: 3 },
      { path: "/about/", channel: "Direct", source: "(direct)", sessions: 9 },
      { path: "(not set)", channel: "Direct", source: "(direct)", sessions: 9 },
    ],
  });
  expect(Object.keys(posts)).toEqual(["a"]);
  expect(posts.a.sessions).toBe(5);
});

test("maps GA channels onto the page's columns", () => {
  const posts = buildRange({
    ...empty,
    landing: [
      { path: "/blogs/a/", channel: "Direct", source: "(direct)", sessions: 1 },
      { path: "/blogs/a/", channel: "Organic Social", source: "linkedin.com", sessions: 2 },
      { path: "/blogs/a/", channel: "Organic Search", source: "google", sessions: 3 },
      { path: "/blogs/a/", channel: "Referral", source: "share", sessions: 4 },
      { path: "/blogs/a/", channel: "Unassigned", source: "(not set)", sessions: 5 },
      { path: "/blogs/a/", channel: "Cross-network", source: "(data not available)", sessions: 6 },
    ],
  });
  expect(posts.a.channels).toEqual({ direct: 1, social: 2, search: 3, referral: 4, other: 11 });
});

test("lists non-direct sources, largest first, merged across channels", () => {
  const posts = buildRange({
    ...empty,
    landing: [
      { path: "/blogs/a/", channel: "Organic Social", source: "t.co", sessions: 1 },
      { path: "/blogs/a/", channel: "Organic Social", source: "linkedin.com", sessions: 4 },
      { path: "/blogs/a/", channel: "Unassigned", source: "share", sessions: 1 },
      { path: "/blogs/a/", channel: "Referral", source: "share", sessions: 2 },
      { path: "/blogs/a/", channel: "Direct", source: "(direct)", sessions: 7 },
    ],
  });
  expect(posts.a.sources).toEqual([
    { source: "linkedin.com", sessions: 4 },
    { source: "share", sessions: 3 },
    { source: "t.co", sessions: 1 },
  ]);
});

test("short-link visits are sessions whose source is share", () => {
  const posts = buildRange({
    ...empty,
    landing: [
      { path: "/blogs/a/", channel: "Referral", source: "share", sessions: 2 },
      { path: "/blogs/a/", channel: "Unassigned", source: "share", sessions: 1 },
      { path: "/blogs/a/", channel: "Referral", source: "news.ycombinator.com", sessions: 5 },
    ],
  });
  expect(posts.a.shortLinkVisits).toBe(3);
});

test("engaged time per view is total engagement over views, null with no views", () => {
  const posts = buildRange({
    ...empty,
    engagement: [
      { path: "/blogs/a/", views: 4, engagementSeconds: 260 },
      { path: "/blogs/a", views: 1, engagementSeconds: 65 },
      { path: "/blogs/b/", views: 0, engagementSeconds: 0 },
    ],
  });
  expect(posts.a.views).toBe(5);
  expect(posts.a.engagedSecondsPerView).toBe(65);
  expect(posts.b.engagedSecondsPerView).toBeNull();
});

test("share clicks split by method, with unknown methods counted in the total", () => {
  const posts = buildRange({
    ...empty,
    shares: [
      { path: "/blogs/a/", method: "native", count: 3 },
      { path: "/blogs/a/", method: "clipboard", count: 2 },
      { path: "/blogs/a/", method: "(not set)", count: 1 },
    ],
  });
  expect(posts.a.shares).toEqual({ native: 3, clipboard: 2, total: 6 });
});

test("a post with data in only one query still gets every field", () => {
  const posts = buildRange({
    ...empty,
    shares: [{ path: "/blogs/a/", method: "native", count: 1 }],
  });
  expect(posts.a).toEqual({
    sessions: 0,
    channels: { direct: 0, social: 0, search: 0, referral: 0, other: 0 },
    sources: [],
    shortLinkVisits: 0,
    views: 0,
    engagedSecondsPerView: null,
    shares: { native: 1, clipboard: 0, total: 1 },
  });
});
