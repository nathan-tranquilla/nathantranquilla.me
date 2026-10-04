import { test, expect, type Page } from "@playwright/test";

// Cross-document view transitions (@view-transition in global.css) morph
// matching elements between pages. A post's title, byline and tags each carry
// a name built from its permanent hash, the same on the home page, the blog
// list and the post itself, so each piece travels into place on its own.
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
