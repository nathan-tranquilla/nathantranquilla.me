import { test, expect } from "@playwright/test";
import fs from "node:fs";

// A production build served from localhost (astro preview, a colleague's
// machine, a CI smoke run) used to load gtag and report real page views into
// the live property. isProd is decided at build time and says nothing about
// where the HTML is later served from.
const BUILT = "dist/blogs/taking-responsibility-for-your-ai-generated-code/index.html";

test.beforeAll(() => {
  if (!fs.existsSync(BUILT)) {
    throw new Error(`${BUILT} is missing. Run \`astro build\` before the suite.`);
  }
});

test("the built page loads no analytics script unconditionally", () => {
  const html = fs.readFileSync(BUILT, "utf8");
  // a bare tag would fetch and fire wherever the file is served from
  expect(html).not.toMatch(/<script[^>]+src="https:\/\/www\.googletagmanager\.com/);
});

test("analytics is gated on the production hostname", () => {
  const html = fs.readFileSync(BUILT, "utf8");
  expect(html).toContain("G-MCZFYVP6CG");
  expect(html).toContain("nathantranquilla.me");
  expect(html).toMatch(/hostname/);
});

test("nothing is requested from googletagmanager when served locally", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("googletagmanager")) requests.push(r.url());
  });
  await page.goto("/blogs/taking-responsibility-for-your-ai-generated-code/");
  await page.waitForTimeout(700);
  expect(requests).toEqual([]);
});

test("but it does fire on the production hostname", async ({ page }) => {
  const html = fs.readFileSync(BUILT, "utf8");
  const requests: string[] = [];

  // Serve the real built page under the real origin, so the guard sees the
  // hostname it is looking for. Without this the suite could not tell a
  // working guard from analytics being switched off everywhere.
  await page.route("https://nathantranquilla.me/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: html })
  );
  await page.route("https://www.googletagmanager.com/**", (route) => {
    requests.push(route.request().url());
    return route.abort();
  });

  await page.goto("https://nathantranquilla.me/blogs/taking-responsibility-for-your-ai-generated-code/");
  await page.waitForTimeout(700);

  expect(requests.length).toBeGreaterThan(0);
  expect(requests[0]).toContain("G-MCZFYVP6CG");
});
