import { test, expect, type Page } from "@playwright/test";

// UI library: FilterBar, the blog index's control bar. The chips sit inline
// in one row, on a tray: the yellow field with a 1px navy border (chips in
// paper on it); where
// they don't fit (a phone) the row scrolls sideways within it, and each end
// of the tray that still hides chips gets an inverted square with a chevron.
// The tray is what makes the squares read as the ends of a scrolling window
// before anyone scrolls. No
// fades: the design is hard-edged. The result count sits on the right, and
// the bar is sticky just under the site header.
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
  await expect(page.locator(`${bar} [data-filter-count]`).first()).toBeVisible();
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

  test("the cue is an inverted chevron square, the tray's full height, that never catches a tap", async ({ page }) => {
    await page.goto("/blogs/");
    await expect(page.locator(cue("end"))).toBeVisible();
    const look = await page.evaluate(
      ([cueSel, scrollSel]) => {
        const el = document.querySelector<HTMLElement>(cueSel)!;
        const c = el.getBoundingClientRect();
        const s = document.querySelector(scrollSel)!.getBoundingClientRect();
        return {
          text: el.textContent!.trim(),
          right: Math.abs(c.right - s.right),
          top: Math.abs(c.top - s.top),
          bottom: Math.abs(c.bottom - s.bottom),
          events: getComputedStyle(el).pointerEvents,
        };
      },
      [cue("end"), scroller]
    );
    expect(look.text).toBe("›");
    expect(look.right).toBeLessThanOrEqual(1);
    expect(look.top).toBeLessThanOrEqual(1);
    expect(look.bottom).toBeLessThanOrEqual(1);
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

// The tray: the yellow field inside a 1px navy border (both from tokens, so
// dark mode flips them), with the arrow squares in the border's colour; the
// chips, pressed or not, distinct from the tray, and clear of its edges.
for (const scheme of ["light", "dark"] as const) {
  test.describe(`${scheme} mode, on a phone`, () => {
    test.use({ colorScheme: scheme, viewport: { width: 414, height: 800 } });

    test("the chips sit on a yellow tray with a navy border", async ({ page }) => {
      await page.goto("/blogs/");
      await expect(page.locator(cue("end"))).toBeVisible();
      const t = await page.evaluate(
        ([traySel, barSel]) => {
          const rgb = (v: string) => (v.match(/[\d.]+/g) ?? []).map(Number).slice(0, 3);
          const lum = ([r, g, b]: number[]) => {
            const f = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
            return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
          };
          const ratio = (a: number[], b: number[]) => {
            const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
            return (x + 0.05) / (y + 0.05);
          };
          const cueEl = document.querySelector<HTMLElement>('[data-filter-more="end"]')!;
          const tray = document.querySelector<HTMLElement>(traySel)!;
          const s = getComputedStyle(tray);
          const fill = (sel: string) => getComputedStyle(document.querySelector(sel)!).backgroundColor;
          const chip = document.querySelector(`${traySel} [data-ui="filter-chip"]`)!.getBoundingClientRect();
          const r = tray.getBoundingClientRect();
          return {
            borders: [s.borderTopWidth, s.borderRightWidth, s.borderBottomWidth, s.borderLeftWidth].map(parseFloat),
            tray: s.backgroundColor,
            token: Object.fromEntries(
              ["--bg-secondary", "--accent-bg"].map((name) => {
                const probe = document.createElement("div");
                probe.style.backgroundColor = `var(${name})`;
                document.body.append(probe);
                const c = getComputedStyle(probe).backgroundColor;
                probe.remove();
                return [name, c];
              })
            ),
            styles: [s.borderTopStyle, s.borderRightStyle, s.borderBottomStyle, s.borderLeftStyle],
            borderColours: [s.borderTopColor, s.borderRightColor, s.borderBottomColor, s.borderLeftColor],
            cue: getComputedStyle(document.querySelector('[data-filter-more="end"]')!).backgroundColor,
            bar: fill(barSel),
            off: fill(`${traySel} [data-ui="filter-chip"][aria-pressed="false"]`),
            on: fill(`${traySel} [data-ui="filter-chip"][aria-pressed="true"]`),
            above: chip.top - r.top,
            below: r.bottom - chip.bottom,
            chevron: ratio(rgb(getComputedStyle(cueEl).color), rgb(getComputedStyle(cueEl).backgroundColor)),
            squareOnTray: ratio(rgb(getComputedStyle(cueEl).backgroundColor), rgb(s.backgroundColor)),
          };
        },
        ["[data-filter-track]", bar]
      );
      expect(t.borders).toEqual([1, 1, 1, 1]);
      expect(new Set(t.styles)).toEqual(new Set(["solid"]));
      expect(new Set(t.borderColours), "the border is navy (--accent-bg)").toEqual(new Set([t.token["--accent-bg"]]));
      expect(t.tray, "the tray is filled").not.toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
      expect(t.tray, "the tray stands apart from the bar").not.toBe(t.bar);
      expect(t.tray, "the tray is the yellow field").toBe(t.token["--bg-secondary"]);
      expect(t.cue, "the arrow squares are the border's colour").toBe(t.token["--accent-bg"]);
      expect(t.cue, "the arrow squares stand apart from the tray").not.toBe(t.tray);
      expect(t.off, "an unpressed chip stands apart from the tray").not.toBe(t.tray);
      expect(t.on, "a pressed chip stands apart from the tray").not.toBe(t.tray);
      expect(t.chevron, "the chevron reads on its square").toBeGreaterThanOrEqual(4.5);
      expect(t.squareOnTray, "the square reads on the tray").toBeGreaterThanOrEqual(3);
      expect(t.above, "room above the chips").toBeGreaterThanOrEqual(3);
      expect(t.below, "room below the chips").toBeGreaterThanOrEqual(3);
    });
  });
}
