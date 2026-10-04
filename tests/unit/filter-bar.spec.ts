import { test, expect, type Page } from "@playwright/test";

// UI library: FilterBar, the blog index's control bar. On a phone the chips
// live in a native popover opened by a "Filter" button (popovertarget; light
// dismiss and Escape come from the browser; the open/close animation is CSS).
// On a desktop the same chips sit inline in one row, with no button and no
// popup. The result count sits on the right, and the bar is sticky just under
// the site header. No fades: the design is hard-edged.
const bar = '[data-ui="filter-bar"]';
const panel = `${bar} [data-filter-panel]`;
const toggle = `${bar} [data-filter-toggle]`;

const noFades = (page: Page) =>
  page.locator(`${bar}, ${bar} *`).evaluateAll((els) =>
    els
      .map((e) => getComputedStyle(e))
      .filter((s) => (s.maskImage && s.maskImage !== "none") || (s.webkitMaskImage && s.webkitMaskImage !== "none")).length
  );

test("the /ui showcase shows the filter bar", async ({ page }) => {
  await page.goto("/ui");
  await expect(page.locator(bar).first()).toBeVisible();
  await expect(page.locator(`${bar} [data-filter-count]`).first()).toBeVisible();
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 414, height: 800 } });

  test("the chips sit in a popover that the Filter button opens", async ({ page }) => {
    await page.goto("/blogs/");
    const button = page.locator(toggle);
    await expect(button).toBeVisible();
    await expect(page.locator(panel)).toBeHidden();
    const target = await button.getAttribute("popovertarget");
    expect(await page.locator(panel).getAttribute("id")).toBe(target);
    expect(await page.locator(panel).getAttribute("popover")).not.toBeNull();

    await button.click();
    await expect(page.locator(panel)).toBeVisible();
    expect(await page.locator(panel).evaluate((el) => el.matches(":popover-open"))).toBe(true);
  });

  test("choosing a chip in the popover filters, and the button says what is selected", async ({ page }) => {
    await page.goto("/blogs/");
    await page.locator(toggle).click();
    await page.locator('[data-ui="filter-chip"][data-label="Finance"]').click();
    await expect(page.locator(toggle)).toContainText("Finance");
    const shown = await page.locator('[data-ui="post-entry"]:not([data-out])').count();
    await expect(page.locator(`${bar} [data-filter-count]`)).toHaveText(new RegExp(`^${shown} of `));
  });

  test("Escape and a tap outside close the popover", async ({ page }) => {
    await page.goto("/blogs/");
    await page.locator(toggle).click();
    await expect(page.locator(panel)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator(panel)).toBeHidden();
    await page.locator(toggle).click();
    await expect(page.locator(panel)).toBeVisible();
    await page.mouse.click(5, 790);
    await expect(page.locator(panel)).toBeHidden();
  });

  test("the page never scrolls sideways, and nothing fades", async ({ page }) => {
    await page.goto("/blogs/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBe(0);
    expect(await noFades(page)).toBe(0);
  });

  test("the bar stays pinned under the header while the list scrolls", async ({ page }) => {
    await page.goto("/blogs/");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    const [barTop, navHeight] = await page.evaluate(
      (sel) => [
        document.querySelector(sel)!.getBoundingClientRect().top,
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-height")),
      ],
      bar
    );
    expect(Math.abs(barTop - navHeight)).toBeLessThanOrEqual(1);
  });
});

test.describe("on a desktop", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("the chips sit inline in one row, with no Filter button", async ({ page }) => {
    await page.goto("/blogs/");
    await expect(page.locator(toggle)).toBeHidden();
    await expect(page.locator(panel)).toBeVisible();
    const tops = await page
      .locator(`${bar} [data-ui="filter-chip"]`)
      .evaluateAll((els) => [...new Set(els.map((e) => Math.round(e.getBoundingClientRect().top)))]);
    expect(tops).toHaveLength(1);
    expect(await noFades(page)).toBe(0);
  });
});

test("the count says how many posts are showing, and updates as you filter", async ({ page }) => {
  await page.goto("/blogs/");
  const count = page.locator(`${bar} [data-filter-count]`);
  const total = await page.locator('[data-ui="post-entry"]').count();
  await expect(count).toHaveText(`${total} of ${total}`);
  await expect(count).toHaveAttribute("aria-live", "polite");
  await page.locator('[data-ui="filter-chip"][data-label="Finance"]').click();
  const shown = await page.locator('[data-ui="post-entry"]:not([data-out])').count();
  await expect(count).toHaveText(`${shown} of ${total}`);
});
