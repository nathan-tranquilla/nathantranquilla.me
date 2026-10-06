import { test, expect } from "@playwright/test";
import fs from "node:fs";
import { POSTS_DIR } from "../helpers/posts";
import { proseWordCount, readingMinutes } from "../../src/utils/reading";

// Every post shows an estimated reading time at the end of its byline:
// "Nathan Tranquilla · October 1, 2026 · [clock] 8 min read". Prose words
// (code, HTML and markdown syntax are not reading) at 238 a minute, rounded
// up, never under a minute. The post page, the blog list and the home page
// all show the same figure, and the article schema carries it as
// timeRequired.
const POST = "making-my-money-decisions-mechanical-with-ai-and-plain-text-accounting";

const body = (src: string) => src.replace(/^---[\s\S]*?\n---\n/, "");
const published = fs
  .readdirSync(POSTS_DIR)
  .filter((f) => f.endsWith(".md"))
  .map((f) => ({ slug: f.replace(/\.md$/, ""), src: fs.readFileSync(`${POSTS_DIR}/${f}`, "utf8") }))
  .filter((p) => !/^draft:\s*true/m.test(p.src))
  .map((p) => ({
    ...p,
    hash: p.src.match(/^hash:\s*"(.*)"/m)![1],
    minutes: readingMinutes(proseWordCount(body(p.src))),
  }));

test("prose words leave out code, HTML and markdown syntax", () => {
  const md = "## A heading\n\nOne two *three*.\n\n```ts\nconst skipped = 1;\n```\n\n<figure>four</figure> - [five](https://x.y)";
  expect(proseWordCount(md)).toBe(7);
});

test("reading time is prose words at 238 a minute, rounded up, at least a minute", () => {
  expect(readingMinutes(0)).toBe(1);
  expect(readingMinutes(238)).toBe(1);
  expect(readingMinutes(239)).toBe(2);
  expect(readingMinutes(1880)).toBe(8);
});

test("the money post reads 8 minutes, as Brave's reader view says", () => {
  expect(published.find((p) => p.slug === POST)!.minutes).toBe(8);
});

test("the post page ends its byline with a clock and the reading time", async ({ page }) => {
  await page.goto(`/blogs/${POST}/`);
  const byline = page.locator('article > header [data-ui="post-meta"] [data-byline]');
  await expect(byline).toContainText(/8 min read\s*$/);
  await expect(byline.locator("[data-reading-time]")).toHaveText("8 min read");
  const clock = byline.locator("[data-reading-time] svg");
  await expect(clock).toHaveCount(1);
  await expect(clock).toHaveAttribute("aria-hidden", "true");
  // a tiny icon, sized to the text, in the text's colour
  const fit = await byline.locator("[data-reading-time]").evaluate((el) => {
    const svg = el.querySelector("svg")!;
    const s = getComputedStyle(el);
    return { h: svg.getBoundingClientRect().height, font: parseFloat(s.fontSize), stroke: getComputedStyle(svg).stroke, color: s.color };
  });
  expect(fit.h).toBeLessThanOrEqual(fit.font);
  expect(fit.h).toBeGreaterThanOrEqual(fit.font * 0.6);
  expect(fit.stroke).toBe(fit.color);
});

test("every post shows the same reading time on its page, the blog list and the home page", async ({ page }) => {
  const wrong: string[] = [];
  const time = (sel: string) =>
    page.locator(sel).evaluateAll((els) => els.map((e) => e.textContent!.replace(/\s+/g, " ").trim()));

  await page.goto("/blogs/");
  const listed = await page.locator('[data-ui="post-entry"]').evaluateAll((els) =>
    Object.fromEntries(
      els.map((e) => [(e as HTMLElement).dataset.hash, e.querySelector("[data-reading-time]")?.textContent?.trim() ?? ""])
    )
  );
  await page.goto("/");
  const home = await page.locator('[data-ui="post-entry"]').evaluateAll((els) =>
    Object.fromEntries(
      els.map((e) => [(e as HTMLElement).dataset.hash, e.querySelector("[data-reading-time]")?.textContent?.trim() ?? ""])
    )
  );
  expect(Object.keys(home).length).toBeGreaterThan(0);

  for (const p of published) {
    const want = `${p.minutes} min read`;
    await page.goto(`/blogs/${p.slug}/`);
    const [onPage] = await time('article > header [data-ui="post-meta"] [data-reading-time]');
    if (onPage !== want) wrong.push(`${p.slug} page: ${onPage}`);
    if (listed[p.hash] !== want) wrong.push(`${p.slug} list: ${listed[p.hash]}`);
    if (p.hash in home && home[p.hash] !== want) wrong.push(`${p.slug} home: ${home[p.hash]}`);
  }
  expect(wrong).toEqual([]);
});

test("the article schema gives the reading time as timeRequired, from its own word count", async ({ page }) => {
  await page.goto(`/blogs/${POST}/`);
  const schemas = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((els) => els.map((e) => JSON.parse(e.textContent ?? "{}")));
  const article = schemas.find((s) => s["@type"] === "BlogPosting" || s["@type"] === "Article")!;
  expect(article.timeRequired).toBe("PT8M");
  expect(article.timeRequired).toBe(`PT${readingMinutes(article.wordCount)}M`);
});

// The byline keeps its shape between the blog list and the post page, so the
// morph scales it evenly. On a phone the reading time takes its own line, in
// both places, rather than wrapping in one and not the other.
for (const width of [375, 414]) {
  test(`every post's byline has the same shape in the list and on its page at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    const shape = (sel: string) =>
      page.locator(sel).evaluate((el) => {
        const r = el.getBoundingClientRect();
        return r.width / r.height;
      });
    await page.goto("/blogs/");
    const listed: Record<string, number> = {};
    for (const p of published) listed[p.hash] = await shape(`[data-ui="post-entry"][data-hash="${p.hash}"] [data-byline]`);
    const off: string[] = [];
    for (const p of published) {
      await page.goto(`/blogs/${p.slug}/`);
      const own = await shape('article > header [data-ui="post-meta"] [data-byline]');
      if (Math.abs(own - listed[p.hash]) / listed[p.hash] > 0.05) off.push(`${p.slug}: ${listed[p.hash].toFixed(2)} vs ${own.toFixed(2)}`);
    }
    expect(off).toEqual([]);
  });
}
