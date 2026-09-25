import { defineConfig } from "@playwright/test";

// Against the deployed site, not a local server. Kept out of `pnpm test`,
// which tests localhost by design and so can never prove production analytics.
// Retries absorb Pages propagation lag right after a deploy.
export default defineConfig({
  testDir: "./tests/smoke",
  reporter: "line",
  retries: 2,
  timeout: 60_000,
  use: { baseURL: "https://nathantranquilla.me" },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
