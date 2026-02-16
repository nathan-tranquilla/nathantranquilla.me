import { test, expect } from "@playwright/test";

test.describe("Consultation Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/consultation");
  });

  test.describe("Tab switching", () => {
    test("shows web dev form by default", async ({ page }) => {
      await expect(page.getByTestId("webdev-form")).toBeVisible();
      await expect(page.getByTestId("ai-form")).toBeHidden();
    });

    test("switches to AI form when AI tab is clicked", async ({ page }) => {
      await page.getByRole("button", { name: "AI Consulting" }).click();
      await expect(page.getByTestId("ai-form")).toBeVisible();
      await expect(page.getByTestId("webdev-form")).toBeHidden();
    });

    test("switches back to web dev form", async ({ page }) => {
      await page.getByRole("button", { name: "AI Consulting" }).click();
      await page.getByRole("button", { name: "Web Development" }).click();
      await expect(page.getByTestId("webdev-form")).toBeVisible();
      await expect(page.getByTestId("ai-form")).toBeHidden();
    });
  });

  test.describe("Web Dev form", () => {
    test("renders all fields", async ({ page }) => {
      const form = page.getByTestId("webdev-form");
      await expect(form).toBeVisible();

      await expect(form.getByLabel(/Full Name/)).toBeVisible();
      await expect(form.getByLabel(/Email Address/)).toBeVisible();
      await expect(form.getByLabel(/Company Name/)).toBeVisible();
      await expect(form.getByLabel(/Company Website URL/)).toBeVisible();
      await expect(form.getByLabel(/Your Role in the Company/)).toBeVisible();
      await expect(form.getByLabel(/Annual Company Revenue/)).toBeVisible();
      await expect(form.getByLabel(/Project Budget Range/)).toBeVisible();
      await expect(form.getByLabel(/Brief Description/)).toBeVisible();
      await expect(form.getByLabel(/Project Goals/)).toBeVisible();
      await expect(form.getByLabel(/Timeline/)).toBeVisible();
      await expect(form.getByLabel(/Why Do You Want/)).toBeVisible();
    });

    test("prevents submission when required fields are empty", async ({ page }) => {
      const form = page.getByTestId("webdev-form");
      await form.getByRole("button", { name: "Submit" }).click();
      await expect(page).toHaveURL(/\/consultation/);
    });

    test("can be filled out completely", async ({ page }) => {
      const form = page.getByTestId("webdev-form");
      await form.getByLabel(/Full Name/).fill("Jane Doe");
      await form.getByLabel(/Email Address/).fill("jane@example.com");
      await form.getByLabel(/Company Name/).fill("Acme Corp");
      await form.getByLabel(/Company Website URL/).fill("https://acme.com");
      await form.getByLabel(/Your Role in the Company/).selectOption("CTO/Technical Lead");
      await form.getByLabel(/Annual Company Revenue/).selectOption("$1M – $5M");
      await form.getByLabel(/Project Budget Range/).selectOption("$100k – $200k");
      await form.getByLabel(/Brief Description/).fill("We need to modernize our web stack.");
      await form.getByLabel(/Project Goals/).fill("Migrate to a modern framework.");
      await form.getByLabel(/Timeline/).selectOption("Within 1–3 months");
      await form.getByLabel(/Why Do You Want/).fill("Your blog convinced me.");

      const isValid = await form.evaluate((el: HTMLFormElement) => el.checkValidity());
      expect(isValid).toBe(true);
    });

    test("form action is disabled in dev", async ({ page }) => {
      const form = page.getByTestId("webdev-form");
      const action = await form.getAttribute("action");
      expect(action).toBe("#");
    });
  });

  test.describe("AI Consulting form", () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole("button", { name: "AI Consulting" }).click();
    });

    test("renders all fields", async ({ page }) => {
      const form = page.getByTestId("ai-form");
      await expect(form).toBeVisible();

      await expect(form.getByLabel(/Full Name/)).toBeVisible();
      await expect(form.getByLabel(/Email Address/)).toBeVisible();
      await expect(form.getByLabel(/Company Name/)).toBeVisible();
      await expect(form.getByLabel(/Company Website URL/)).toBeVisible();
      await expect(form.getByLabel(/Your Role in the Company/)).toBeVisible();
      await expect(form.getByLabel(/Industry/)).toBeVisible();
      await expect(form.getByLabel(/Company Size/)).toBeVisible();
      await expect(form.getByLabel(/What area of your business/)).toBeVisible();
      await expect(form.getByLabel(/Current challenges/)).toBeVisible();
      await expect(form.getByLabel(/Have you used AI tools/)).toBeVisible();
      await expect(form.getByLabel(/What does success look like/)).toBeVisible();
      await expect(form.getByLabel(/Timeline/)).toBeVisible();
      await expect(form.getByLabel(/Budget Expectation/)).toBeVisible();
      await expect(form.getByLabel(/Why Do You Want/)).toBeVisible();
    });

    test("prevents submission when required fields are empty", async ({ page }) => {
      const form = page.getByTestId("ai-form");
      await form.getByRole("button", { name: "Submit" }).click();
      await expect(page).toHaveURL(/\/consultation/);
    });

    test("can be filled out completely", async ({ page }) => {
      const form = page.getByTestId("ai-form");
      await form.getByLabel(/Full Name/).fill("John Smith");
      await form.getByLabel(/Email Address/).fill("john@example.com");
      await form.getByLabel(/Company Name/).fill("TechCo");
      await form.getByLabel(/Company Website URL/).fill("https://techco.com");
      await form.getByLabel(/Your Role in the Company/).selectOption("CEO/Founder");
      await form.getByLabel(/Industry/).fill("Healthcare");
      await form.getByLabel(/Company Size/).selectOption("51-200");
      await form.getByLabel(/What area of your business/).selectOption("Operations");
      await form.getByLabel(/Current challenges/).fill("Manual data entry taking too long.");
      await form.getByLabel(/Have you used AI tools/).selectOption("Explored but not implemented");
      await form.getByLabel(/What does success look like/).fill("50% reduction in manual processing.");
      await form.getByLabel(/Timeline/).selectOption("Within 1–3 months");
      await form.getByLabel(/Budget Expectation/).fill("$10k-$20k");
      await form.getByLabel(/Why Do You Want/).fill("Saw your blog on AI classification.");

      const isValid = await form.evaluate((el: HTMLFormElement) => el.checkValidity());
      expect(isValid).toBe(true);
    });

    test("form action is disabled in dev", async ({ page }) => {
      const form = page.getByTestId("ai-form");
      const action = await form.getAttribute("action");
      expect(action).toBe("#");
    });
  });
});
