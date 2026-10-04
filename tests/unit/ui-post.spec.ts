import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import { POSTS_DIR } from "../helpers/posts";

// UI library: Tag (one chip), PostMeta (author, date, tags) and PostEntry
// (one index row: linked title plus PostMeta). The home page, the blog list
// and the post page all draw from them, so tags, metadata and entries cannot
// drift between pages.
const POST = "/blogs/making-my-money-decisions-mechanical-with-ai-and-plain-text-accounting/";
const TITLE = "Making My Money Decisions Mechanical With AI and Plain-Text Accounting";
const TAG_NAMES = ["AI", "Finance", "Coding"];

test("the /ui showcase shows a tag, post metadata and a post entry", async ({ page }) => {
  await page.goto("/ui");
  for (const ui of ["tag", "post-meta", "post-entry"]) {
    await expect(page.locator(`[data-ui="${ui}"]`).first(), ui).toBeVisible();
  }
});

// Every tag chip on a page comes from the Tag component.
const strayTags = (page: Page, names: string[]) =>
  page.evaluate((names) => {
    return [...document.querySelectorAll("main *")]
      .filter((el) => el.children.length === 0 && names.includes(el.textContent?.trim() ?? ""))
      // a tag name inside a Tag, or a FilterChip's label, is the library's own
      .filter((el) => !el.closest('[data-ui="tag"], [data-ui="filter-chip"]'))
      .map((el) => `${el.tagName} "${el.textContent?.trim()}"`);
  }, names);

for (const url of ["/", "/blogs/"]) {
  test(`${url} draws every post row from PostEntry and every tag from Tag`, async ({ page }) => {
    await page.goto(url);
    const rows = page.locator('main a[href^="/blogs/"]:not([href="/blogs/"])');
    const entries = page.locator('[data-ui="post-entry"]');
    await expect(entries.first()).toBeVisible();
    expect(await entries.count()).toBe(await rows.count());
    expect(await entries.locator('[data-ui="post-meta"]').count()).toBe(await entries.count());
    expect(await strayTags(page, TAG_NAMES)).toEqual([]);
  });
}

test("the post page shows its metadata through PostMeta and Tag", async ({ page }) => {
  await page.goto(POST);
  const meta = page.locator('article > header [data-ui="post-meta"]');
  await expect(meta).toHaveCount(1);
  await expect(meta.locator('[data-ui="tag"]')).toHaveText(["AI", "Finance", "Automation"]);
  await expect(page.locator("article > header").getByRole("button", { name: /Share/ })).toBeVisible();
  expect(await strayTags(page, TAG_NAMES)).toEqual([]);
});

for (const width of [375, 1280]) test(`an entry looks the same on the home page and the blog list at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  const look = async (url: string) => {
    await page.goto(url);
    const entry = page.locator('[data-ui="post-entry"]', { hasText: TITLE });
    return entry.evaluate((el) => {
      const pick = (sel: string, props: string[]) => {
        const c = getComputedStyle(el.querySelector(sel)!);
        return props.map((p) => c.getPropertyValue(p));
      };
      return {
        title: pick("a > :first-child", ["font-family", "font-size", "line-height", "color", "margin-bottom"]),
        byline: pick("[data-byline]", ["font-family", "font-size", "color", "text-shadow"]),
        tag: pick('[data-ui="tag"]', ["font-family", "font-size", "border-top-width", "padding-left"]),
        padding: getComputedStyle(el).paddingBottom,
      };
    });
  };
  expect(await look("/")).toEqual(await look("/blogs/"));
});

test("index bylines carry the letterpress inset too", async ({ page }) => {
  for (const url of ["/", "/blogs/"]) {
    await page.goto(url);
    const shadow = await page.locator('[data-ui="post-entry"] [data-byline]').first().evaluate((el) => getComputedStyle(el).textShadow);
    expect(shadow, url).not.toBe("none");
  }
});

for (const scheme of ["light", "dark"] as const) {
  test.describe(`${scheme} mode`, () => {
    test.use({ colorScheme: scheme });

    test("tags are readable on the paper ground and on the yellow band", async ({ page }) => {
      await page.goto("/ui");
      const ratios = await page.locator('[data-ui="tag"]').evaluateAll((tags) => {
        const rgb = (v: string) => (v.match(/[\d.]+/g) ?? []).map(Number);
        const lum = ([r, g, b]: number[]) => {
          const f = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        };
        const bgOf = (el: Element) => {
          for (let e: Element | null = el; e; e = e.parentElement) {
            const v = rgb(getComputedStyle(e).backgroundColor);
            if (v.length === 3 || (v.length === 4 && v[3] > 0)) return v.slice(0, 3);
          }
          return [255, 255, 255];
        };
        return tags.map((t) => {
          const [a, b] = [lum(rgb(getComputedStyle(t).color).slice(0, 3)), lum(bgOf(t))].sort((x, y) => y - x);
          return +((a + 0.05) / (b + 0.05)).toFixed(2);
        });
      });
      expect(ratios.length).toBeGreaterThanOrEqual(2);
      for (const r of ratios) expect(r).toBeGreaterThanOrEqual(4.5);
    });
  });
}

// A tag's fill must differ from whatever surrounds it: yellow chips on the
// paper ground, paper chips on the yellow band. Same-colour-on-same-colour
// leaves only an outline.
for (const scheme of ["light", "dark"] as const) {
  test.describe(`${scheme} mode`, () => {
    test.use({ colorScheme: scheme });

    for (const url of ["/ui", "/", "/blogs/"]) {
      test(`tags on ${url} stand apart from their background`, async ({ page }) => {
        await page.goto(url);
        const same = await page.locator('[data-ui="tag"]').evaluateAll((tags) =>
          tags
            .filter((t) => {
              const fill = getComputedStyle(t).backgroundColor;
              for (let e = t.parentElement; e; e = e.parentElement) {
                const bg = getComputedStyle(e).backgroundColor;
                if (bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") return bg === fill;
              }
              return false;
            })
            .map((t) => t.textContent?.trim())
        );
        expect(same).toEqual([]);
      });
    }
  });
}

// A post's tags stay on one line in its header on a phone, as they do in the
// blog list, so the list-to-post morph never stretches them. When they don't
// fit beside the Share button, Share moves under them instead.
for (const width of [375, 414]) {
  test(`every post's header tags sit on one line at ${width}px, with Share still on screen`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    const posts = fs
      .readdirSync(POSTS_DIR)
      .filter((f) => f.endsWith(".md") && !/^draft:\s*true/m.test(fs.readFileSync(`${POSTS_DIR}/${f}`, "utf8")));
    const wrapped: string[] = [];
    for (const f of posts) {
      await page.goto(`/blogs/${f.replace(/\.md$/, "")}/`);
      const r = await page.evaluate(() => {
        const meta = document.querySelector('article > header [data-ui="post-meta"]')!;
        const tops = [...meta.querySelectorAll('[data-ui="tag"]')].map((t) => Math.round(t.getBoundingClientRect().top));
        const share = meta.querySelector('[data-ui="button"]')!.getBoundingClientRect();
        return { lines: new Set(tops).size, shareOnScreen: share.left >= 0 && share.right <= innerWidth };
      });
      if (r.lines !== 1 || !r.shareOnScreen) wrapped.push(`${f}: ${r.lines} lines, share on screen ${r.shareOnScreen}`);
    }
    expect(wrapped).toEqual([]);
  });
}
