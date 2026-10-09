import { test, expect } from "@playwright/test";

test.describe("Favicon", () => {
  test("uses the nt mark, not the old logo photo", async ({ page }) => {
    await page.goto("/");

    const icons = page.locator('link[rel="icon"]');
    await expect(icons.first()).toHaveAttribute("href", /favicon-nt/);
    await expect(icons.first()).toHaveAttribute("type", "image/png");

    // every declared icon should point at the new mark
    const hrefs = await icons.evaluateAll((els) =>
      els.map((e) => e.getAttribute("href") || "")
    );
    expect(hrefs.length).toBeGreaterThan(0);
    expect(hrefs.every((h) => /favicon-nt/.test(h))).toBe(true);
    expect(hrefs.some((h) => /logo_/.test(h))).toBe(false);
  });

  test("no stray SVG icon at the root to override the declared PNGs", async ({ page }) => {
    // public/favicon.svg was the Astro starter logo. Browsers auto-discover
    // /favicon.svg and several prefer it over declared PNG icons, so a file
    // sitting there silently wins regardless of what the head says.
    const res = await page.request.get("/favicon.svg");
    expect(res.status()).toBe(404);
  });

  test("every declared icon actually resolves", async ({ page }) => {
    await page.goto("/");

    const hrefs = await page
      .locator('link[rel="icon"], link[rel="apple-touch-icon"], link[rel="shortcut icon"]')
      .evaluateAll((els) => els.map((e) => e.getAttribute("href") || ""));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      const res = await page.request.get(href);
      expect(res.status(), href).toBe(200);
      expect(res.headers()["content-type"], href).toContain("image/png");
    }
  });

  test("shows the parallel-line NT on a navy tile", async ({ page }) => {
    await page.goto("/");

    const href = await page.locator('link[rel="icon"][sizes="512x512"]').getAttribute("href");
    // (327, 67) lands on the top line of the T's crossbar: paper in the new mark, navy
    // in the old typeset "nt". (2, 2) is the tile itself.
    const [line, tile] = await page.evaluate(async (src) => {
      const img = new Image();
      img.src = src!;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      return [
        Array.from(ctx.getImageData(327, 67, 1, 1).data),
        Array.from(ctx.getImageData(2, 2, 1, 1).data),
      ];
    }, href);

    const near = (px: number[], [r, g, b]: number[]) =>
      Math.abs(px[0] - r) + Math.abs(px[1] - g) + Math.abs(px[2] - b) < 12;
    expect(near(line, [0xfa, 0xf8, 0xf0]), `line pixel ${line}`).toBe(true);
    expect(near(tile, [0x12, 0x23, 0x3a]), `tile pixel ${tile}`).toBe(true);
  });

  test("the apple touch icon and shortcut icon also use it", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
      "href",
      /favicon-nt/
    );
    await expect(page.locator('link[rel="shortcut icon"]')).toHaveAttribute(
      "href",
      /favicon-nt/
    );
  });
});
