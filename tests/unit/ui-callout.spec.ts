import { test, expect, type Page } from "@playwright/test";

// UI library: Callout. One band that stands apart from the page (a terms
// list, a note), with a small mono label. Used from Astro pages through
// Callout.astro and from markdown as plain HTML:
//   <aside data-ui="callout"><p data-callout-label>Label</p> ...markdown... </aside>
const POST = "/blogs/taking-responsibility-for-your-ai-generated-code/";

const contrast = (page: Page, sel: string, bgSel: string) =>
  page.evaluate(
    ([sel, bgSel]) => {
      const rgb = (s: string) => (s.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
      const lum = ([r, g, b]: number[]) => {
        const f = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const fg = rgb(getComputedStyle(document.querySelector(sel)!).color);
      const bg = rgb(getComputedStyle(document.querySelector(bgSel)!).backgroundColor);
      const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
      return (a + 0.05) / (b + 0.05);
    },
    [sel, bgSel]
  );

for (const scheme of ["light", "dark"] as const) {
  test.describe(`${scheme} mode`, () => {
    test.use({ colorScheme: scheme });

    test("the /ui showcase has a callout that stands apart from the page", async ({ page }) => {
      await page.goto("/ui");
      const callout = page.locator('[data-ui="callout"]').first();
      await expect(callout).toBeVisible();
      await expect(callout.locator("[data-callout-label]")).toBeVisible();
      const [band, ground] = await callout.evaluate((el) => [
        getComputedStyle(el).backgroundColor,
        getComputedStyle(document.body).backgroundColor,
      ]);
      expect(band).not.toBe(ground);
      expect(band).not.toBe("rgba(0, 0, 0, 0)");
    });

    test("its label and text are readable", async ({ page }) => {
      await page.goto("/ui");
      const cs = '[data-ui="callout"]';
      expect(await contrast(page, `${cs} [data-callout-label]`, cs)).toBeGreaterThanOrEqual(4.5);
      expect(await contrast(page, `${cs} li`, cs)).toBeGreaterThanOrEqual(4.5);
    });
  });
}

test("the label is set in mono capitals, and the band has square corners", async ({ page }) => {
  await page.goto("/ui");
  const label = page.locator('[data-ui="callout"] [data-callout-label]').first();
  const s = await label.evaluate((el) => {
    const c = getComputedStyle(el);
    return { font: c.fontFamily, transform: c.textTransform };
  });
  expect(s.font).toContain("IBM Plex Mono");
  expect(s.transform).toBe("uppercase");
  const radius = await page.locator('[data-ui="callout"]').first().evaluate((el) => getComputedStyle(el).borderTopLeftRadius);
  expect(radius).toBe("0px");
});

// Markdown posts never render Callout.astro, so the blog layout must load
// the callout styles itself.
test("a callout written as HTML in a blog post gets the same look", async ({ page }) => {
  await page.goto("/ui");
  const look = (el: Element) => {
    const c = getComputedStyle(el);
    const l = getComputedStyle(el.querySelector("[data-callout-label]")!);
    return [c.backgroundColor, c.borderTopWidth, c.paddingLeft, l.fontFamily, l.textTransform, l.color];
  };
  const fromUi = await page.locator('[data-ui="callout"]').first().evaluate(look);

  await page.goto(POST);
  const fromPost = await page.evaluate((lookSrc) => {
    const aside = document.createElement("aside");
    aside.dataset.ui = "callout";
    aside.innerHTML = "<p data-callout-label>Terms</p><ul><li>One</li></ul>";
    document.querySelector(".blog-body")!.prepend(aside);
    const c = getComputedStyle(aside);
    const l = getComputedStyle(aside.querySelector("[data-callout-label]")!);
    return [c.backgroundColor, c.borderTopWidth, c.paddingLeft, l.fontFamily, l.textTransform, l.color];
  }, "");
  expect(fromPost).toEqual(fromUi);
});
