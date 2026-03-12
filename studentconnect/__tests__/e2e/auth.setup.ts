/**
 * Playwright global authentication setup.
 *
 * Runs once before any e2e test suite. Logs in with the test user defined in
 * .env.local (E2E_TEST_EMAIL / E2E_TEST_PASSWORD) and saves the resulting
 * browser storage state (cookies + localStorage) to playwright/.auth/user.json
 * so that every test project can reuse the authenticated session without
 * logging in again.
 *
 * Acknowledgement: Generated with AI assistance from GitHub Copilot.
 */

import { test as setup, expect } from "@playwright/test";
import path from "path";

export const STORAGE_STATE = path.join(
  __dirname,
  "../../playwright/.auth/user.json"
);

setup("authenticate", async ({ page }) => {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "E2E_TEST_EMAIL and E2E_TEST_PASSWORD must be set in .env.local before running e2e tests."
    );
  }

  // Navigate to the login page
  await page.goto("/auth/login");

  // Fill in credentials
  await page.fill("#email", email);
  await page.fill("#password", password);

  // Submit the form
  await page.getByRole("button", { name: "Login" }).click();

  // Wait for the redirect to the home page after successful login
  await page.waitForURL("/", { timeout: 15_000 });
  await expect(page).toHaveURL("/");

  // Persist cookies & localStorage so all tests run as this user
  await page.context().storageState({ path: STORAGE_STATE });
});
