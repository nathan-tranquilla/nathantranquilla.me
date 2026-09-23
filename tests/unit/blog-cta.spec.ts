import { test, expect } from "@playwright/test";

const POST = "/blogs/taking-responsibility-for-your-ai-generated-code/";

test.describe("Blog post consultation CTA", () => {
  test("offers a consultation link inside the article", async ({ page }) => {
    await page.goto(POST);

    // Header and footer carry their own consultation links; scope to the
    // article so this cannot pass on those.
    const cta = page.locator("article").getByRole("link", { name: /consultation/i });
    await expect(cta).toHaveCount(1);
    await expect(cta).toHaveAttribute("href", "/consultation");
    await expect(cta).toBeVisible();
  });

  test("reads as a button, not as body copy", async ({ page }) => {
    await page.goto(POST);
    const cta = page.locator('article a[href="/consultation"]');

    // .blog-body a underlines every link in a post; a button must opt out.
    await expect(cta).toHaveCSS("text-decoration-line", "none");
    // mono uppercase is the chrome treatment this design uses for controls
    await expect(cta).toHaveCSS("text-transform", "uppercase");
  });

  test("comes after the body of the post, not before it", async ({ page }) => {
    await page.goto(POST);

    // DOM order, not pixel position: the appendix is a scrolling code block,
    // whose box does not reliably reflect where the reader ends up.
    const ctaIsLast = await page.evaluate(() => {
      const article = document.querySelector("article")!;
      const cta = article.querySelector('a[href="/consultation"]')!;
      const appendix = [...article.querySelectorAll("pre")].pop()!;
      // Node.DOCUMENT_POSITION_FOLLOWING === 4
      return (appendix.compareDocumentPosition(cta) & 4) === 4;
    });
    expect(ctaIsLast).toBe(true);
  });

  test("does not appear on other posts", async ({ page }) => {
    await page.goto("/blogs/coding-is-not-for-humans/");
    await expect(
      page.locator("article").getByRole("link", { name: /consultation/i })
    ).toHaveCount(0);
  });
});
