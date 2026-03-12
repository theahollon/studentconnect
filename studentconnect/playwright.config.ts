/**
 * Playwright configuration for e2e tests.
 *
 * Acknowledgement: Generated with AI assistance from GitHub Copilot.
 */

import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";
import path from "path";

// Load .env.local so E2E_TEST_EMAIL / E2E_TEST_PASSWORD are available in the
// auth setup and any test that reads process.env directly.
config({ path: ".env.local" });

const STORAGE_STATE = path.join(__dirname, "playwright/.auth/user.json");

export default defineConfig({
  testDir: "./__tests__/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  timeout: 30_000,

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      // Runs auth.setup.ts once before any test project
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Reuse the authenticated session saved by the setup project
        storageState: STORAGE_STATE,
      },
      dependencies: ["setup"],
    },
  ],

  /* Start the Next.js dev server before running tests */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
