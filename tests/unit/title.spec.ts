import { test, expect } from "@playwright/test";

// The domain is the one string that appears in every search result. It was
// misspelled "nathantraquilla.me" on all blog posts for months, so this walks
// every page from the sitemap rather than sampling.
test("every page titles with the domain spelled correctly", async ({ request }) => {
  const xml = await (await request.get("/sitemap-0.xml")).text();
  const paths = [...xml.matchAll(/<loc>https:\/\/nathantranquilla\.me(\/[^<]*)<\/loc>/g)].map(
    (m) => m[1]
  );
  expect(paths.length).toBeGreaterThan(15);

  const wrong: string[] = [];
  for (const path of paths) {
    const html = await (await request.get(path)).text();
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
    // Pages use two orders (domain first on posts, title first on guides).
    // What matters here is that the domain is spelled right wherever it sits.
    const ok = title.includes("nathantranquilla.me") && !title.includes("nathantraquilla");
    if (!ok) wrong.push(`${path} -> ${title}`);
  }
  expect(wrong).toEqual([]);
});
