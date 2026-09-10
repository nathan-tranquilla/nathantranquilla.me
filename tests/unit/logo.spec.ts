import { test, expect } from "@playwright/test";

// The site header is a direct child of body; article headers elsewhere are not.
const SITE_HEADER = "body > header";
const LOGO_LINK = `${SITE_HEADER} > a[href='/']`;

test.describe("Header logo", () => {
  test("shows the NT monogram mark", async ({ page }) => {
    await page.goto("/");

    const mark = page.locator(`${LOGO_LINK} svg[data-logo='nt']`);
    await expect(mark).toBeVisible();
    await expect(mark).toHaveAttribute("aria-hidden", "true");
  });

  test("the home link is labelled for screen readers", async ({ page }) => {
    await page.goto("/");

    // the mark carries no text, so the link needs its own accessible name
    await expect(page.locator(LOGO_LINK)).toHaveAccessibleName(/Nathan Tranquilla/i);
  });

  test("no longer sets the domain as a wordmark", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator(SITE_HEADER)).not.toContainText("nathantranquilla.me");
  });
});
