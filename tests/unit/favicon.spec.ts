import { test, expect } from "@playwright/test";

test.describe("Favicon", () => {
  test("uses the nt mark, not the old logo photo", async ({ page }) => {
    await page.goto("/");

    const icons = page.locator('link[rel="icon"]');
    await expect(icons.first()).toHaveAttribute("href", /favicon-nt/);
    await expect(icons.first()).toHaveAttribute("type", "image/png");

    // every declared icon should point at the new mark
    const hrefs = await icons.evaluateAll((els) =>
      els.map((e) => e.getAttribute("href") || "")
    );
    expect(hrefs.length).toBeGreaterThan(0);
    expect(hrefs.every((h) => /favicon-nt/.test(h))).toBe(true);
    expect(hrefs.some((h) => /logo_/.test(h))).toBe(false);
  });

  test("no stray SVG icon at the root to override the declared PNGs", async ({ page }) => {
    // public/favicon.svg was the Astro starter logo. Browsers auto-discover
    // /favicon.svg and several prefer it over declared PNG icons, so a file
    // sitting there silently wins regardless of what the head says.
    const res = await page.request.get("/favicon.svg");
    expect(res.status()).toBe(404);
  });

  test("the apple touch icon and shortcut icon also use it", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
      "href",
      /favicon-nt/
    );
    await expect(page.locator('link[rel="shortcut icon"]')).toHaveAttribute(
      "href",
      /favicon-nt/
    );
  });
});
