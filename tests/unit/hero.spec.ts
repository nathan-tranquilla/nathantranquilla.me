import { test, expect } from "@playwright/test";

test.describe("Homepage hero", () => {
  test("headlines with the name alone, without a job title", async ({ page }) => {
    await page.goto("/");

    const headline = page.getByRole("heading", { level: 1 });
    await expect(headline).toHaveText("Nathan Tranquilla");
    await expect(headline).not.toContainText("Web Developer");
  });

  test("subtitles with a centred tagline, not a services pitch", async ({ page }) => {
    await page.goto("/");

    // string matching normalises whitespace; an anchored regex would not
    const tagline = page.getByText(
      "Type safety and AI in software development, and the seam where they meet.",
      { exact: true }
    );
    await expect(tagline).toBeVisible();
    // it sits under a centred headline, so it has to be centred too
    await expect(tagline).toHaveCSS("text-align", "center");
    await expect(page.locator("main")).not.toContainText("small businesses");
  });

  test("has no Work With Me call to action", async ({ page }) => {
    await page.goto("/");

    // The header and footer CTAs live outside <main>; this scopes the
    // assertion to the hero without reaching into them.
    await expect(
      page.locator("main").getByRole("link", { name: "Work With Me" })
    ).toHaveCount(0);
  });

  // While the photo loads, the frame shows the photo's own backdrop, a grey
  // that darkens slightly left to right, so there is no paper-coloured flash.
  test("the avatar frame shows the photo's backdrop gradient while it loads", async ({ page }) => {
    await page.route(/Profile.*\.webp|_image/, () => {}); // hold the photo back
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const img = page.locator("figure img");
    const box = await img.boundingBox();
    expect(box?.width).toBeGreaterThan(150);
    expect(box?.height).toBeGreaterThan(150);
    expect(await img.evaluate((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0)).toBe(false);
    expect(await img.evaluate((el) => getComputedStyle(el).backgroundImage)).toMatch(/^linear-gradient\(to right, rgb/);
  });

  test("the gradient's ends match the photo's left and right edges", async ({ page }) => {
    await page.goto("/");
    const img = page.locator("figure img");
    await expect.poll(() => img.evaluate((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0)).toBe(true);
    const { left, right, stops } = await img.evaluate((el) => {
      const im = el as HTMLImageElement;
      const c = document.createElement("canvas");
      c.width = im.naturalWidth;
      c.height = im.naturalHeight;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(im, 0, 0);
      // the backdrop down each side, above the shoulders
      const strip = (fx: number) => {
        const sum = [0, 0, 0];
        const ys = [0.02, 0.1, 0.2, 0.3, 0.4];
        for (const fy of ys) {
          const d = ctx.getImageData(Math.floor(fx * (c.width - 1)), Math.floor(fy * c.height), 1, 1).data;
          for (let i = 0; i < 3; i++) sum[i] += d[i] / ys.length;
        }
        return sum;
      };
      const stops = [...getComputedStyle(im).backgroundImage.matchAll(/rgb\((\d+), (\d+), (\d+)\)/g)].map((m) => m.slice(1, 4).map(Number));
      return { left: strip(0.02), right: strip(0.98), stops };
    });
    expect(stops.length).toBeGreaterThanOrEqual(2);
    const [first, last] = [stops[0], stops[stops.length - 1]];
    for (let i = 0; i < 3; i++) {
      expect(Math.abs(first[i] - left[i]), `left channel ${i}: ${first} vs photo ${left}`).toBeLessThan(6);
      expect(Math.abs(last[i] - right[i]), `right channel ${i}: ${last} vs photo ${right}`).toBeLessThan(6);
    }
  });
});
