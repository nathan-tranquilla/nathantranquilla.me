import { test, expect } from "@playwright/test";
import { TAGS } from "../../src/utils/tags";

// UI library: FilterChip, a toggle for filtering the blog index by tag.
// Phase 1 is the look only, shown in /ui for approval: an "All" chip plus one
// chip per approved tag, each with its post count, in pressed and unpressed
// states. No filtering behaviour yet.
const row = '[data-ui="filter-row"]';
const chip = '[data-ui="filter-chip"]';

test("the /ui showcase has a filter row: All plus every approved tag, with counts", async ({ page }) => {
  await page.goto("/ui");
  const first = page.locator(row).first();
  await expect(first).toBeVisible();
  const labels = await first.locator(chip).evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.label));
  expect(labels).toEqual(["All", ...TAGS]);
  for (const tag of TAGS) {
    await expect(first.locator(`${chip}[data-label="${tag}"] [data-count]`), tag).toHaveText(/^\d+$/);
  }
});

test("chips are toggle buttons that say whether they are pressed", async ({ page }) => {
  await page.goto("/ui");
  const chips = page.locator(chip);
  const roles = await chips.evaluateAll((els) =>
    els.map((e) => [e.tagName, e.getAttribute("type"), e.getAttribute("aria-pressed")])
  );
  expect(roles.length).toBeGreaterThan(0);
  for (const [tag, type, pressed] of roles) {
    expect(tag).toBe("BUTTON");
    expect(type).toBe("button");
    expect(["true", "false"]).toContain(pressed);
  }
  // the showcase shows both states
  await expect(page.locator(`${chip}[aria-pressed="true"]`).first()).toBeVisible();
  await expect(page.locator(`${chip}[aria-pressed="false"]`).first()).toBeVisible();
});

for (const scheme of ["light", "dark"] as const) {
  test.describe(`${scheme} mode`, () => {
    test.use({ colorScheme: scheme });

    test("pressed and unpressed chips look different, and both are readable", async ({ page }) => {
      await page.goto("/ui");
      const looks = await page.locator(chip).evaluateAll((els) => {
        const rgb = (v: string) => (v.match(/[\d.]+/g) ?? []).map(Number);
        const opaque = (v: number[]) => v.length === 3 || (v.length === 4 && v[3] > 0);
        const lum = ([r, g, b]: number[]) => {
          const f = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        };
        const bgOf = (el: Element) => {
          for (let e: Element | null = el; e; e = e.parentElement) {
            const v = rgb(getComputedStyle(e).backgroundColor);
            if (opaque(v)) return v.slice(0, 3);
          }
          return [255, 255, 255];
        };
        const ratio = (fg: number[], bg: number[]) => {
          const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
          return (a + 0.05) / (b + 0.05);
        };
        return els.map((e) => {
          const bg = bgOf(e);
          const count = e.querySelector("[data-count]");
          return {
            pressed: e.getAttribute("aria-pressed"),
            bg: bg.join(","),
            label: ratio(rgb(getComputedStyle(e).color).slice(0, 3), bg),
            count: count ? ratio(rgb(getComputedStyle(count).color).slice(0, 3), bg) : 99,
          };
        });
      });
      const on = looks.filter((l) => l.pressed === "true");
      const off = looks.filter((l) => l.pressed === "false");
      expect(new Set(on.map((l) => l.bg)).size).toBe(1);
      expect(off.map((l) => l.bg)).not.toContain(on[0].bg);
      for (const l of looks) {
        expect(l.label, `label ${l.pressed}`).toBeGreaterThanOrEqual(4.5);
        expect(l.count, `count ${l.pressed}`).toBeGreaterThanOrEqual(4.5);
      }
    });
  });
}

// The count must read as a count, not as part of the label: clearly smaller,
// with no divider (the author tried one and didn't want it).
test("the count is visibly distinct from the label", async ({ page }) => {
  await page.goto("/ui");
  const looks = await page.locator('[data-ui="filter-chip"] [data-count]').evaluateAll((counts) =>
    counts.map((c) => {
      const chip = getComputedStyle(c.closest('[data-ui="filter-chip"]')!);
      const s = getComputedStyle(c);
      return { label: parseFloat(chip.fontSize), count: parseFloat(s.fontSize), divider: parseFloat(s.borderLeftWidth) || 0 };
    })
  );
  expect(looks.length).toBeGreaterThan(0);
  for (const l of looks) {
    expect(l.count).toBeLessThanOrEqual(l.label * 0.85);
    expect(l.divider).toBe(0);
  }
});
