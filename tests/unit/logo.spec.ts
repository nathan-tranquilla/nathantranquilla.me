import { test, expect } from "@playwright/test";

// The site header is a direct child of body; article headers elsewhere are not.
const SITE_HEADER = "body > header";
const LOGO_LINK = `${SITE_HEADER} > a[href='/']`;

test.describe("Header logo", () => {
  test("sets the initials in lowercase rather than drawing them", async ({ page }) => {
    await page.goto("/");

    const mark = page.locator(`${LOGO_LINK} [data-logo='nt']`);
    await expect(mark).toBeVisible();
    await expect(mark).toHaveText("nt");
    // nothing is drawn any more, so there should be no SVG in the lockup
    await expect(page.locator(`${LOGO_LINK} svg`)).toHaveCount(0);
  });

  test("the mark is set in Spectral, not the site's display face", async ({ page }) => {
    await page.goto("/");

    const family = await page
      .locator(`${LOGO_LINK} [data-logo='nt']`)
      .evaluate((el) => getComputedStyle(el).fontFamily);
    expect(family).toMatch(/Spectral/i);
  });

  test("the home link is labelled for screen readers", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator(LOGO_LINK)).toHaveAccessibleName(/Nathan Tranquilla/i);
  });

  test("no longer sets the domain as a wordmark", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator(SITE_HEADER)).not.toContainText("nathantranquilla.me");
  });
});
