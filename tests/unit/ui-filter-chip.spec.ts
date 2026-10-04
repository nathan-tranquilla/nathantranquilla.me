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
            // the count sits on its own filled box, so measure it against that
            count: count ? ratio(rgb(getComputedStyle(count).color).slice(0, 3), bgOf(count)) : 99,
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
// inverted (the number in the chip's colour on a solid fill), and set as a
// segment at the right end of the chip, running its full inner height.
test("the count is a filled segment flush to the chip's right edge, full height", async ({ page }) => {
  await page.goto("/ui");
  const looks = await page.locator('[data-ui="filter-chip"] [data-count]').evaluateAll((counts) =>
    counts.map((c) => {
      const chipEl = c.closest('[data-ui="filter-chip"]')!;
      const chip = getComputedStyle(chipEl);
      const s = getComputedStyle(c);
      const r = c.getBoundingClientRect();
      const k = chipEl.getBoundingClientRect();
      const bw = (v: string) => parseFloat(v) || 0;
      return {
        text: c.textContent?.trim() ?? "",
        label: parseFloat(chip.fontSize),
        count: parseFloat(s.fontSize),
        fill: s.backgroundColor,
        chipFill: chip.backgroundColor,
        top: r.top - (k.top + bw(chip.borderTopWidth)),
        bottom: k.bottom - bw(chip.borderBottomWidth) - r.bottom,
        right: k.right - bw(chip.borderRightWidth) - r.right,
      };
    })
  );
  expect(looks.length).toBeGreaterThan(0);
  for (const l of looks) {
    expect(l.count).toBeLessThanOrEqual(l.label * 0.85);
    expect(l.fill, `${l.text} is filled`).not.toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
    expect(l.fill, `${l.text} differs from the chip`).not.toBe(l.chipFill);
    for (const [edge, gap] of [["top", l.top], ["bottom", l.bottom], ["right", l.right]] as const) {
      expect(Math.abs(gap), `${l.text} ${edge} edge`).toBeLessThanOrEqual(0.5);
    }
  }
});

// The count keeps one colour pattern whether its chip is pressed or not.
for (const scheme of ["light", "dark"] as const) {
  test.describe(`${scheme} mode`, () => {
    test.use({ colorScheme: scheme });

    test("the count looks the same in pressed and unpressed chips", async ({ page }) => {
      await page.goto("/ui");
      const look = (pressed: boolean) =>
        page
          .locator(`[data-ui="filter-chip"][aria-pressed="${pressed}"] [data-count]`)
          .first()
          .evaluate((c) => {
            const s = getComputedStyle(c);
            return [s.backgroundColor, s.color];
          });
      expect(await look(true)).toEqual(await look(false));
    });
  });
}
