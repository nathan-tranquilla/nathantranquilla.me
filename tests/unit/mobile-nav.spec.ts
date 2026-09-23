import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

test.describe("Mobile menu", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator('label[for="menu-toggle"]').click();
  });

  test("separates itself from the page with a rule, not a shadow", async ({ page }) => {
    const panel = page.locator("nav ul").last();
    await expect(panel).toBeVisible();

    // --shadow-* are zeroed in @theme, so shadow-md renders nothing. Depth in
    // this design comes from hairline rules and flat fields.
    await expect(panel).toHaveCSS("box-shadow", "none");
    const borderWidth = await panel.evaluate(
      (el) => getComputedStyle(el).borderBottomWidth
    );
    expect(borderWidth).not.toBe("0px");
  });

  test("its items are divided from one another", async ({ page }) => {
    const items = page.locator("nav ul").last().locator("li");
    await expect(items).toHaveCount(5);
    const second = items.nth(1);
    const top = await second.evaluate((el) => getComputedStyle(el).borderTopWidth);
    expect(top).not.toBe("0px");
  });

  test("hides the page behind it", async ({ page }) => {
    const panel = page.locator("nav ul").last();
    const bg = await panel.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).not.toMatch(/rgba\(.*,\s*0\)/);
  });
});
