import { test, expect } from "@playwright/test";

test.describe("SEO - Homepage", () => {
  test("has correct meta tags", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Basic meta tags
    await expect(page).toHaveTitle(/nathantranquilla\.me/);
    const description = await page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute("content", /Next-Gen Web Development/);

    const author = await page.locator('meta[name="author"]');
    await expect(author).toHaveAttribute("content", "Nathan Tranquilla");

    const keywords = await page.locator('meta[name="keywords"]');
    await expect(keywords).toHaveAttribute(
      "content",
      /ReScript.*TypeScript alternatives.*strong type systems/
    );

    const robots = await page.locator('meta[name="robots"]');
    await expect(robots).toHaveAttribute(
      "content",
      "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    );
  });

  test("has correct Open Graph tags", async ({ page }) => {
    await page.goto("/");

    const ogTitle = await page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute("content", /nathantranquilla\.me/);

    const ogDescription = await page.locator('meta[property="og:description"]');
    await expect(ogDescription).toHaveAttribute("content", /.+/);

    const ogImage = await page.locator('meta[property="og:image"]');
    await expect(ogImage).toHaveAttribute("content", /https:\/\/nathantranquilla\.me/);

    const ogUrl = await page.locator('meta[property="og:url"]');
    await expect(ogUrl).toHaveAttribute("content", "https://nathantranquilla.me/");

    const ogType = await page.locator('meta[property="og:type"]');
    await expect(ogType).toHaveAttribute("content", "website");

    const ogSiteName = await page.locator('meta[property="og:site_name"]');
    await expect(ogSiteName).toHaveAttribute("content", "nathantranquilla.me");
  });

  test("has correct Twitter Card tags", async ({ page }) => {
    await page.goto("/");

    const twitterCard = await page.locator('meta[name="twitter:card"]');
    await expect(twitterCard).toHaveAttribute("content", "summary_large_image");

    const twitterTitle = await page.locator('meta[name="twitter:title"]');
    await expect(twitterTitle).toHaveAttribute("content", /nathantranquilla\.me/);

    const twitterDescription = await page.locator('meta[name="twitter:description"]');
    await expect(twitterDescription).toHaveAttribute("content", /.+/);

    const twitterImage = await page.locator('meta[name="twitter:image"]');
    await expect(twitterImage).toHaveAttribute("content", /https:\/\/nathantranquilla\.me/);
  });

  test("has theme-color meta tags", async ({ page }) => {
    await page.goto("/");

    const themeColors = await page.locator('meta[name="theme-color"]').all();
    expect(themeColors.length).toBeGreaterThanOrEqual(1);
  });

  test("has canonical URL", async ({ page }) => {
    await page.goto("/");

    const canonical = await page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute("href", "https://nathantranquilla.me/");
  });

  test("has sitemap link", async ({ page }) => {
    await page.goto("/");

    const sitemap = await page.locator('link[rel="sitemap"]');
    await expect(sitemap).toHaveAttribute("href", "/sitemap-index.xml");
  });

  test("has BreadcrumbList schema", async ({ page }) => {
    await page.goto("/");

    const schema = await page.locator('script[type="application/ld+json"]').first();
    const schemaContent = await schema.textContent();
    const schemaJson = JSON.parse(schemaContent || "{}");

    expect(schemaJson["@context"]).toBe("https://schema.org");
    expect(schemaJson["@type"]).toBe("BreadcrumbList");
    expect(schemaJson.itemListElement).toBeDefined();
    expect(Array.isArray(schemaJson.itemListElement)).toBe(true);
    expect(schemaJson.itemListElement[0].name).toBe("Home");
  });
});

test.describe("SEO - Blog Post", () => {
  test("has correct meta tags for article", async ({ page }) => {
    await page.goto("/blogs/the-4-pillars-of-next-gen-web-dev/");

    await expect(page).toHaveTitle(/The 4 Pillars Of Next-Gen Web Dev/);

    const description = await page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute("content", /.+/);

    const ogType = await page.locator('meta[property="og:type"]');
    await expect(ogType).toHaveAttribute("content", "article");
  });

  test("has enhanced Article schema", async ({ page }) => {
    await page.goto("/blogs/the-4-pillars-of-next-gen-web-dev/");

    // Get all JSON-LD scripts and find the Article schema
    const scripts = await page.locator('script[type="application/ld+json"]').all();
    let articleSchema = null;

    for (const script of scripts) {
      const content = await script.textContent();
      const json = JSON.parse(content || "{}");
      if (json["@type"] === "Article") {
        articleSchema = json;
        break;
      }
    }

    expect(articleSchema).not.toBeNull();
    expect(articleSchema?.["@context"]).toBe("https://schema.org");
    expect(articleSchema?.["@type"]).toBe("Article");

    // Check required fields
    expect(articleSchema?.headline).toBeDefined();
    expect(articleSchema?.description).toBeDefined();
    expect(articleSchema?.datePublished).toBeDefined();
    expect(articleSchema?.url).toBeDefined();

    // Check enhanced fields
    expect(articleSchema?.author).toBeDefined();
    expect(articleSchema?.author["@type"]).toBe("Person");
    expect(articleSchema?.author.name).toBeDefined();
    expect(articleSchema?.author.url).toBe("https://nathantranquilla.me/about");

    expect(articleSchema?.publisher).toBeDefined();
    expect(articleSchema?.publisher["@type"]).toBe("Organization");
    expect(articleSchema?.publisher.name).toBe("Nathan Tranquilla");
    expect(articleSchema?.publisher.logo).toBeDefined();

    expect(articleSchema?.image).toBeDefined();
    expect(articleSchema?.dateModified).toBeDefined();
    expect(articleSchema?.mainEntityOfPage).toBeDefined();
  });

  test("has BreadcrumbList schema with blog title", async ({ page }) => {
    await page.goto("/blogs/the-4-pillars-of-next-gen-web-dev/");

    const scripts = await page.locator('script[type="application/ld+json"]').all();
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
    expect(breadcrumbSchema?.itemListElement).toBeDefined();
    expect(breadcrumbSchema?.itemListElement.length).toBeGreaterThanOrEqual(2);

    // Check breadcrumb structure
    expect(breadcrumbSchema?.itemListElement[0].name).toBe("Home");
    expect(breadcrumbSchema?.itemListElement[1].name).toBe("Blogs");
  });

  test("has correct canonical URL for blog post", async ({ page }) => {
    await page.goto("/blogs/the-4-pillars-of-next-gen-web-dev/");

    const canonical = await page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute(
      "href",
      "https://nathantranquilla.me/blogs/the-4-pillars-of-next-gen-web-dev/"
    );
  });
});

