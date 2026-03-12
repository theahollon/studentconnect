/**
 * Unit tests for the JobListingsFilter client component.
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

import JobListingsFilter from "@/app/joblistings/JobListingsFilter";

beforeEach(() => {
  jest.clearAllMocks();
  mockSearchParamsValue = "";
});

test("renders All button and all employment type buttons", () => {
  render(<JobListingsFilter />);

  expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Full-time" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Part-time" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Internship" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Temporary" })).toBeInTheDocument();
});

test("All button is active when no filter is set", () => {
  mockSearchParamsValue = "";
  render(<JobListingsFilter />);

  expect(screen.getByRole("button", { name: "All" })).toHaveClass("bg-blue-600");
});

test("employment type button is active when its filter is set", () => {
  mockSearchParamsValue = "internship";
  render(<JobListingsFilter />);

  expect(screen.getByRole("button", { name: "Internship" })).toHaveClass("bg-blue-600");
  expect(screen.getByRole("button", { name: "All" })).not.toHaveClass("bg-blue-600");
});

test("clicking a filter button navigates with type param", () => {
  render(<JobListingsFilter />);

  fireEvent.click(screen.getByRole("button", { name: "Full-time" }));

  expect(mockPush).toHaveBeenCalledWith("/joblistings?type=fulltime");
});

test("clicking All button navigates without type param", () => {
  mockSearchParamsValue = "fulltime";
  render(<JobListingsFilter />);

  fireEvent.click(screen.getByRole("button", { name: "All" }));

  expect(mockPush).toHaveBeenCalledWith("/joblistings?");
});
