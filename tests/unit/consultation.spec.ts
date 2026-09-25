import { test, expect } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";

const PAGE_SOURCE = "src/pages/consultation.astro";

test.describe("Consultation Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/consultation");
    await page.waitForLoadState("networkidle");
  });

  test("shows exactly one form and no tabs", async ({ page }) => {
    await expect(page.locator("main form")).toHaveCount(1);
    await expect(page.getByTestId("intake-form")).toBeVisible();
    await expect(page.getByTestId("tab-bar")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "AI Consulting" })).toHaveCount(0);
  });

  test("intro does not split visitors into two audiences", async ({ page }) => {
    await expect(page.locator("main")).not.toContainText(/AI Consulting tab|This form is for/);
  });

  test("requires only name, email and what they need help with", async ({ page }) => {
    const form = page.getByTestId("intake-form");
    const required = await form
      .locator("[required]")
      .evaluateAll((els) => els.map((el) => el.getAttribute("name")).sort());
    expect(required).toEqual(["email", "message", "name"]);
  });

  test("offers the optional fields", async ({ page }) => {
    const form = page.getByTestId("intake-form");
    for (const label of [/Company or website/, /Type of work/, /Timeline/, /Budget/, /How did you find me/]) {
      const field = form.getByLabel(label);
      await expect(field).toBeVisible();
      await expect(field).not.toHaveAttribute("required");
    }
    await expect(form.getByLabel(/Type of work/).locator("option")).toContainText([
      "Web development",
      "AI",
      "Not sure",
    ]);
  });

  test("is valid with only the three required fields", async ({ page }) => {
    const form = page.getByTestId("intake-form");
    await form.getByLabel(/Name/).fill("Jane Doe");
    await form.getByLabel(/Email/).fill("jane@example.com");
    await form.getByLabel(/What do you need help with/).fill("A site rebuild.");
    expect(await form.evaluate((el: HTMLFormElement) => el.checkValidity())).toBe(true);
  });

  for (const blank of [/Name/, /Email/, /What do you need help with/]) {
    test(`is invalid when ${blank.source} is empty`, async ({ page }) => {
      const form = page.getByTestId("intake-form");
      await form.getByLabel(/Name/).fill("Jane Doe");
      await form.getByLabel(/Email/).fill("jane@example.com");
      await form.getByLabel(/What do you need help with/).fill("A site rebuild.");
      await form.getByLabel(blank).fill("");
      expect(await form.evaluate((el: HTMLFormElement) => el.checkValidity())).toBe(false);
    });
  }

  // Stands in for an end-to-end test. The field names asserted here were
  // confirmed against Formspree by a real submission on 2026-09-25. If a
  // field is renamed or added, submit the live form once to re-confirm.
  test("submitting posts every field without leaving the browser", async ({ page }) => {
    const posts: string[] = [];
    await page.route("**/consultation**", async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      posts.push(route.request().postData() ?? "");
      await route.fulfill({ status: 200, body: "ok" });
    });

    const form = page.getByTestId("intake-form");
    await form.getByRole("button", { name: "Submit" }).click();
    expect(posts).toHaveLength(0);

    await form.getByLabel(/Name/).fill("Jane Doe");
    await form.getByLabel(/Email/).fill("jane@example.com");
    await form.getByLabel(/What do you need help with/).fill("A site rebuild.");
    await form.getByLabel(/Company or website/).fill("acme.com");
    await form.getByLabel(/Type of work/).selectOption("AI");
    await form.getByLabel(/Timeline/).fill("next month");
    await form.getByLabel(/Budget/).fill("$5k");
    await form.getByLabel(/How did you find me/).fill("your blog");
    await form.getByRole("button", { name: "Submit" }).click();

    await expect.poll(() => posts.length).toBe(1);
    expect(Object.fromEntries(new URLSearchParams(posts[0]))).toEqual({
      name: "Jane Doe",
      email: "jane@example.com",
      message: "A site rebuild.",
      company: "acme.com",
      work_type: "AI",
      timeline: "next month",
      budget: "$5k",
      source: "your blog",
    });
  });

  test("form action is disabled in dev", async ({ page }) => {
    await expect(page.getByTestId("intake-form")).toHaveAttribute("action", "#");
  });
});

test.describe("Consultation source", () => {
  test("posts to a single Formspree endpoint in production", () => {
    const urls = readFileSync(PAGE_SOURCE, "utf8").match(/https:\/\/formspree\.io\/f\/\w+/g) ?? [];
    expect(urls).toEqual(["https://formspree.io/f/xzdarlpg"]);
  });

  test("the tab component is gone", () => {
    expect(existsSync("src/components/FormTabs.res")).toBe(false);
    expect(existsSync("src/components/FormTabs.res.mjs")).toBe(false);
  });
});
