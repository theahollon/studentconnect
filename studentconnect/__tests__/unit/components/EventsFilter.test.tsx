/**
 * Unit tests for the EventsFilter client component.
 */

import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";

const mockPush = jest.fn();
let mockSearchParamsValue = "";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({
    get: (key: string) => (key === "type" ? mockSearchParamsValue : null),
    toString: () => (mockSearchParamsValue ? `type=${mockSearchParamsValue}` : ""),
  }),
}));

import EventsFilter from "@/app/events/EventsFilter";

beforeEach(() => {
  jest.clearAllMocks();
  mockSearchParamsValue = "";
});

test("renders All button and all category buttons", () => {
  render(<EventsFilter />);

  expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "general" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "social" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "sports" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "academic" })).toBeInTheDocument();
});

test("All button is active when no filter is set", () => {
  mockSearchParamsValue = "";
  render(<EventsFilter />);

  expect(screen.getByRole("button", { name: "All" })).toHaveClass("bg-blue-600");
});

test("category button is active when its filter is set", () => {
  mockSearchParamsValue = "social";
  render(<EventsFilter />);

  expect(screen.getByRole("button", { name: "social" })).toHaveClass("bg-blue-600");
  expect(screen.getByRole("button", { name: "All" })).not.toHaveClass("bg-blue-600");
});

test("clicking a category button navigates with type param", () => {
  render(<EventsFilter />);

  fireEvent.click(screen.getByRole("button", { name: "sports" }));

  expect(mockPush).toHaveBeenCalledWith("/events?type=sports");
});

test("clicking All button navigates without type param", () => {
  mockSearchParamsValue = "social";
  render(<EventsFilter />);

  fireEvent.click(screen.getByRole("button", { name: "All" }));

  expect(mockPush).toHaveBeenCalledWith("/events?");
});
