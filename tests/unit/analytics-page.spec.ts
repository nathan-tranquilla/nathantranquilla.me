import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import { POSTS_DIR } from "../helpers/posts";

// /analytics is dev-only, like /ui. It reads reports/analytics.json, which the
// Traffic report workflow commits; /analytics/fixture swaps in tests/fixtures
// so the numbers here are fixed.
const TAKING = "taking-responsibility-for-your-ai-generated-code";
const TS = "typescript-has-a-big-problem";

const published = fs
  .readdirSync(POSTS_DIR)
  .filter((f) => f.endsWith(".md"))
  .filter((f) => !/^draft:\s*true/m.test(fs.readFileSync(`${POSTS_DIR}/${f}`, "utf8")));

const row = (page: Page, slug: string) => page.locator(`[data-range]:visible tr[data-post="${slug}"]`);
const cell = (page: Page, slug: string, col: string) => row(page, slug).locator(`[data-col="${col}"]`);

test.beforeEach(async ({ page }) => {
  await page.goto("/analytics/fixture");
});

test("is a standalone page with no site layout", async ({ page }) => {
  await expect(page.locator("nav")).toHaveCount(0);
  await expect(page.locator("footer")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1, name: "Analytics" })).toBeVisible();
});

test("says when the data was generated and which range is showing", async ({ page }) => {
  await expect(page.getByText("Generated 2026-09-26")).toBeVisible();
  await expect(page.locator("[data-range]:visible [data-range-label]")).toHaveText("All time · 2015-08-14 to 2026-09-26");
});

test("has one row per published post, including posts with no data", async ({ page }) => {
  await expect(page.locator("[data-range]:visible tbody tr")).toHaveCount(published.length);
  await expect(cell(page, "coding-is-not-for-humans", "sessions")).toHaveText("—");
  await expect(row(page, TAKING).getByText("Taking Responsibility for Your AI-Generated Code")).toBeVisible();
});

test("shows where visits came from, time spent, shares and share-link visits", async ({ page }) => {
  const expected: Record<string, string> = {
    sessions: "15",
    direct: "5",
    social: "7",
    search: "—",
    referral: "1",
    other: "2",
    "share-visits": "1",
    time: "1m 05s",
    shares: "5",
    "shares-native": "3",
    "shares-copy": "2",
  };
  for (const [col, text] of Object.entries(expected)) {
    await expect(cell(page, TAKING, col), col).toHaveText(text);
  }
  await expect(cell(page, TAKING, "sources")).toHaveText("linkedin.com 7, share 1, (not set) 1");
});

test("switches range with library toggle buttons", async ({ page }) => {
  const week = page.getByRole("button", { name: "7 days" });
  const all = page.getByRole("button", { name: "All time" });
  await expect(all).toHaveAttribute("aria-pressed", "true");
  await expect(week).toHaveAttribute("aria-pressed", "false");
  await expect(week).toHaveAttribute("data-ui", "button");

  await week.click();
  await expect(week).toHaveAttribute("aria-pressed", "true");
  await expect(all).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("[data-range]:visible [data-range-label]")).toHaveText("Last 7 days · 2026-09-19 to 2026-09-26");
  await expect(cell(page, TAKING, "sessions")).toHaveText("4");
  await expect(cell(page, TS, "sessions")).toHaveText("—");
});

test("sorts by sessions by default and by shares on request", async ({ page }) => {
  const first = () => page.locator("[data-range]:visible tbody tr").first();
  await expect(first()).toHaveAttribute("data-post", TAKING);
  await page.getByRole("button", { name: "Shares" }).click();
  await expect(page.getByRole("button", { name: "Shares" })).toHaveAttribute("aria-pressed", "true");
  await expect(first()).toHaveAttribute("data-post", TS);
});

test("explains how to get data when the report is missing", async ({ page }) => {
  await page.goto("/analytics/missing");
  await expect(page.getByText("gh workflow run traffic-report.yml")).toBeVisible();
  await expect(page.locator("table")).toHaveCount(0);
});

test("never reaches the production build", () => {
  expect(fs.existsSync("dist/index.html"), "run astro build first").toBe(true);
  expect(fs.existsSync("dist/analytics")).toBe(false);
  expect(fs.readFileSync("dist/sitemap-0.xml", "utf8")).not.toContain("nathantranquilla.me/analytics");
});
