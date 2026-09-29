import { test, expect, type Page } from "@playwright/test";

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
  // The frame (border and backdrop) is the figure; the photo fades in over it.
  const frame = (page: Page) => page.locator("figure");
  const photo = (page: Page) => page.locator("figure img");
  const loaded = (page: Page) =>
    photo(page).evaluate((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0);

  test("the avatar frame shows the photo's backdrop gradient while it loads", async ({ page }) => {
    await page.route(/Profile.*\.webp|_image/, () => {}); // hold the photo back
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const box = await frame(page).boundingBox();
    expect(box?.width).toBeGreaterThan(150);
    expect(box?.height).toBeGreaterThan(150);
    expect(await loaded(page)).toBe(false);
    const style = await frame(page).evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundImage, border: s.borderTopWidth };
    });
    expect(style.bg).toMatch(/^linear-gradient\(to right, rgb/);
    expect(style.border).toBe("1px");
    expect(await photo(page).evaluate((el) => getComputedStyle(el).opacity)).toBe("0");
  });

  test("the gradient's ends match the photo's left and right edges", async ({ page }) => {
    await page.goto("/");
    await expect.poll(() => loaded(page)).toBe(true);
    const stops = await frame(page).evaluate((el) =>
      [...getComputedStyle(el).backgroundImage.matchAll(/rgb\((\d+), (\d+), (\d+)\)/g)].map((m) => m.slice(1, 4).map(Number))
    );
    const { left, right } = await photo(page).evaluate((el) => {
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
      return { left: strip(0.02), right: strip(0.98) };
    });
    expect(stops.length).toBeGreaterThanOrEqual(2);
    const [first, last] = [stops[0], stops[stops.length - 1]];
    for (let i = 0; i < 3; i++) {
      expect(Math.abs(first[i] - left[i]), `left channel ${i}: ${first} vs photo ${left}`).toBeLessThan(6);
      expect(Math.abs(last[i] - right[i]), `right channel ${i}: ${last} vs photo ${right}`).toBeLessThan(6);
    }
  });

  // Behind the photo, a slightly darker silhouette of head and shoulders sits
  // exactly where they are in the photo, so it loads "into place".
  const silhouette = (page: Page) => page.locator("figure svg[data-silhouette]");

  test("while the photo loads, a slightly darker silhouette shows in the frame", async ({ page }) => {
    await page.route(/Profile.*\.webp|_image/, () => {}); // hold the photo back
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(silhouette(page)).toBeVisible();
    const fill = await silhouette(page).locator("path").first().evaluate((el) => getComputedStyle(el).fill);
    const shade = (fill.match(/\d+/g) ?? []).slice(0, 3).map(Number);
    const backdrop = [184, 181, 176]; // the gradient's midpoint
    const darker = backdrop.map((c, i) => c - shade[i]);
    for (const d of darker) {
      expect(d, `silhouette ${shade} should be slightly darker than ${backdrop}`).toBeGreaterThanOrEqual(8);
      expect(d).toBeLessThanOrEqual(35);
    }
  });

  test("the silhouette lines up with the head and shoulders in the photo", async ({ page }) => {
    await page.goto("/");
    await expect.poll(() => loaded(page)).toBe(true);
    const svg = await silhouette(page).evaluate((el) => new XMLSerializer().serializeToString(el));
    const iou = await photo(page).evaluate(async (el, svg) => {
      const N = 110;
      const grid = () => {
        const c = document.createElement("canvas");
        c.width = c.height = N;
        return c.getContext("2d", { willReadFrequently: true })!;
      };
      // the person in the photo: pixels that stand apart from the backdrop,
      // which runs from the left edge's grey to the right edge's
      const p = grid();
      p.drawImage(el as HTMLImageElement, 0, 0, N, N);
      const px = (x: number, y: number) => p.getImageData(x, y, 1, 1).data;
      const edge = (x: number) => {
        const s = [0, 0, 0];
        for (const y of [1, 5, 10, 20, 30]) px(x, y).slice(0, 3).forEach((v, i) => (s[i] += v / 5));
        return s;
      };
      const [L, R] = [edge(1), edge(N - 2)];
      const person: boolean[] = [];
      for (let y = 0; y < N; y++)
        for (let x = 0; x < N; x++) {
          const bg = L.map((l, i) => l + ((R[i] - l) * x) / (N - 1));
          const d = px(x, y);
          person.push(Math.hypot(d[0] - bg[0], d[1] - bg[1], d[2] - bg[2]) > 22);
        }
      // the silhouette, rasterised at the same size
      const img = new Image();
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
      await img.decode();
      const s = grid();
      s.drawImage(img, 0, 0, N, N);
      let both = 0, either = 0;
      for (let i = 0; i < N * N; i++) {
        const inSil = s.getImageData(i % N, Math.floor(i / N), 1, 1).data[3] > 127;
        if (inSil && person[i]) both++;
        if (inSil || person[i]) either++;
      }
      return both / either;
    }, svg);
    expect(iou, "overlap between silhouette and person in the photo").toBeGreaterThan(0.85);
  });

  // A quick fade that front-loads the change and eases out: most of it lands
  // at once, the tail settles slowly.
  test("the photo fades in quickly with a slow tail once it loads", async ({ page }) => {
    await page.goto("/");
    await expect.poll(() => loaded(page)).toBe(true);
    await expect.poll(() => photo(page).evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    const t = await photo(page).evaluate((el) => {
      const s = getComputedStyle(el);
      return { property: s.transitionProperty, duration: parseFloat(s.transitionDuration), easing: s.transitionTimingFunction };
    });
    expect(t.property).toContain("opacity");
    // quick to appear, but a long, visible settle at the end
    expect(t.duration).toBeGreaterThanOrEqual(0.9);
    expect(t.duration).toBeLessThanOrEqual(1.6);
    const [x1, y1, x2, y2] = (t.easing.match(/cubic-bezier\(([^)]+)\)/)?.[1] ?? "").split(",").map(Number);
    expect(y1, `ease-out curve expected, got ${t.easing}`).toBeGreaterThan(x1 * 3); // steep start
    expect(y2).toBeCloseTo(1, 1); // lands softly
    expect(x2).toBeLessThan(0.5);
  });

  test("with reduced motion, the photo appears without a fade", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect.poll(() => loaded(page)).toBe(true);
    expect(await photo(page).evaluate((el) => parseFloat(getComputedStyle(el).transitionDuration))).toBe(0);
    await expect.poll(() => photo(page).evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  });

  test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });

    test("the photo still shows", async ({ page }) => {
      await page.goto("/");
      await expect.poll(() => loaded(page)).toBe(true);
      expect(await photo(page).evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    });
  });
});
