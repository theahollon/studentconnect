/**
 * Unit tests for the JobAdForm component (client component).
 *
 * Acknowledgement: Generated with AI assistance from GitHub Copilot.
 */

import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

jest.mock("@/lib/i18n/client", () => ({
  t: (key: string) => key,
}));

// Mock the database layer used for creating job listings
const mockCreateJobListings = jest.fn();
const mockGetCompanies = jest.fn();
jest.mock("@/lib/supabase/database", () => ({
  createJobListings: (...args: unknown[]) => mockCreateJobListings(...args),
  getCompanies: (...args: unknown[]) => mockGetCompanies(...args),
}));

import JobAdForm from "@/app/admin/jobs/JobAdForm";

beforeEach(() => {
  jest.clearAllMocks();
  mockCreateJobListings.mockReset();
  mockGetCompanies.mockResolvedValue([
    { id: "1", name: "Acme", description: "", website_url: "" },
    { id: "2", name: "Globex", description: "", website_url: "" },
  ]);
});

test("renders the form with heading", () => {
  render(<JobAdForm />);
  expect(screen.getByText("jobAdForm.heading")).toBeInTheDocument();
});

test("submit button is disabled when required fields are empty", () => {
  render(<JobAdForm />);
  const submit = screen.getByRole("button", {
    name: "jobAdForm.actions.create",
  });
  expect(submit).toBeDisabled();
});

test("submit button enables when title, company, and deadline are filled", async () => {
  render(<JobAdForm />);
  // Wait for companies to load into the dropdown
  await waitFor(() => {
    expect(screen.getByRole("option", { name: "Acme" })).toBeInTheDocument();
  });
  fireEvent.change(screen.getByLabelText(/jobAdForm.fields.title/), {
    target: { value: "Dev" },
  });
  fireEvent.change(screen.getByLabelText(/jobAdForm.fields.company/), {
    target: { value: "Acme" },
  });
  fireEvent.change(screen.getByLabelText(/jobAdForm.fields.deadline/), {
    target: { value: "2026-12-01" },
  });
  const submit = screen.getByRole("button", {
    name: "jobAdForm.actions.create",
  });
  expect(submit).toBeEnabled();
});

test("shows error on failed submission", async () => {
  mockCreateJobListings.mockRejectedValue(new Error("Insert failed"));

  render(<JobAdForm />);
  await waitFor(() => {
    expect(screen.getByRole("option", { name: "Acme" })).toBeInTheDocument();
  });
  fireEvent.change(screen.getByLabelText(/jobAdForm.fields.title/), {
    target: { value: "Dev" },
  });
  fireEvent.change(screen.getByLabelText(/jobAdForm.fields.company/), {
    target: { value: "Acme" },
  });
  fireEvent.change(screen.getByLabelText(/jobAdForm.fields.deadline/), {
    target: { value: "2026-12-01" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "jobAdForm.actions.create" }),
  );

  await waitFor(() => {
    expect(screen.getByText("Insert failed")).toBeInTheDocument();
  });
});

test("shows success modal on successful submission", async () => {
  mockCreateJobListings.mockResolvedValue({});

  render(<JobAdForm />);
  await waitFor(() => {
    expect(screen.getByRole("option", { name: "Acme" })).toBeInTheDocument();
  });
  fireEvent.change(screen.getByLabelText(/jobAdForm.fields.title/), {
    target: { value: "Dev" },
  });
  fireEvent.change(screen.getByLabelText(/jobAdForm.fields.company/), {
    target: { value: "Acme" },
  });
  fireEvent.change(screen.getByLabelText(/jobAdForm.fields.deadline/), {
    target: { value: "2026-12-01" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "jobAdForm.actions.create" }),
  );

  await waitFor(() => {
    expect(
      screen.getByText("jobAdForm.modal.successTitle"),
    ).toBeInTheDocument();
  });
});

test("reset button clears the form", () => {
  render(<JobAdForm />);
  const titleInput = screen.getByLabelText(
    /jobAdForm.fields.title/,
  ) as HTMLInputElement;
  fireEvent.change(titleInput, { target: { value: "Test" } });
  expect(titleInput.value).toBe("Test");

  fireEvent.click(
    screen.getByRole("button", { name: "jobAdForm.actions.reset" }),
  );
  expect(titleInput.value).toBe("");
});
