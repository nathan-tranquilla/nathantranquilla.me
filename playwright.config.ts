import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  // smoke tests hit the deployed site; they run from playwright.smoke.config.ts
  testIgnore: "**/smoke/**",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:4321",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
  webServer: {
    command: "flox activate -- pnpm dev",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
  },
});
