import { test, expect, type Page } from "@playwright/test";
import { postHash } from "../helpers/posts";

const FILE = "taking-responsibility-for-your-ai-generated-code.md";
const POST = "/blogs/taking-responsibility-for-your-ai-generated-code/";
const TITLE = "Taking Responsibility for Your AI-Generated Code";

// Records gtag calls where analytics would otherwise be absent (it only loads
// on the production hostname), and optionally stubs the native share sheet.
async function stub(page: Page, { share }: { share: boolean }) {
  await page.addInitScript((withShare) => {
    (window as any).__gtag = [];
    (window as any).gtag = (...args: unknown[]) => (window as any).__gtag.push(args);
    (window as any).__shared = [];
    if (withShare) {
      (navigator as any).share = async (data: unknown) => {
        (window as any).__shared.push(data);
      };
    } else {
      delete (Navigator.prototype as any).share;
    }
  }, share);
}

const shareButton = (page: Page) =>
  page.locator("article > header").getByRole("button", { name: /Share/ });

// Shares hand out the post's short link, not its full URL.
const shortLink = `https://nathantranquilla.me/${postHash(FILE)}`;

test.describe("desktop", () => {
  test.use({ hasTouch: false, permissions: ["clipboard-read", "clipboard-write"] });

  test("the share button sits in the post header", async ({ page }) => {
    await page.goto(POST);
    await expect(shareButton(page)).toBeVisible();
    await expect(page.locator(".blog-body").getByRole("button", { name: /Share/ })).toHaveCount(0);
  });

  test("is styled by the shared Button, like Work With Me", async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto(POST);
    const look = (el: Element) => {
      const s = getComputedStyle(el);
      return [
        s.backgroundColor, s.color, s.borderTopWidth, s.borderTopColor, s.fontFamily,
        s.fontSize, s.textTransform, s.letterSpacing, s.paddingTop, s.paddingLeft, s.borderRadius,
      ];
    };
    const workWithMe = page.locator("header").getByRole("link", { name: "Work With Me" }).first();
    await expect(workWithMe).toBeVisible();
    expect(await shareButton(page).evaluate(look)).toEqual(await workWithMe.evaluate(look));
  });

  test("the arrow is as tall as the button's capitals and sits on the baseline", async ({ page }) => {
    await page.goto(POST);
    await page.evaluate(() => document.fonts.ready);
    const m = await shareButton(page).evaluate((button) => {
      const arrow = button.querySelector("svg");
      if (!arrow) return null;
      const ctx = document.createElement("canvas").getContext("2d")!;
      ctx.font = getComputedStyle(button).font;
      const cap = ctx.measureText("H");
      // a zero-size inline box marks the text baseline
      const probe = document.createElement("span");
      probe.style.cssText = "display:inline-block;width:0;height:0";
      button.append(probe);
      const baseline = probe.getBoundingClientRect().bottom;
      probe.remove();
      const box = arrow.getBoundingClientRect();
      return { cap: cap.actualBoundingBoxAscent, height: box.height, bottom: box.bottom, baseline };
    });
    expect(m, "Share has no SVG arrow").not.toBeNull();
    expect(Math.abs(m!.height - m!.cap)).toBeLessThan(0.75);
    expect(Math.abs(m!.bottom - m!.baseline)).toBeLessThan(0.75);
    await expect(shareButton(page)).toHaveAccessibleName("Share");
  });

  test("copies the short link even where navigator.share exists", async ({ page }) => {
    await stub(page, { share: true });
    await page.goto(POST);
    await page.waitForLoadState("networkidle");
    await shareButton(page).click();

    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(shortLink);
    expect(await page.evaluate(() => (window as any).__shared)).toEqual([]);
  });

  test("confirms the copy with a toast that announces and then leaves", async ({ page }) => {
    await page.goto(POST);
    await page.waitForLoadState("networkidle");
    await shareButton(page).click();

    const toast = page.getByRole("status").filter({ hasText: "Link copied" });
    await expect(toast).toBeVisible();
    await expect(toast).toBeHidden({ timeout: 3500 });
  });

  test("sends one GA4 share event keyed on the post hash", async ({ page }) => {
    await stub(page, { share: false });
    await page.goto(POST);
    await page.waitForLoadState("networkidle");
    await shareButton(page).click();

    const events = await page.evaluate(() =>
      (window as any).__gtag.filter((c: unknown[]) => c[0] === "event")
    );
    expect(events).toEqual([
      [
        "event",
        "share",
        { method: "clipboard", content_type: "article", item_id: postHash(FILE) },
      ],
    ]);
  });

  test("without analytics, sharing neither throws nor reaches GA", async ({ page }) => {
    const errors: Error[] = [];
    const requests: string[] = [];
    page.on("pageerror", (e) => errors.push(e));
    page.on("request", (r) => {
      if (/googletagmanager|google-analytics/.test(r.url())) requests.push(r.url());
    });
    await page.goto(POST);
    await page.waitForLoadState("networkidle");
    await shareButton(page).click();
    await expect(page.getByRole("status").filter({ hasText: "Link copied" })).toBeVisible();

    expect(errors).toEqual([]);
    expect(requests).toEqual([]);
  });
});

test.describe("mobile", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 375, height: 800 } });

  test("opens the native share sheet with the title and short link", async ({ page }) => {
    await stub(page, { share: true });
    await page.goto(POST);
    await page.waitForLoadState("networkidle");
    await shareButton(page).click();

    expect(await page.evaluate(() => (window as any).__shared)).toEqual([
      { title: TITLE, url: shortLink },
    ]);
    await expect(page.getByRole("status").filter({ hasText: "Link copied" })).toHaveCount(0);

    const events = await page.evaluate(() =>
      (window as any).__gtag.filter((c: unknown[]) => c[0] === "event")
    );
    expect(events).toEqual([
      [
        "event",
        "share",
        { method: "native", content_type: "article", item_id: postHash(FILE) },
      ],
    ]);
  });

  test("the header does not scroll sideways at phone width", async ({ page }) => {
    await page.goto(POST);
    await expect(shareButton(page)).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBe(0);
  });
});
