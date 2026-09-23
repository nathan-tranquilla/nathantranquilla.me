import { test, expect } from "@playwright/test";
import fs from "node:fs";

// @astrojs/sitemap runs at build time only, so the dev server never serves
// this. Read what the build produced instead of fetching it.
const SITEMAP = "dist/sitemap-0.xml";

test.beforeAll(() => {
  if (!fs.existsSync(SITEMAP)) {
    throw new Error(`${SITEMAP} is missing. Run \`astro build\` before the suite.`);
  }
});

test("sitemap carries lastmod so crawlers can prioritise recrawls", () => {
  const xml = fs.readFileSync(SITEMAP, "utf8");
  // Only posts carry a real date. Inventing a lastmod for static pages would
  // be worse than omitting it, since Google discounts sitemaps it finds
  // inaccurate.
  const urls = [...xml.matchAll(/<url>(.*?)<\/url>/gs)].map((m) => m[1]);
  const posts = urls.filter((u) => /\/blogs\/[a-z0-9-]+\//.test(u));
  expect(posts.length).toBeGreaterThan(10);
  expect(posts.filter((u) => !u.includes("<lastmod>"))).toEqual([]);
});

test("a post's lastmod matches its publish date, not the build time", () => {
  const xml = fs.readFileSync(SITEMAP, "utf8");
  const block = (slug: string) =>
    xml.match(new RegExp(`<url>(?:(?!</url>).)*${slug}(?:(?!</url>).)*</url>`, "s"))?.[0];

  expect(block("taking-responsibility-for-your-ai-generated-code")).toContain(
    "<lastmod>2026-09-23"
  );
  expect(block("why-rescript-is-next-gen")).toContain("<lastmod>2025-10-13");
});
