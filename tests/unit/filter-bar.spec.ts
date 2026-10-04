import { test, expect, type Page } from "@playwright/test";

// UI library: FilterBar, the blog index's control bar: the chips alone, in
// one row across the column, no tray. Where they don't fit (a phone) the row
// scrolls sideways, and each edge that still hides chips gets a navy square
// with a chevron, a little taller than the chips. No fades: the design is
// hard-edged. The bar is sticky just under the site header. The result count
// is not in the bar: it captions the list, just below it ("Showing N of M
// posts").
const bar = '[data-ui="filter-bar"]';
const scroller = `${bar} [data-filter-scroller]`;
const cue = (side: "start" | "end") => `${bar} [data-filter-more="${side}"]`;

const noFades = (page: Page) =>
  page.locator(`${bar}, ${bar} *`).evaluateAll((els) =>
    els
      .map((e) => getComputedStyle(e))
      .filter((s) => (s.maskImage && s.maskImage !== "none") || (s.webkitMaskImage && s.webkitMaskImage !== "none")).length
  );

test("the /ui showcase shows the filter bar", async ({ page }) => {
  await page.goto("/ui");
  await expect(page.locator(bar).first()).toBeVisible();
  await expect(page.locator(`${bar} [data-filter-scroller] [data-ui="filter-row"]`).first()).toBeVisible();
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 414, height: 800 } });

  test("the chips sit inline in one row, with no Filter button or popover", async ({ page }) => {
    await page.goto("/blogs/");
    await expect(page.locator(`${bar} [data-filter-toggle]`)).toHaveCount(0);
    await expect(page.locator(`${bar} [popover]`)).toHaveCount(0);
    const tops = await page
      .locator(`${bar} [data-ui="filter-chip"]`)
      .evaluateAll((els) => [...new Set(els.map((e) => Math.round(e.getBoundingClientRect().top)))]);
    expect(tops).toHaveLength(1);
  });

  test("the row scrolls sideways; the page never does, and nothing fades", async ({ page }) => {
    await page.goto("/blogs/");
    const [scrollW, clientW] = await page.locator(scroller).evaluate((el) => [el.scrollWidth, el.clientWidth]);
    expect(scrollW).toBeGreaterThan(clientW);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBe(0);
    expect(await noFades(page)).toBe(0);
  });

  test("a solid cue marks whichever edge still hides chips", async ({ page }) => {
    await page.goto("/blogs/");
    await expect(page.locator(cue("end"))).toBeVisible();
    await expect(page.locator(cue("start"))).toBeHidden();
    const fill = await page.locator(cue("end")).evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(fill).not.toMatch(/rgba\(0, 0, 0, 0\)|transparent/);

    await page.locator(scroller).evaluate((el) => el.scrollTo({ left: el.scrollWidth }));
    await expect(page.locator(cue("start"))).toBeVisible();
    await expect(page.locator(cue("end"))).toBeHidden();

    await page.locator(scroller).evaluate((el) => el.scrollTo({ left: el.scrollWidth / 3 }));
    await expect(page.locator(cue("start"))).toBeVisible();
    await expect(page.locator(cue("end"))).toBeVisible();
  });

  test("the cue is a navy chevron square, a little taller than the chips, that never catches a tap", async ({ page }) => {
    await page.goto("/blogs/");
    await expect(page.locator(cue("end"))).toBeVisible();
    const look = await page.evaluate(
      ([cueSel, scrollSel]) => {
        const el = document.querySelector<HTMLElement>(cueSel)!;
        const c = el.getBoundingClientRect();
        const s = document.querySelector(scrollSel)!.getBoundingClientRect();
        const k = document.querySelector(`${scrollSel} [data-ui="filter-chip"]`)!.getBoundingClientRect();
        const probe = document.createElement("div");
        probe.style.backgroundColor = "var(--accent-bg)";
        document.body.append(probe);
        const navy = getComputedStyle(probe).backgroundColor;
        probe.remove();
        return {
          text: el.textContent!.trim(),
          fill: getComputedStyle(el).backgroundColor,
          navy,
          right: Math.abs(c.right - s.right),
          above: k.top - c.top,
          below: c.bottom - k.bottom,
          events: getComputedStyle(el).pointerEvents,
        };
      },
      [cue("end"), scroller]
    );
    expect(look.text).toBe("›");
    expect(look.fill, "navy (--accent-bg)").toBe(look.navy);
    expect(look.right).toBeLessThanOrEqual(1);
    expect(look.above, "taller than the chips, above").toBeGreaterThanOrEqual(2);
    expect(look.below, "taller than the chips, below").toBeGreaterThanOrEqual(2);
    expect(look.events).toBe("none");
  });

  // Finance is last, so it lands at the very end; ReScript is not, so the end
  // cue stays up beside it and must not cover it.
  for (const label of ["Finance", "ReScript"]) {
    test(`a chosen chip that starts off-screen (${label}) is scrolled into view, clear of the cues`, async ({ page }) => {
      await page.goto(`/blogs/?tag=${label.toLowerCase()}`);
      const chip = page.locator(`${bar} [data-ui="filter-chip"][data-label="${label}"]`);
      await expect(chip).toHaveAttribute("aria-pressed", "true");
      await expect
        .poll(() =>
          page.evaluate(
            ([chipSel, scrollSel]) => {
              const k = document.querySelector(chipSel)!.getBoundingClientRect();
              const s = document.querySelector(scrollSel)!.getBoundingClientRect();
              const blockers = [...document.querySelectorAll<HTMLElement>("[data-filter-more]")]
                .filter((e) => e.checkVisibility())
                .map((e) => e.getBoundingClientRect());
              const inside = k.left >= s.left - 1 && k.right <= s.right + 1;
              const clear = blockers.every((b) => k.right <= b.left + 1 || k.left >= b.right - 1);
              return inside && clear;
            },
            [`${bar} [data-ui="filter-chip"][data-label="${label}"]`, scroller]
          )
        )
        .toBe(true);
    });
  }

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
    await expect(page.locator(`${bar} [data-filter-toggle]`)).toHaveCount(0);
    const tops = await page
      .locator(`${bar} [data-ui="filter-chip"]`)
      .evaluateAll((els) => [...new Set(els.map((e) => Math.round(e.getBoundingClientRect().top)))]);
    expect(tops).toHaveLength(1);
    expect(await noFades(page)).toBe(0);
    // everything fits, so no cue shows
    await expect(page.locator(cue("start"))).toBeHidden();
    await expect(page.locator(cue("end"))).toBeHidden();
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
        const boxes = [
          ...document.querySelectorAll<HTMLElement>(`${barSel} [data-filter-track], ${barSel} [data-filter-scroller]`),
        ].map((e) => getComputedStyle(e));
        return {
          borders: boxes.flatMap((s) =>
            [s.borderTopWidth, s.borderRightWidth, s.borderBottomWidth, s.borderLeftWidth].map(parseFloat)
          ),
          fills: boxes.map((s) => s.backgroundColor),
          chip: getComputedStyle(document.querySelector(`${barSel} [data-ui="filter-chip"][aria-pressed="false"]`)!)
            .backgroundColor,
          field,
          tray: document.querySelectorAll(`${barSel} [data-filter-tray]`).length,
        };
      }, bar);
      expect(t.tray, "no tray element").toBe(0);
      expect(new Set(t.borders)).toEqual(new Set([0]));
      expect(new Set(t.fills)).toEqual(new Set(["rgba(0, 0, 0, 0)"]));
      expect(t.chip, "chips keep their own fill").toBe(t.field);
    });
  });
}

// The chip row runs the full width of the column.
for (const width of [414, 1280]) {
  test(`at ${width}px the chip row runs the full width of the column`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/blogs/");
    const r = await page.evaluate((barSel) => {
      const rect = (sel: string) => document.querySelector(sel)!.getBoundingClientRect();
      const b = rect(barSel);
      const s = rect(`${barSel} [data-filter-scroller]`);
      return { left: Math.abs(s.left - b.left), right: Math.abs(b.right - s.right) };
    }, bar);
    expect(r.left).toBeLessThanOrEqual(1);
    expect(r.right).toBeLessThanOrEqual(1);
  });
}
