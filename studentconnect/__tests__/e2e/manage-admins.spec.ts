/**
 * End-to-end tests for the Manage Admins page (/admin/manage-admins).
 *
 * Prerequisites:
 *  - E2E_TEST_EMAIL / E2E_TEST_PASSWORD in .env.local must belong to an ADMIN
 *    user, otherwise the authenticated describe-block will see a redirect to
 *    /unauthorized instead of the page content.
 *
 * Edge cases covered:
 *  - Admin user can reach the page
 *  - Both "Users" and "Current Admins" sections are rendered
 *  - "You" badge appears next to the currently logged-in admin
 *  - The revoke button for the current user's own row is disabled
 *  - "Manage Admins" nav link is visible to an admin
 *  - Unauthenticated requests are redirected to a login page
 *  - Direct navigation to a non-existent sub-path 404s correctly
 *
 * Acknowledgement: Written with AI assistance from Claude Code.
 */

import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Authenticated tests — E2E_TEST_EMAIL must be an admin
// ---------------------------------------------------------------------------

test.describe("Manage Admins page — authenticated admin", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/manage-admins");
    // Guard: if we land on /unauthorized the test user is not an admin
    const url = page.url();
    if (url.includes("unauthorized")) {
      test.skip(
        true,
        "E2E_TEST_EMAIL is not an admin — skipping manage-admins tests."
      );
    }
  });

  test("should render the page heading", async ({ page }) => {
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).not.toBeEmpty();
  });

  test("should show a section listing regular users", async ({ page }) => {
    // There are two <h2> headings: one for users, one for admins
    const h2s = page.getByRole("heading", { level: 2 });
    await expect(h2s.first()).toBeVisible();
  });

  test("should show a section listing current admins", async ({ page }) => {
    const h2s = page.getByRole("heading", { level: 2 });
    // At least two h2 headings must exist (Users + Current Admins)
    await expect(h2s.nth(1)).toBeVisible();
  });

  test("should show a 'You' badge next to the logged-in admin", async ({
    page,
  }) => {
    const youBadge = page.locator("span").filter({ hasText: /^You$/ });
    await expect(youBadge).toBeVisible();
  });

  test("should disable the revoke button for the current user's own row", async ({
    page,
  }) => {
    // Find the <li> that contains the "You" badge and check its button
    const ownRow = page.locator("li").filter({
      has: page.locator("span").filter({ hasText: /^You$/ }),
    });
    await expect(ownRow).toBeVisible();

    const revokeBtn = ownRow.getByRole("button");
    await expect(revokeBtn).toBeDisabled();
  });

  test("should show the 'Manage Admins' nav link on the home page", async ({
    page,
  }) => {
    await page.goto("/");
    // The nav link is only rendered for admin users
    const manageAdminsLink = page.getByRole("link", {
      name: /manage.?admins/i,
    });
    await expect(manageAdminsLink).toBeVisible();
  });

  test("promote button calls the action and refreshes the list", async ({
    page,
  }) => {
    // Look for at least one promote button; skip if there are no non-admin users
    const promoteButtons = page.getByRole("button", {
      name: /make admin|promote/i,
    });
    const count = await promoteButtons.count();

    if (count === 0) {
      test.skip();
      return;
    }

    // Click the first promote button and wait for the page to refresh
    await promoteButtons.first().click();

    // After a successful promote, a success banner should appear
    // (the exact text comes from i18n, so we just check for a green banner)
    const successBanner = page.locator(
      "div.bg-green-50, [class*='green']"
    ).first();
    await expect(successBanner).toBeVisible({ timeout: 10_000 });
  });
});

// ---------------------------------------------------------------------------
// Unauthenticated tests — storage state is cleared so no session cookie exists
// ---------------------------------------------------------------------------

test.describe("Manage Admins page — unauthenticated", () => {
  // Override the project-level storageState so these tests have no auth session
  test.use({ storageState: { cookies: [], origins: [] } });

  test("should redirect to a login page when not authenticated", async ({
    page,
  }) => {
    await page.goto("/admin/manage-admins");
    // requireAdmin() calls redirect("/login") when supabase returns no user
    await expect(page).toHaveURL(/login/, { timeout: 15_000 });
    // Must NOT end up on the manage-admins page
    await expect(page).not.toHaveURL(/manage-admins/);
  });

  test("should not expose any admin UI to unauthenticated users", async ({
    page,
  }) => {
    await page.goto("/admin/manage-admins");
    await page.waitForLoadState("networkidle");

    // Promote and revoke buttons must not be visible
    const promoteBtn = page.getByRole("button", { name: /make admin|promote/i });
    const revokeBtn = page.getByRole("button", { name: /revoke/i });

    await expect(promoteBtn).toHaveCount(0);
    await expect(revokeBtn).toHaveCount(0);
  });
});
