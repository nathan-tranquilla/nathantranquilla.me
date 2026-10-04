import { test, expect, type Page } from "@playwright/test";

// UI library: FilterBar, the blog index's control bar: the chips alone,
// across the column, no tray. Where they don't fit on one line (a phone)
// they wrap, so every chip is visible above the bar's rule: nothing scrolls
// sideways. No fades: the design is hard-edged. The bar sits in the page and
// scrolls away with it. The result count is not in the bar: it captions the list,
// just below it ("Showing N of M posts").
const bar = '[data-ui="filter-bar"]';

const noFades = (page: Page) =>
  page.locator(`${bar}, ${bar} *`).evaluateAll((els) =>
    els
      .map((e) => getComputedStyle(e))
      .filter((s) => (s.maskImage && s.maskImage !== "none") || (s.webkitMaskImage && s.webkitMaskImage !== "none")).length
  );

test("the /ui showcase shows the filter bar", async ({ page }) => {
  await page.goto("/ui");
  await expect(page.locator(bar).first()).toBeVisible();
  await expect(page.locator(`${bar} [data-ui="filter-row"]`).first()).toBeVisible();
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 414, height: 800 } });

  test("every chip is visible inside the bar, wrapped onto lines, with nothing to scroll", async ({ page }) => {
    await page.goto("/blogs/");
    await expect(page.locator(`${bar} [data-filter-toggle]`)).toHaveCount(0);
    await expect(page.locator(`${bar} [popover]`)).toHaveCount(0);
    await expect(page.locator(`${bar} [data-filter-more]`), "no scroll cues").toHaveCount(0);
    const r = await page.evaluate((barSel) => {
      const b = document.querySelector(barSel)!;
      const box = b.getBoundingClientRect();
      const rule = box.bottom - parseFloat(getComputedStyle(b).borderBottomWidth);
      const chips = [...b.querySelectorAll('[data-ui="filter-chip"]')].map((c) => c.getBoundingClientRect());
      const scrollers = [...b.querySelectorAll<HTMLElement>("*")].filter((e) => e.scrollWidth > e.clientWidth + 1);
      return {
        lines: new Set(chips.map((c) => Math.round(c.top))).size,
        allInside: chips.every((c) => c.left >= box.left - 0.5 && c.right <= box.right + 0.5 && c.bottom <= rule),
        allOnScreen: chips.every((c) => c.left >= 0 && c.right <= innerWidth),
        scrollers: scrollers.length,
      };
    }, bar);
    expect(r.lines, "the chips wrap onto more than one line").toBeGreaterThan(1);
    expect(r.allInside, "every chip sits inside the bar, above its rule").toBe(true);
    expect(r.allOnScreen).toBe(true);
    expect(r.scrollers, "nothing in the bar scrolls sideways").toBe(0);
  });

  test("the page never scrolls sideways, and nothing fades", async ({ page }) => {
    await page.goto("/blogs/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBe(0);
    expect(await noFades(page)).toBe(0);
  });

  test("the bar is part of the page: it scrolls away with the list, not pinned", async ({ page }) => {
    await page.goto("/blogs/");
    const before = await page.locator(bar).evaluate((el) => el.getBoundingClientRect().top);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    const [after, position] = await page.locator(bar).evaluate((el) => [el.getBoundingClientRect().top, getComputedStyle(el).position]);
    expect(position).not.toMatch(/sticky|fixed/);
    expect(after, "it scrolled off the top").toBeLessThan(0);
    expect(before).toBeGreaterThan(0);
  });
});

test.describe("on a desktop", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("the chips sit inline in one row, with no Filter button", async ({ page }) => {
    await page.goto("/blogs/");
    await expect(page.locator(`${bar} [data-filter-toggle]`)).toHaveCount(0);
    const tops = await page
      .locator(`${bar} [data-ui="filter-chip"]`)
      .evaluateAll((els) => [...new Set(els.map((e) => Math.round(e.getBoundingClientRect().top)))]);
    expect(tops).toHaveLength(1);
    expect(await noFades(page)).toBe(0);
  });
});

