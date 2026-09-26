import { test, expect } from "@playwright/test";
import fs from "node:fs";
import { viewCountPlacement } from "../../src/utils/views";

// A small count tells a new reader nobody came, so it stays hidden. Once it
// is worth showing it sits at the foot of the post, and a large one moves up
// under the title.
test.describe("placement rule", () => {
  for (const [count, placement] of [
    [0, "hidden"],
    [99, "hidden"],
    [100, "bottom"],
    [999, "bottom"],
    [1000, "top"],
    [25000, "top"],
  ] as const) {
    test(`${count} views -> ${placement}`, () => {
      expect(viewCountPlacement(count)).toBe(placement);
    });
  }
});

// The layout reads public/data/analytics.json on each request, so these specs
// swap in their own counts and put back whatever was there.
test.describe("on a post", () => {
  test.describe.configure({ mode: "serial" });

  const FILE = "public/data/analytics.json";
  const POPULAR = "/blogs/taking-responsibility-for-your-ai-generated-code";
  const MODEST = "/blogs/typescript-has-a-big-problem";
  const QUIET = "/blogs/coding-is-not-for-humans";
  let original: string | null = null;

  test.beforeAll(() => {
    original = fs.existsSync(FILE) ? fs.readFileSync(FILE, "utf8") : null;
    fs.mkdirSync("public/data", { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify({ [POPULAR]: 1500, [MODEST]: 250, [QUIET]: 42 }));
  });

  test.afterAll(() => {
    if (original === null) fs.rmSync(FILE, { force: true });
    else fs.writeFileSync(FILE, original);
  });

  const header = (page) => page.locator("article > header [data-view-count]");
  const footer = (page) => page.locator("article > footer [data-view-count]");

  test("1,000+ views show under the title, not at the foot", async ({ page }) => {
    await page.goto(`${POPULAR}/`);
    await expect(header(page)).toHaveText("1,500 views");
    await expect(footer(page)).toHaveCount(0);
  });

  test("100 to 999 views show at the foot only", async ({ page }) => {
    await page.goto(`${MODEST}/`);
    await expect(footer(page)).toHaveText("250 views");
    await expect(header(page)).toHaveCount(0);
  });

  test("under 100 views show nowhere", async ({ page }) => {
    await page.goto(`${QUIET}/`);
    await expect(page.locator("[data-view-count]")).toHaveCount(0);
    await expect(page.getByText(/\bviews\b/)).toHaveCount(0);
  });
});
