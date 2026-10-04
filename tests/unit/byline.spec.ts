import { test, expect, type Page } from "@playwright/test";
import { formatPostDate, isoPostDate } from "../../src/utils/dates";

// The byline under a post title: author and date, set slightly into the page
// (a letterpress inset), with the date written for people, not as 2026/10/01.
const POST = "/blogs/making-my-money-decisions-mechanical-with-ai-and-plain-text-accounting/";

test.describe("post dates", () => {
  test("read as words, the same everywhere", () => {
    expect(formatPostDate("2026/10/01")).toBe("October 1, 2026");
    expect(formatPostDate("2026/09/23")).toBe("September 23, 2026");
    expect(formatPostDate("2025/12/31")).toBe("December 31, 2025");
  });

  test("never shift a day with the reader's or builder's time zone", () => {
    // Midnight-local parsing turns Jan 1 into Dec 31 west of UTC.
    expect(formatPostDate("2026/01/01")).toBe("January 1, 2026");
    expect(isoPostDate("2026/01/01")).toBe("2026-01-01");
  });
});

const byline = (page: Page) => page.locator("article > header [data-byline]");

test("the post byline shows the date in words, as a machine-readable <time>", async ({ page }) => {
  await page.goto(POST);
  await expect(byline(page)).toContainText("Nathan Tranquilla");
  const time = byline(page).locator("time");
  await expect(time).toHaveText("October 1, 2026");
  await expect(time).toHaveAttribute("datetime", "2026-10-01");
  await expect(page.locator("article > header")).not.toContainText("2026/10/01");
});

test("the homepage and blog list use the same date wording", async ({ page }) => {
  for (const url of ["/", "/blogs/"]) {
    await page.goto(url);
    await expect(page.getByText("October 1, 2026").first(), url).toBeVisible();
  }
});

for (const scheme of ["light", "dark"] as const) {
  test.describe(`${scheme} mode`, () => {
    test.use({ colorScheme: scheme });

    test("the byline is inset into the page and still readable", async ({ page }) => {
      await page.goto(POST);
      const s = await byline(page).evaluate((el) => {
        const rgb = (v: string) => (v.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
        const lum = ([r, g, b]: number[]) => {
          const f = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        };
        let bg = [255, 255, 255];
        for (let e: Element | null = el; e; e = e.parentElement) {
          const c = getComputedStyle(e).backgroundColor;
          const v = (c.match(/[\d.]+/g) ?? []).map(Number);
          if (v.length === 3 || (v.length === 4 && v[3] > 0)) { bg = v.slice(0, 3); break; }
        }
        const fg = rgb(getComputedStyle(el).color);
        const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
        return { shadow: getComputedStyle(el).textShadow, contrast: (a + 0.05) / (b + 0.05) };
      });
      expect(s.shadow, "letterpress highlight").not.toBe("none");
      expect(s.contrast).toBeGreaterThanOrEqual(4.5);
    });
  });
}
