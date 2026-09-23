import { test, expect } from "@playwright/test";

test("sitemap carries lastmod so crawlers can prioritise recrawls", async ({ request }) => {
  const xml = await (await request.get("/sitemap-0.xml")).text();
  // Only posts carry a real date. Inventing a lastmod for static pages would
  // be worse than omitting it, since Google discounts sitemaps it finds
  // inaccurate.
  const urls = [...xml.matchAll(/<url>(.*?)<\/url>/gs)].map((m) => m[1]);
  const posts = urls.filter((u) => /\/blogs\/[a-z0-9-]+\//.test(u));
  expect(posts.length).toBeGreaterThan(10);

  const missing = posts.filter((u) => !u.includes("<lastmod>"));
  expect(missing).toEqual([]);
});

test("a post's lastmod matches its publish date, not the build time", async ({ request }) => {
  const xml = await (await request.get("/sitemap-0.xml")).text();
  const block = xml.match(
    /<url>(?:(?!<\/url>).)*taking-responsibility-for-your-ai-generated-code(?:(?!<\/url>).)*<\/url>/s
  )?.[0];
  expect(block).toBeTruthy();
  expect(block).toContain("<lastmod>2026-09-23");

  const older = xml.match(
    /<url>(?:(?!<\/url>).)*why-rescript-is-next-gen(?:(?!<\/url>).)*<\/url>/s
  )?.[0];
  expect(older).toContain("<lastmod>2025-10-13");
});
