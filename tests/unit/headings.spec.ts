import { test, expect } from "@playwright/test";

test("post headings descend without skipping a level", async ({ request }) => {
  const xml = await (await request.get("/sitemap-0.xml")).text();
  const posts = [...xml.matchAll(/<loc>https:\/\/nathantranquilla\.me(\/blogs\/[a-z0-9-]+\/)<\/loc>/g)]
    .map((m) => m[1]);
  expect(posts.length).toBeGreaterThan(10);

  const bad: string[] = [];
  for (const path of posts) {
    const html = await (await request.get(path)).text();
    const article = html.split("<article")[1]?.split("</article>")[0] ?? "";
    const levels = [...article.matchAll(/<h([1-6])[^>\s]*[^>]*>/g)].map((m) => Number(m[1]));
    // the post title is the h1 inside <article>; sections descend from there
    if (levels.length && levels[0] !== 1) bad.push(`${path}: starts at h${levels[0]}`);
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] > levels[i - 1] + 1) bad.push(`${path}: h${levels[i - 1]} -> h${levels[i]}`);
    }
  }
  expect(bad).toEqual([]);
});

test("section headings keep their existing weight and size", async ({ page }) => {
  await page.goto("/blogs/coding-is-not-for-humans/");
  const h = page.locator("article h2").first();
  await expect(h).toBeVisible();
  await expect(h).toHaveCSS("font-weight", "700");
  // 1.5rem at the desktop breakpoint, as h3 was before the shift
  await expect(h).toHaveCSS("font-size", "24px");
});
