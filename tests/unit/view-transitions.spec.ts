import { test, expect, type Page } from "@playwright/test";

// Cross-document view transitions (@view-transition in global.css) morph
// matching elements between pages. A post's title, byline and tags each carry
// a name built from its permanent hash, the same on the home page, the blog
// list and the post itself, so each travels into place on its own. They must
// all move in one shared direction, so nothing crosses anything else.
const HASH = "95cdjm";
const POST = "/blogs/making-my-money-decisions-mechanical-with-ai-and-plain-text-accounting/";
const PAGES = ["/", "/blogs/", POST];
const PARTS = ["title", "byline", "tags"];

const namesOn = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll("*")]
      .map((el) => getComputedStyle(el).viewTransitionName)
      .filter((n) => n && n !== "none")
  );

for (const url of PAGES) {
  test(`${url} names the post's title, byline and tags for the transition`, async ({ page }) => {
    await page.goto(url);
    const names = await namesOn(page);
    for (const part of PARTS) expect(names, `${url} ${part}`).toContain(`post-${HASH}-${part}`);
  });

  test(`${url} never repeats a transition name`, async ({ page }) => {
    // A duplicate name makes the browser skip the whole transition.
    await page.goto(url);
    const names = await namesOn(page);
    const dupes = names.filter((n, i) => names.indexOf(n) !== i);
    expect(dupes).toEqual([]);
  });
}

test("the named pieces carry the post's own text", async ({ page }) => {
  for (const url of PAGES) {
    await page.goto(url);
    const byName = (part: string) =>
      page.locator("*").filter({ has: page.locator(":scope") }).evaluateAll(
        (els, n) => els.find((e) => getComputedStyle(e).viewTransitionName === n)?.textContent ?? "",
        `post-${HASH}-${part}`
      );
    expect(await byName("title"), url).toContain("Making My Money Decisions Mechanical");
    expect(await byName("byline"), url).toContain("October 1, 2026");
    expect(await byName("tags"), url).toContain("Finance");
  }
});

test("the post header moves as its pieces, not as one block", async ({ page }) => {
  await page.goto(POST);
  const headerName = await page.locator("article > header").evaluate((el) => getComputedStyle(el).viewTransitionName);
  expect(headerName).toBe("none");
});

// Where each named piece sits on a page, at the top of the page.
const boxes = async (page: Page, url: string) => {
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  return page.evaluate((hash) => {
    const find = (part: string) =>
      [...document.querySelectorAll("*")].find((e) => getComputedStyle(e).viewTransitionName === `post-${hash}-${part}`)!;
    const box = (el: Element) => {
      const r = el.getBoundingClientRect();
      return { x: r.left, y: r.top, w: r.width, h: r.height };
    };
    return { title: box(find("title")), byline: box(find("byline")), tags: box(find("tags")) };
  }, HASH);
};

for (const width of [375, 414, 1280]) {
  for (const from of ["/", "/blogs/"]) {
    test(`${from} -> post moves every piece in one direction at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const a = await boxes(page, from);
      const b = await boxes(page, POST);
      const moves = PARTS.map((p) => ({ part: p, dx: b[p].x - a[p].x, dy: b[p].y - a[p].y }));
      const dxs = moves.map((m) => m.dx);
      expect(Math.max(...dxs) - Math.min(...dxs), JSON.stringify(moves)).toBeLessThanOrEqual(2);
      const ups = moves.filter((m) => m.dy < -1).length;
      const downs = moves.filter((m) => m.dy > 1).length;
      expect(ups === 0 || downs === 0, JSON.stringify(moves)).toBe(true);

      // A box that keeps its shape scales evenly in the morph; one that
      // changes shape stretches its text.
      for (const part of ["byline", "tags"] as const) {
        const ra = a[part].w / a[part].h;
        const rb = b[part].w / b[part].h;
        expect(Math.abs(ra - rb) / ra, `${part} shape ${ra.toFixed(2)} vs ${rb.toFixed(2)}`).toBeLessThanOrEqual(0.05);
      }
    });
  }
}

test("the Share button fades in on its own", async ({ page }) => {
  await page.goto(POST);
  const name = await page.locator("article > header").getByRole("button", { name: /Share/ }).evaluate((el) => getComputedStyle(el).viewTransitionName);
  expect(name).toBe("post-share");
});
