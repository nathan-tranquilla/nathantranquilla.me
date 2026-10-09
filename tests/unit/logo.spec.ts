import { test, expect } from "@playwright/test";

// The site header is a direct child of body; article headers elsewhere are not.
const SITE_HEADER = "body > header";
const LOGO_LINK = `${SITE_HEADER} > a[href='/']`;
const MARK = `${LOGO_LINK} svg[data-logo='nt']`;

// The approved "Joined" mark (2026-10-09), copied here on purpose rather than imported
// from src/assets/nt-mark.ts, so the drawing cannot drift without this failing.
const N = "M18 93.5 V20 L64 86 V20";
const T = "M40 20 H88";

test.describe("Header logo", () => {
  test("is the drawn NT mark, not typeset initials", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator(MARK)).toBeVisible();
    await expect(page.locator(LOGO_LINK)).not.toContainText("nt");
  });

  test("draws the approved paths as three parallel lines", async ({ page }) => {
    await page.goto("/");

    // three passes over the N and the T: a wide band, a gap cut out of it, a centre line
    const passes = await page
      .locator(`${MARK} mask path`)
      .evaluateAll((els) =>
        els.map((e) => [e.getAttribute("d"), e.getAttribute("stroke-width"), e.getAttribute("stroke")])
      );
    expect(passes).toEqual([
      [N, "15", "#fff"],
      [T, "15", "#fff"],
      ["M18 95 V20 L64 86 V20", "9", "#000"],
      ["M38.5 20 H89.5", "9", "#000"],
      [N, "3", "#fff"],
      [T, "3", "#fff"],
    ]);
  });

  test("is centred on its lines, not on the drawing grid", async ({ page }) => {
    await page.goto("/");

    // the lines run from x 10.5 to 88 and y 12.5 to 93.5
    await expect(page.locator(MARK)).toHaveAttribute("viewBox", "5.25 9 88 88");
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`takes the header's text colour in ${scheme} mode`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto("/");

      const [ink, text] = await page.evaluate((sel) => {
        const rect = document.querySelector(`${sel} rect`)!;
        const link = document.querySelector("body > header > a[href='/']")!;
        return [getComputedStyle(rect).fill, getComputedStyle(link).color];
      }, MARK);
      expect(ink).toBe(text);
    });
  }

  test("the home link is labelled for screen readers", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator(LOGO_LINK)).toHaveAccessibleName(/Nathan Tranquilla/i);
  });

  test("no longer sets the domain as a wordmark", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator(SITE_HEADER)).not.toContainText("nathantranquilla.me");
  });
});
