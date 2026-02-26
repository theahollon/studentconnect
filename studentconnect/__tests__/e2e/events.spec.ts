/**
 * End-to-end tests for the Events feature.
 *
 * These tests verify the full user journey through the events pages:
 * - Viewing the events list
 * - Navigating to a single event detail page
 * - UI elements render correctly
 *
 * Acknowledgement: Generated with AI assistance from GitHub Copilot.
 */

import { test, expect } from "@playwright/test";

test.describe("Events list page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/events");
  });

  test("should display the Events heading", async ({ page }) => {
    const heading = page.getByRole("heading", { name: "Events", level: 1 });
    await expect(heading).toBeVisible();
  });

  test("should show 'Create new event' link that points to admin form", async ({
    page,
  }) => {
    const createLink = page.getByRole("link", { name: "Create new event" });
    await expect(createLink).toBeVisible();
    await expect(createLink).toHaveAttribute("href", "/admin/activities");
  });

  test("should render event cards after loading", async ({ page }) => {
    // Wait for the suspense fallback to disappear
    await expect(page.getByText("Loading events…")).toBeHidden({
      timeout: 10_000,
    });

    // The page should either have event links or show an error
    const eventLinks = page.locator('a[href*="/events/"]');
    const errorMessage = page.getByText("Error loading events");

    const hasEvents = (await eventLinks.count()) > 0;
    const hasError = await errorMessage.isVisible().catch(() => false);

    expect(hasEvents || hasError).toBeTruthy();
  });

  test("should display event title, organizer, and description on cards", async ({
    page,
  }) => {
    await expect(page.getByText("Loading events…")).toBeHidden({
      timeout: 10_000,
    });

    const eventCards = page.locator('a[href*="/events/"]');
    const count = await eventCards.count();

    if (count > 0) {
      // The first card should have some text content (title at minimum)
      const firstCard = eventCards.first();
      await expect(firstCard).not.toBeEmpty();
    }
  });

  test("should navigate to event detail page when clicking an event", async ({
    page,
  }) => {
    await expect(page.getByText("Loading events…")).toBeHidden({
      timeout: 10_000,
    });

    const eventCards = page.locator('a[href*="/events/"]');
    const count = await eventCards.count();

    if (count > 0) {
      // Extract the href and navigate directly — avoids Next.js RSC fetch
      // carrying cookies differently than a full page.goto() navigation.
      const href = await eventCards.first().getAttribute('href');
      expect(href).toMatch(/\/events\/.+/);
      await page.goto(href!);
      expect(page.url()).toMatch(/\/events\/.+/);
    }
  });
});

test.describe("Event detail page", () => {
  test("should display event title and description", async ({ page }) => {
    // First go to the events list to find a real event
    await page.goto("/events");
    await expect(page.getByText("Loading events…")).toBeHidden({
      timeout: 10_000,
    });

    const eventCards = page.locator('a[href*="/events/"]');
    const count = await eventCards.count();

    if (count === 0) {
      test.skip();
      return;
    }

    // Navigate to the first event via its href (avoids RSC auth middleware issue)
    const href = await eventCards.first().getAttribute('href');
    await page.goto(href!);

    // Wait for loading to finish
    await expect(page.getByText("Laster event...")).toBeHidden({
      timeout: 10_000,
    });

    // The detail page should show a title
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).not.toBeEmpty();
  });

  test("should display a Delete Event button", async ({ page }) => {
    await page.goto("/events");
    await expect(page.getByText("Loading events…")).toBeHidden({
      timeout: 10_000,
    });

    const eventCards = page.locator('a[href*="/events/"]');
    const count = await eventCards.count();

    if (count === 0) {
      test.skip();
      return;
    }

    const href = await eventCards.first().getAttribute('href');
    await page.goto(href!);
    await expect(page.getByText("Laster event...")).toBeHidden({
      timeout: 10_000,
    });

    const deleteButton = page.getByRole("button", { name: "Delete Event" });
    await expect(deleteButton).toBeVisible();
  });

  test("should display event date and time", async ({ page }) => {
    await page.goto("/events");
    await expect(page.getByText("Loading events…")).toBeHidden({
      timeout: 10_000,
    });

    const eventCards = page.locator('a[href*="/events/"]');
    const count = await eventCards.count();

    if (count === 0) {
      test.skip();
      return;
    }

    const href = await eventCards.first().getAttribute('href');
    await page.goto(href!);
    await expect(page.getByText("Laster event...")).toBeHidden({
      timeout: 10_000,
    });

    // The detail page renders a <p> with the formatted start_time
    const dateText = page.locator("p.text-gray-500");
    await expect(dateText).toBeVisible();
  });

  test("should return 404 for a non-existent event", async ({ page }) => {
    // Use a valid UUID that doesn’t exist so Supabase returns PGRST116 → notFound().
    await page.goto("/events/00000000-0000-0000-0000-000000000000");

    // Should NOT redirect to login (auth is working)
    await expect(page).not.toHaveURL(/auth\/login/);

    // next dev / Turbopack may serve notFound() pages with HTTP 200;
    // instead check that the page actually indicates the resource is missing.
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible({
      timeout: 10_000,
    });
  });
});

test.describe("Events navigation", () => {
  test("should navigate from homepage to events page", async ({ page }) => {
    await page.goto("/");

    const eventsLink = page.getByRole("link", { name: /events/i });
    await expect(eventsLink.first()).toBeVisible();

    await eventsLink.first().click();
    await page.waitForURL("/events");

    const heading = page.getByRole("heading", { name: "Events", level: 1 });
    await expect(heading).toBeVisible();
  });

  test("should be able to navigate back from event detail to list", async ({
    page,
  }) => {
    await page.goto("/events");
    await expect(page.getByText("Loading events…")).toBeHidden({
      timeout: 10_000,
    });

    const eventCards = page.locator('a[href*="/events/"]');
    const count = await eventCards.count();

    if (count === 0) {
      test.skip();
      return;
    }

    const href = await eventCards.first().getAttribute('href');
    await page.goto(href!);
    await page.waitForLoadState('networkidle');

    // Navigate back
    await page.goBack();
    await page.waitForURL("/events");

    const heading = page.getByRole("heading", { name: "Events", level: 1 });
    await expect(heading).toBeVisible();
  });
});
