import { test, expect } from "@playwright/test";

/**
 * Runs against the deployed site, after Pages publishes.
 *
 * The suite in tests/unit can prove analytics does NOT fire locally, but it
 * cannot prove it DOES fire in production, because it only ever serves a local
 * origin. Analytics gated on hostname can therefore die silently and every
 * other test stays green. That nearly happened: the first version of the guard
 * emitted a block statement that parsed cleanly and did nothing.
 *
 * This records one real page view each deploy, which is the cost of knowing.
 */
test("the deployed site reports a page view to the live property", async ({ page }) => {
  const tagScript: string[] = [];
  const hits: URL[] = [];

  page.on("request", (r) => {
    const url = r.url();
    if (url.includes("googletagmanager.com/gtag/js")) tagScript.push(url);
    if (url.includes("/g/collect")) hits.push(new URL(url));
  });

  await page.goto("/blogs/taking-responsibility-for-your-ai-generated-code/");
  await page.waitForTimeout(5000);

  expect(tagScript, "gtag was never loaded").not.toHaveLength(0);
  expect(hits, "no page view was sent").not.toHaveLength(0);

  const hit = hits[0];
  expect(hit.searchParams.get("tid")).toBe("G-MCZFYVP6CG");
  expect(hit.searchParams.get("en")).toBe("page_view");
  expect(hit.searchParams.get("dl")).toContain("nathantranquilla.me");
});
