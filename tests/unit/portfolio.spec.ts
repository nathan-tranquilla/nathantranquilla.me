import { test, expect } from "@playwright/test";

test.describe("Portfolio Page", () => {
  test("has its own page with a Portfolio heading", async ({ page }) => {
    await page.goto("/portfolio");

    await expect(page).toHaveTitle(/Portfolio/i);
    await expect(
      page.getByRole("heading", { level: 1, name: "Portfolio" }),
    ).toBeVisible();
  });

  test("lists every project with a link to the live site", async ({ page }) => {
    await page.goto("/portfolio");

    const projects = [
      {
        name: "Magnolia Coast Photography",
        url: "https://magnoliacoastsphotography.com",
      },
      { name: "The Office Lines", url: "https://theofficelines.com" },
    ];

    for (const project of projects) {
      const card = page.locator("article", { hasText: project.name });
      await expect(card).toBeVisible();
      await expect(
        card.getByRole("img", { name: `${project.name} screenshot` }),
      ).toBeVisible();
      await expect(
        card.getByRole("link", { name: /Visit Site/ }),
      ).toHaveAttribute("href", project.url);
    }
  });

  test("has BreadcrumbList schema", async ({ page }) => {
    await page.goto("/portfolio");

    const scripts = await page
      .locator('script[type="application/ld+json"]')
      .all();
    let breadcrumbSchema = null;

    for (const script of scripts) {
      const content = await script.textContent();
      const json = JSON.parse(content || "{}");
      if (json["@type"] === "BreadcrumbList") {
        breadcrumbSchema = json;
        break;
      }
    }

    expect(breadcrumbSchema).not.toBeNull();
    expect(breadcrumbSchema?.itemListElement[0].name).toBe("Home");
    expect(breadcrumbSchema?.itemListElement[1].name).toBe("Portfolio");
  });
});

test.describe("Portfolio navigation", () => {
  test("is reachable from the desktop menu", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");

    const link = page
      .locator("header nav")
      .first()
      .getByRole("link", { name: "Portfolio" });
    await expect(link).toBeVisible();
    await link.click();

    await expect(page).toHaveURL(/\/portfolio\/?$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Portfolio" }),
    ).toBeVisible();
  });

  test("is reachable from the mobile menu", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await page.locator('label[for="menu-toggle"]').click();

    const link = page
      .locator("header nav")
      .last()
      .getByRole("link", { name: "Portfolio" });
    await expect(link).toBeVisible();
    await link.click();

    await expect(page).toHaveURL(/\/portfolio\/?$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Portfolio" }),
    ).toBeVisible();
  });
});

test.describe("Homepage after the move", () => {
  test("no longer renders the portfolio section inline", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Portfolio" })).toHaveCount(
      0,
    );
    await expect(page.getByRole("link", { name: /Visit Site/ })).toHaveCount(0);
  });
});