test("the count captions the list: below the bar, above the posts, right-aligned, and updates as you filter", async ({ page }) => {
  await page.goto("/blogs/");
  const count = page.locator("[data-filter-count]");
  const total = await page.locator('[data-ui="post-entry"]').count();
  await expect(count).toHaveText(`Showing ${total} of ${total} posts`);
  await expect(count).toHaveAttribute("aria-live", "polite");
  await expect(page.locator(`${bar} [data-filter-count]`), "not in the bar").toHaveCount(0);
  const where = await page.evaluate((barSel) => {
    const r = (sel: string) => document.querySelector(sel)!.getBoundingClientRect();
    const c = r("[data-filter-count]");
    const b = r(barSel);
    const list = r("[data-filterable]");
    const first = r('[data-ui="post-entry"]');
    const text = document.createRange();
    text.selectNodeContents(document.querySelector("[data-filter-count]")!);
    return {
      belowBar: c.top >= b.bottom,
      abovePosts: c.bottom <= first.top,
      rightGap: Math.abs(list.right - text.getBoundingClientRect().right),
    };
  }, bar);
  expect(where.belowBar).toBe(true);
  expect(where.abovePosts).toBe(true);
  expect(where.rightGap, "flush with the list's right edge").toBeLessThanOrEqual(1);

  await page.locator('[data-ui="filter-chip"][data-label="Finance"]').click();
  const shown = await page.locator('[data-ui="post-entry"]:not([data-out])').count();
  await expect(count).toHaveText(`Showing ${shown} of ${total} posts`);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the count is hidden with the rest of the filter", async ({ page }) => {
    await page.goto("/blogs/");
    await expect(page.locator("[data-filter-count]")).toBeHidden();
  });
});

// No tray: the chips sit straight on the page in their own approved look
// (the yellow field in light mode), with no frame or fill around them.
for (const scheme of ["light", "dark"] as const) {
  test.describe(`${scheme} mode, on a phone`, () => {
    test.use({ colorScheme: scheme, viewport: { width: 414, height: 800 } });

    test("the chips sit on the page, no tray, in their own colours", async ({ page }) => {
      await page.goto("/blogs/");
      const t = await page.evaluate((barSel) => {
        const probe = document.createElement("div");
        probe.style.backgroundColor = "var(--bg-secondary)";
        document.body.append(probe);
        const field = getComputedStyle(probe).backgroundColor;
        probe.remove();
        // every box from the bar down to the chip row: no frame, no fill
        const row = document.querySelector(`${barSel} [data-ui="filter-row"]`)!;
        const boxes: Element[] = [];
        for (let e: Element | null = row; e; e = e.parentElement) {
          boxes.push(e);
          if (e.matches(barSel)) break;
        }
        const page = getComputedStyle(document.body).backgroundColor;
        return {
          sides: boxes.flatMap((e) => {
            const s = getComputedStyle(e);
            const bottom = e.matches(barSel) ? 0 : parseFloat(s.borderBottomWidth); // the bar's rule is allowed
            return [parseFloat(s.borderTopWidth), parseFloat(s.borderRightWidth), bottom, parseFloat(s.borderLeftWidth)];
          }),
          fills: boxes.map((e) => getComputedStyle(e).backgroundColor).filter((c) => c !== "rgba(0, 0, 0, 0)" && c !== page),
          chip: getComputedStyle(document.querySelector(`${barSel} [data-ui="filter-chip"][aria-pressed="false"]`)!)
            .backgroundColor,
          field,
          tray: document.querySelectorAll(`${barSel} [data-filter-tray]`).length,
        };
      }, bar);
      expect(t.tray, "no tray element").toBe(0);
      expect(t.sides.every((w) => w === 0), "no frame around the chips").toBe(true);
      expect(t.fills, "no fill but the page's").toEqual([]);
      expect(t.chip, "chips keep their own fill").toBe(t.field);
    });
  });
}

// The chips run the full width of the column.
for (const width of [414, 1280]) {
  test(`at ${width}px the chips run the full width of the column`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/blogs/");
    const r = await page.evaluate((barSel) => {
      const rect = (sel: string) => document.querySelector(sel)!.getBoundingClientRect();
      const b = rect(barSel);
      const s = rect(`${barSel} [data-ui="filter-row"]`);
      return { left: Math.abs(s.left - b.left), right: Math.abs(b.right - s.right) };
    }, bar);
    expect(r.left).toBeLessThanOrEqual(1);
    expect(r.right).toBeLessThanOrEqual(1);
  });
}
