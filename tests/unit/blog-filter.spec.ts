import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import { POSTS_DIR } from "../helpers/posts";
import { TAGS } from "../../src/utils/tags";

// The blog index's tag filter. /blogs/ embeds every published post as JSON;
// the chips filter in the browser, several chips narrowing to posts that carry
// all of them. The selection lives in the URL (?tag=type-safety&tag=ai), so a
// filtered view is shareable and the back button steps through it. Without
// JavaScript every post shows and the filter row stays hidden.
const published = fs
  .readdirSync(POSTS_DIR)
  .filter((f) => f.endsWith(".md"))
  .map((f) => fs.readFileSync(`${POSTS_DIR}/${f}`, "utf8"))
  .filter((src) => !/^draft:\s*true/m.test(src))
  .map((src) => ({
    title: src.match(/^title:\s*"?(.*?)"?\s*$/m)![1],
    hash: src.match(/^hash:\s*"(.*)"/m)![1],
    tags: JSON.parse(src.match(/^tags:\s*(\[.*\])\s*$/m)![1]) as string[],
  }));

const withAll = (...tags: string[]) => published.filter((p) => tags.every((t) => p.tags.includes(t)));
const slug = (t: string) => t.toLowerCase().replace(/\s+/g, "-");

const shown = (page: Page) =>
  page.locator('[data-ui="post-entry"]:visible').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.hash).sort());
const hashes = (posts: typeof published) => posts.map((p) => p.hash).sort();
const chip = (page: Page, label: string) => page.locator(`[data-ui="filter-chip"][data-label="${label}"]`);

test("the index embeds every published post as JSON", async ({ page }) => {
  await page.goto("/blogs/");
  const data = JSON.parse((await page.locator("script#posts-data").textContent()) ?? "[]");
  expect(data.map((p: { hash: string }) => p.hash).sort()).toEqual(hashes(published));
  for (const post of data) {
    const src = published.find((p) => p.hash === post.hash)!;
    expect(post.title).toBe(src.title);
    expect(post.tags).toEqual(src.tags);
    expect(post.url).toMatch(/^\/blogs\/[a-z0-9-]+\/$/);
  }
});

test("the filter row shows All plus every tag, with its post count", async ({ page }) => {
  await page.goto("/blogs/");
  const row = page.locator('[data-ui="filter-row"]');
  await expect(row).toBeVisible();
  for (const tag of TAGS) {
    await expect(chip(page, tag).locator("[data-count]")).toHaveText(String(withAll(tag).length));
  }
  await expect(chip(page, "All")).toHaveAttribute("aria-pressed", "true");
});

test("one chip shows only that tag's posts and records it in the URL", async ({ page }) => {
  await page.goto("/blogs/");
  await chip(page, "Type Safety").click();
  await expect(chip(page, "Type Safety")).toHaveAttribute("aria-pressed", "true");
  await expect(chip(page, "All")).toHaveAttribute("aria-pressed", "false");
  await expect.poll(() => shown(page)).toEqual(hashes(withAll("Type Safety")));
  expect(new URL(page.url()).searchParams.getAll("tag")).toEqual(["type-safety"]);
});

test("two chips narrow to posts with both tags", async ({ page }) => {
  await page.goto("/blogs/");
  await chip(page, "Type Safety").click();
  await chip(page, "AI").click();
  const both = withAll("Type Safety", "AI");
  expect(both.length).toBeGreaterThan(0);
  await expect.poll(() => shown(page)).toEqual(hashes(both));
});

test("pressing a chip again deselects it, and All clears everything", async ({ page }) => {
  await page.goto("/blogs/");
  await chip(page, "AI").click();
  await chip(page, "Coding").click();
  await chip(page, "Coding").click();
  await expect.poll(() => shown(page)).toEqual(hashes(withAll("AI")));
  await chip(page, "All").click();
  await expect.poll(() => shown(page)).toEqual(hashes(published));
  await expect(chip(page, "All")).toHaveAttribute("aria-pressed", "true");
  expect(new URL(page.url()).search).toBe("");
});

test("a combination with no posts says so and offers to clear the filters", async ({ page }) => {
  await page.goto("/blogs/");
  await chip(page, "Finance").click();
  await chip(page, "ReScript").click();
  expect(withAll("Finance", "ReScript")).toEqual([]);
  await expect.poll(() => shown(page)).toEqual([]);
  const empty = page.locator("[data-filter-empty]");
  await expect(empty).toBeVisible();
  await empty.getByRole("button", { name: /clear/i }).click();
  await expect.poll(() => shown(page)).toEqual(hashes(published));
  await expect(empty).toBeHidden();
});

test("a filtered URL opens already filtered", async ({ page }) => {
  await page.goto(`/blogs/?tag=${slug("Finance")}`);
  await expect(chip(page, "Finance")).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => shown(page)).toEqual(hashes(withAll("Finance")));
});

test("the back button steps back through filter changes", async ({ page }) => {
  await page.goto("/blogs/");
  await chip(page, "AI").click();
  await chip(page, "Coding").click();
  await page.goBack();
  await expect.poll(() => shown(page)).toEqual(hashes(withAll("AI")));
  await expect(chip(page, "Coding")).toHaveAttribute("aria-pressed", "false");
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("every post shows and the filter row stays hidden", async ({ page }) => {
    await page.goto("/blogs/?tag=finance");
    await expect.poll(() => shown(page)).toEqual(hashes(published));
    await expect(page.locator('[data-ui="filter-row"]')).toBeHidden();
  });
});

test("tags on a post page link to the index filtered by that tag", async ({ page }) => {
  await page.goto("/blogs/making-my-money-decisions-mechanical-with-ai-and-plain-text-accounting/");
  const finance = page.locator('article > header a[data-ui="tag"]', { hasText: "Finance" });
  await expect(finance).toHaveAttribute("href", "/blogs/?tag=finance");
  await finance.click();
  await expect.poll(() => shown(page)).toEqual(hashes(withAll("Finance")));
});
