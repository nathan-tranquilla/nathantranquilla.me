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
 * The beacon is inspected and then aborted, so this records nothing in GA4.
 * The workflow also runs on a daily cron, and a synthetic view per day on one
 * post would quietly distort which article looks most read.
 */
test("the deployed site sends a page view to the live property", async ({ page }) => {
  const tagScript: string[] = [];
  const hits: URL[] = [];

  // Catch the hit, read it, and stop it before it reaches Google.
  await page.route("**/g/collect*", (route) => {
    hits.push(new URL(route.request().url()));
    return route.abort();
  });

  page.on("request", (r) => {
    if (r.url().includes("googletagmanager.com/gtag/js")) tagScript.push(r.url());
  });

  await page.goto("/blogs/taking-responsibility-for-your-ai-generated-code/");
  await page.waitForTimeout(5000);

  expect(tagScript, "gtag was never loaded").not.toHaveLength(0);
  expect(hits, "no page view was attempted").not.toHaveLength(0);

  const hit = hits[0];
  expect(hit.searchParams.get("tid")).toBe("G-MCZFYVP6CG");
  expect(hit.searchParams.get("en")).toBe("page_view");
  expect(hit.searchParams.get("dl")).toContain("nathantranquilla.me");
});
