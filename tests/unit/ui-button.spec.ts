import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";

// Every button on the site goes through the UI library's Button (or, inside
// markdown, its CSS classes). These specs sweep real pages in both color
// schemes, so a hand-rolled or unreadable button fails wherever it appears.
const PAGES = [
  "/",
  "/about/",
  "/blogs/",
  "/blogs/taking-responsibility-for-your-ai-generated-code/",
  "/guides/",
  "/guides/website-buyers-guide/",
  "/consultation/",
  "/portfolio/",
  "/ui",
];

const SCHEMES = ["light", "dark"] as const;

// Runs in the page: WCAG contrast of an element's text (or a given color)
// against its own background, or the nearest opaque ancestor's.
const MEASURE = `
  window.__rgb = (s) => (s.match(/[\\d.]+/g) || []).map(Number);
  window.__opaque = (c) => c.length === 3 || (c.length === 4 && c[3] > 0);
  window.__lum = ([r, g, b]) => {
    const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  window.__bgBehind = (el) => {
    for (let e = el; e; e = e.parentElement) {
      const c = __rgb(getComputedStyle(e).backgroundColor);
      if (__opaque(c)) return c.slice(0, 3);
    }
    return [255, 255, 255];
  };
  window.__contrast = (a, b) => {
    const [x, y] = [__lum(a), __lum(b)].sort((p, q) => q - p);
    return +((x + 0.05) / (y + 0.05)).toFixed(2);
  };
`;

async function open(page: Page, url: string) {
  await page.addInitScript(MEASURE);
  await page.goto(url);
  // hover/focus colors are measured at rest, not mid-transition
  await page.addStyleTag({ content: "*,*::before,*::after{transition:none!important}" });
}

const label = (el: Element) => (el as HTMLElement).innerText?.trim().replace(/\s+/g, " ").slice(0, 30);

for (const scheme of SCHEMES) {
  test.describe(`${scheme} mode`, () => {
    test.use({ colorScheme: scheme, viewport: { width: 1280, height: 900 } });

    for (const url of PAGES) {
      test(`every button on ${url} comes from the UI library`, async ({ page }) => {
        await open(page, url);
        const stray = await page.evaluate(() =>
          [...document.querySelectorAll<HTMLElement>("button, input[type=submit], a")]
            .filter((el) => {
              const s = getComputedStyle(el);
              const r = el.getBoundingClientRect();
              if (!r.width || !el.innerText?.trim() || r.height > 72) return false;
              if (el.tagName !== "A") return true;
              return (window as any).__opaque((window as any).__rgb(s.backgroundColor)) ||
                (parseFloat(s.borderTopWidth) > 0 && parseFloat(s.paddingLeft) >= 12);
            })
            .filter((el) => el.dataset.ui !== "button")
            .map((el) => `${el.tagName} "${el.innerText.trim().slice(0, 30)}"`)
        );
        expect(stray).toEqual([]);
      });

      test(`buttons on ${url} are readable at rest, on hover and on focus`, async ({ page }) => {
        await open(page, url);
        const buttons = page.locator('[data-ui="button"]:visible:not(:disabled):not([aria-disabled="true"])');
        const problems: string[] = [];
        for (const button of await buttons.all()) {
          const name = await button.evaluate(label);
          const text = () =>
            button.evaluate((el) => {
              const w = window as any;
              return w.__contrast(w.__rgb(getComputedStyle(el).color).slice(0, 3), w.__bgBehind(el));
            });

          const rest = await text();
          if (rest < 4.5) problems.push(`${name}: ${rest}:1 at rest`);

          await button.hover();
          const hover = await text();
          if (hover < 4.5) problems.push(`${name}: ${hover}:1 on hover`);
          await page.mouse.move(0, 0);

          await button.focus();
          const ring = await button.evaluate((el) => {
            const w = window as any;
            const s = getComputedStyle(el);
            if (s.outlineStyle === "none" || parseFloat(s.outlineWidth) < 2) return 0;
            return w.__contrast(w.__rgb(s.outlineColor).slice(0, 3), w.__bgBehind(el.parentElement));
          });
          // non-text contrast: 3:1 against what surrounds the button
          if (ring < 3) problems.push(`${name}: focus ring ${ring}:1`);
          await button.blur();
        }
        expect(problems).toEqual([]);
      });
    }
  });
}

