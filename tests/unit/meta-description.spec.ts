import { test, expect } from "@playwright/test";

// A description assembled from title + tags + author tells a searcher nothing.
// It is also og:description and twitter:description, so it is what every
// shared link shows.
test("every blog post writes its own meta description", async ({ request }) => {
  const xml = await (await request.get("/sitemap-0.xml")).text();
  const posts = [...xml.matchAll(/<loc>https:\/\/nathantranquilla\.me(\/blogs\/[^<]+)<\/loc>/g)]
    .map((m) => m[1])
    .filter((p) => p !== "/blogs/");
  expect(posts.length).toBeGreaterThan(10);

  const bad: string[] = [];
  for (const path of posts) {
    const html = await (await request.get(path)).text();
    const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "";
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1]?.split(" | ").pop() ?? "";

    if (!desc) bad.push(`${path}: missing`);
    else if (desc.startsWith(title)) bad.push(`${path}: starts with the title`);
    else if (desc.includes("by Nathan Tranquilla")) bad.push(`${path}: author boilerplate`);
    else if (desc.includes("—")) bad.push(`${path}: contains an em dash`);
    else if (desc.length < 70 || desc.length > 200) bad.push(`${path}: ${desc.length} chars`);
  }
  expect(bad).toEqual([]);
});
