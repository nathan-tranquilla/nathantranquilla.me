import { defineConfig } from "@playwright/test";
import { testServer } from "./scripts/ship-lib.mjs";

// rake ship sets TEST_PORT so its run neither reuses nor disturbs the dev server on 4321.
const server = testServer(process.env);

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
    baseURL: `http://localhost:${server.port}`,
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
  webServer: {
    command: `flox activate -- pnpm dev --port ${server.port}`,
    url: `http://localhost:${server.port}`,
    reuseExistingServer: server.reuse,
  },
});
