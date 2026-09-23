import { test, expect } from "@playwright/test";

test.describe("Homepage hero", () => {
  test("headlines with the name alone, without a job title", async ({ page }) => {
    await page.goto("/");

    const headline = page.getByRole("heading", { level: 1 });
    await expect(headline).toHaveText("Nathan Tranquilla");
    await expect(headline).not.toContainText("Web Developer");
  });

  test("subtitles with a centred tagline, not a services pitch", async ({ page }) => {
    await page.goto("/");

    // string matching normalises whitespace; an anchored regex would not
    const tagline = page.getByText(
      "Type safety and AI in software development, and the seam where they meet.",
      { exact: true }
    );
    await expect(tagline).toBeVisible();
    // it sits under a centred headline, so it has to be centred too
    await expect(tagline).toHaveCSS("text-align", "center");
    await expect(page.locator("main")).not.toContainText("small businesses");
  });

  test("has no Work With Me call to action", async ({ page }) => {
    await page.goto("/");

    // The header and footer CTAs live outside <main>; this scopes the
    // assertion to the hero without reaching into them.
    await expect(
      page.locator("main").getByRole("link", { name: "Work With Me" })
    ).toHaveCount(0);
  });
});