test("links render as <a>, actions as <button>, and submit keeps its type", async ({ page }) => {
  await page.goto("/consultation");
  await expect(page.locator('header a[data-ui="button"]', { hasText: "Work With Me" })).toHaveCount(1);
  await expect(page.locator('footer a[data-ui="button"][data-variant="inverse"]')).toHaveCount(1);
  await expect(page.locator('form button[type="submit"][data-ui="button"]')).toHaveCount(1);

  await page.goto("/blogs/taking-responsibility-for-your-ai-generated-code/");
  await expect(page.locator('article > header button[type="button"][data-ui="button"]')).toHaveCount(1);
});

test("the Button component owns its styles and tokens", () => {
  const global = fs.readFileSync("src/styles/global.css", "utf8");
  expect(global).not.toMatch(/data-ui="button"|--button-/);
  const component = fs.readFileSync("src/components/ui/Button.astro", "utf8");
  expect(component).toMatch(/\[data-ui="button"\]/);
  expect(component).toMatch(/--button-primary-bg/);
});

test("a markdown button looks exactly like a component button", async ({ page }) => {
  await page.goto("/blogs/taking-responsibility-for-your-ai-generated-code/");
  const look = (el: Element) => {
    const s = getComputedStyle(el);
    return [s.backgroundColor, s.color, s.borderTopColor, s.fontFamily, s.textTransform, s.paddingLeft, s.textDecorationLine];
  };
  const markdown = page.locator('.blog-body a[data-ui="button"]');
  const component = page.locator('header a[data-ui="button"]', { hasText: "Work With Me" });
  expect(await markdown.evaluate(look)).toEqual(await component.evaluate(look));
});

test("Gumroad's script does not restyle the Buy button", async ({ page }) => {
  // gumroad.js swaps in its own grey, branded button for .gumroad-button links
  await page.goto("/guides/website-buyers-guide/");
  await page.waitForLoadState("networkidle");
  const look = (el: Element) => {
    const s = getComputedStyle(el);
    return [s.backgroundColor, s.color, s.fontFamily, s.textTransform, s.borderTopLeftRadius, s.paddingLeft];
  };
  const buy = page.locator('a[data-ui="button"]', { hasText: /Buy the Guide/i });
  const consult = page.locator('main a[data-ui="button"]', { hasText: /Book a Consultation/i });
  await expect(buy).toHaveCount(1);
  expect(await buy.evaluate(look)).toEqual(await consult.evaluate(look));
});

test.describe("the /ui showcase", () => {
  test("shows every variant as a link, a button and disabled, under pnpm dev", async ({ page }) => {
    const res = await page.goto("/ui");
    expect(res?.status()).toBe(200);
    for (const variant of ["primary", "inverse"]) {
      const v = page.locator(`[data-ui="button"][data-variant="${variant}"]`);
      await expect(v.and(page.locator("a"))).not.toHaveCount(0);
      await expect(v.and(page.locator("button:not(:disabled)"))).not.toHaveCount(0);
      await expect(v.and(page.locator("button:disabled"))).not.toHaveCount(0);
    }
  });

  test("never reaches the production build", () => {
    expect(fs.existsSync("dist/index.html"), "run astro build first").toBe(true);
    expect(fs.existsSync("dist/ui")).toBe(false);
    expect(fs.existsSync("dist/ui.html")).toBe(false);
    expect(fs.readFileSync("dist/sitemap-0.xml", "utf8")).not.toContain("nathantranquilla.me/ui");
  });
});
