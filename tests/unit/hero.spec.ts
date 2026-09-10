import { test, expect } from "@playwright/test";

test.describe("Homepage hero", () => {
  test("headlines with the name alone, without a job title", async ({ page }) => {
    await page.goto("/");

    const headline = page.getByRole("heading", { level: 1 });
    await expect(headline).toHaveText("Nathan Tranquilla");
    await expect(headline).not.toContainText("Web Developer");
  });

  test("carries no tagline; the posts below speak for themselves", async ({ page }) => {
    await page.goto("/");

    // the block holding the headline should hold the portrait and the name, nothing else
    const heroBlock = page.locator("h1").locator("..");
    await expect(heroBlock.locator("p")).toHaveCount(0);
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
