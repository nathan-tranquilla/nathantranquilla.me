import { test, expect } from "@playwright/test";

test.describe("RSS feed", () => {
  test("is served as XML at /rss.xml", async ({ request }) => {
    const res = await request.get("/rss.xml");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/xml/);
  });

  test("carries every published post, and no drafts", async ({ request }) => {
    const xml = await (await request.get("/rss.xml")).text();
    const items = [...xml.matchAll(/<item>/g)].length;

    const sitemap = await (await request.get("/sitemap-0.xml")).text();
    const posts = [...sitemap.matchAll(/<loc>[^<]*\/blogs\/[^<]+<\/loc>/g)].filter(
      (m) => !m[0].endsWith("/blogs/</loc>")
    ).length;

    expect(posts).toBeGreaterThan(10);
    expect(items).toBe(posts);
    expect(xml).not.toContain("so-it-begins");
  });

  test("each item has a title, link, date and description", async ({ request }) => {
    const xml = await (await request.get("/rss.xml")).text();
    expect(xml).toContain("Taking Responsibility for Your AI-Generated Code");
    expect(xml).toContain(
      "https://nathantranquilla.me/blogs/taking-responsibility-for-your-ai-generated-code/"
    );
    expect(xml).toMatch(/<pubDate>.*2026.*<\/pubDate>/);
    expect(xml).toMatch(/acceptance criteria you approve/i);
  });

  test("is discoverable from the page head", async ({ request }) => {
    const html = await (await request.get("/")).text();
    expect(html).toMatch(
      /<link[^>]*rel="alternate"[^>]*type="application\/rss\+xml"[^>]*>/
    );
  });
});