test.describe("SEO - About Page", () => {
  test("has correct meta tags", async ({ page }) => {
    await page.goto("/about/");

    await expect(page).toHaveTitle(/About Nathan Tranquilla/);

    const description = await page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute(
      "content",
      /pioneering Next-Gen Web Development/
    );
  });

  test("has Person schema", async ({ page }) => {
    await page.goto("/about/");

    const scripts = await page.locator('script[type="application/ld+json"]').all();
    let personSchema = null;

    for (const script of scripts) {
      const content = await script.textContent();
      const json = JSON.parse(content || "{}");
      if (json["@type"] === "Person") {
        personSchema = json;
        break;
      }
    }

    expect(personSchema).not.toBeNull();
    expect(personSchema?.["@context"]).toBe("https://schema.org");
    expect(personSchema?.["@type"]).toBe("Person");

    // Check required fields
    expect(personSchema?.name).toBe("Nathan Tranquilla");
    expect(personSchema?.url).toBe("https://nathantranquilla.me");
    expect(personSchema?.image).toBeDefined();
    expect(personSchema?.jobTitle).toBe("Next-Gen Web Development Consultant");
    expect(personSchema?.description).toBeDefined();
    expect(personSchema?.email).toBe("tranquilla.nathan@pm.me");

    // Check knowsAbout
    expect(personSchema?.knowsAbout).toBeDefined();
    expect(Array.isArray(personSchema?.knowsAbout)).toBe(true);
    expect(personSchema?.knowsAbout).toContain("ReScript");
    expect(personSchema?.knowsAbout).toContain("TypeScript");
    expect(personSchema?.knowsAbout).toContain("Web Development");
  });

  test("has BreadcrumbList schema", async ({ page }) => {
    await page.goto("/about/");

    const scripts = await page.locator('script[type="application/ld+json"]').all();
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
    expect(breadcrumbSchema?.itemListElement).toBeDefined();
    expect(breadcrumbSchema?.itemListElement[0].name).toBe("Home");
    expect(breadcrumbSchema?.itemListElement[1].name).toBe("About");
  });
});

test.describe("SEO - Consultation Page", () => {
  test("has correct meta tags", async ({ page }) => {
    await page.goto("/consultation/");

    await expect(page).toHaveTitle(/consultation/i);

    const description = await page.locator('meta[name="description"]');
    const descContent = await description.getAttribute("content");
    expect(descContent).toBeTruthy();
  });

  test("has BreadcrumbList schema", async ({ page }) => {
    await page.goto("/consultation/");

    const scripts = await page.locator('script[type="application/ld+json"]').all();
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
    expect(breadcrumbSchema?.itemListElement[1].name).toBe("Consultation");
  });
});

test.describe("SEO - Internal Links", () => {
  test("blog post has internal links to related posts", async ({ page }) => {
    await page.goto("/blogs/why-rescript-is-next-gen/");

    // Check for internal links
    const internalLinks = await page
      .locator('a[href^="/blogs/"]')
      .filter({ hasText: /.+/ })
      .all();

    expect(internalLinks.length).toBeGreaterThan(0);

    // Verify at least one link goes to another blog post
    const linkHrefs = await Promise.all(
      internalLinks.map((link) => link.getAttribute("href"))
    );

    const hasBlogLinks = linkHrefs.some(
      (href) => href && href.startsWith("/blogs/") && href !== "/blogs/"
    );
    expect(hasBlogLinks).toBe(true);
  });

  test("internal links are valid and reachable", async ({ page }) => {
    await page.goto("/blogs/why-rescript-is-next-gen/");

    // Get all internal blog links
    const internalLinks = await page
      .locator('a[href^="/blogs/"]')
      .filter({ hasText: /.+/ })
      .all();

    // Test first internal link is accessible
    if (internalLinks.length > 0) {
      const firstLink = internalLinks[0];
      const href = await firstLink.getAttribute("href");

      if (href && href !== "/blogs/") {
        await firstLink.click();
        await page.waitForLoadState("networkidle");

        // Verify we navigated to a valid page
        await expect(page).toHaveTitle(/.+/);
        const h1 = await page.locator("h1").first();
        await expect(h1).toBeVisible();
      }
    }
  });
});
