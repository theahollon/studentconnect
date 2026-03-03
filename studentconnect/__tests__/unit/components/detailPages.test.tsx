/**
 * Unit tests for the event and joblisting detail page wrappers.
 *
 * Acknowledgement: Generated with AI assistance from GitHub Copilot.
 */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

// These pages are thin Suspense wrappers — we mock their children
jest.mock("@/app/events/[id]/EventContent", () => {
  return function MockEventContent() {
    return <div>MockEventContent</div>;
  };
});

jest.mock("@/app/joblistings/[id]/JoblistingContent", () => {
  return function MockJoblistingContent() {
    return <div>MockJoblistingContent</div>;
  };
});

// The joblistings page imports LoadingJoblisting — mock it too
jest.mock("@/app/joblistings/[id]/LoadingJoblisting", () => {
  return function MockLoading() {
    return <span>Loading…</span>;
  };
});

import EventPage from "@/app/events/[id]/page";
import JoblistingPage from "@/app/joblistings/[id]/page";

describe("EventPage", () => {
  test("renders Suspense wrapper with EventContent", () => {
    const params = Promise.resolve({ id: "test-id" });
    render(<EventPage params={params} />);
    expect(screen.getByText("MockEventContent")).toBeInTheDocument();
  });
});

describe("JoblistingPage", () => {
  test("renders Suspense wrapper with JoblistingContent", () => {
    const params = Promise.resolve({ id: "test-id" });
    render(<JoblistingPage params={params} />);
    expect(screen.getByText("MockJoblistingContent")).toBeInTheDocument();
  });
});
