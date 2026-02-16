import { test, expect } from "@playwright/test";

test.describe("Consultation Form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/consultation");
  });

  test("renders all form fields", async ({ page }) => {
    const form = page.getByTestId("consultation-form");
    await expect(form).toBeVisible();

    await expect(page.getByLabel(/Full Name/)).toBeVisible();
    await expect(page.getByLabel(/Email Address/)).toBeVisible();
    await expect(page.getByLabel(/Company Name/)).toBeVisible();
    await expect(page.getByLabel(/Company Website URL/)).toBeVisible();
    await expect(page.getByLabel(/Your Role in the Company/)).toBeVisible();
    await expect(page.getByLabel(/Annual Company Revenue/)).toBeVisible();
    await expect(page.getByLabel(/Project Budget Range/)).toBeVisible();
    await expect(page.getByLabel(/Brief Description/)).toBeVisible();
    await expect(page.getByLabel(/Project Goals/)).toBeVisible();
    await expect(page.getByLabel(/Timeline/)).toBeVisible();
    await expect(page.getByLabel(/Why Do You Want/)).toBeVisible();
  });

  test("prevents submission when required fields are empty", async ({ page }) => {
    const submitButton = page.getByRole("button", { name: "Submit" });
    await submitButton.click();

    // Browser native validation should prevent navigation
    await expect(page).toHaveURL(/\/consultation/);
  });

  test("can be filled out completely", async ({ page }) => {
    await page.getByLabel(/Full Name/).fill("Jane Doe");
    await page.getByLabel(/Email Address/).fill("jane@example.com");
    await page.getByLabel(/Company Name/).fill("Acme Corp");
    await page.getByLabel(/Company Website URL/).fill("https://acme.com");
    await page.getByLabel(/Your Role in the Company/).selectOption("CTO/Technical Lead");
    await page.getByLabel(/Annual Company Revenue/).selectOption("$1M – $5M");
    await page.getByLabel(/Project Budget Range/).selectOption("$100k – $200k");
    await page.getByLabel(/Brief Description/).fill("We need to modernize our web stack.");
    await page.getByLabel(/Project Goals/).fill("Migrate to a modern framework.");
    await page.getByLabel(/Timeline/).selectOption("Within 1–3 months");
    await page.getByLabel(/Why Do You Want/).fill("Your blog convinced me.");

    // All fields filled, no validation errors - form should be submittable
    const form = page.getByTestId("consultation-form");
    const isValid = await form.evaluate((el: HTMLFormElement) => el.checkValidity());
    expect(isValid).toBe(true);
  });

  test("form action is disabled in dev", async ({ page }) => {
    const form = page.getByTestId("consultation-form");
    const action = await form.getAttribute("action");
    expect(action).toBe("#");
  });
});
