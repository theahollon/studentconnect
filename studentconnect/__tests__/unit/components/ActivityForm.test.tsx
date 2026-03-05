/**
 * Unit tests for the ActivityForm component (client component).
 *
 * Acknowledgement: Generated with AI assistance from GitHub Copilot.
 */

import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock i18n client — return the key as-is so we can assert on known keys
jest.mock("@/lib/i18n/client", () => ({
  t: (key: string) => key,
}));

// Mock supabase client (still imported by the component)
jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({}),
}));

// Mock the database layer used for creating events
const mockCreateEvent = jest.fn();
jest.mock("@/lib/supabase/database", () => ({
  createEvent: (...args: unknown[]) => mockCreateEvent(...args),
}));

import ActivityForm from "@/app/admin/activities/ActivityForm";

beforeEach(() => {
  jest.clearAllMocks();
});

test("renders the form with heading", () => {
  render(<ActivityForm />);
  expect(screen.getByText("activityForm.heading")).toBeInTheDocument();
});

test("submit button is disabled when required fields are empty", () => {
  render(<ActivityForm />);
  const submit = screen.getByRole("button", {
    name: "activityForm.buttons.create",
  });
  expect(submit).toBeDisabled();
});

test("submit button enables when title and date are filled", () => {
  render(<ActivityForm />);
  fireEvent.change(screen.getByLabelText(/activityForm.fields.title/), {
    target: { value: "My Event" },
  });
  fireEvent.change(screen.getByLabelText(/activityForm.fields.dateTime/), {
    target: { value: "2026-06-01T10:00" },
  });
  const submit = screen.getByRole("button", {
    name: "activityForm.buttons.create",
  });
  expect(submit).toBeEnabled();
});

test("shows error on failed submission", async () => {
  mockCreateEvent.mockRejectedValue(new Error("DB error"));

  render(<ActivityForm />);
  fireEvent.change(screen.getByLabelText(/activityForm.fields.title/), {
    target: { value: "Test" },
  });
  fireEvent.change(screen.getByLabelText(/activityForm.fields.dateTime/), {
    target: { value: "2026-06-01T10:00" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "activityForm.buttons.create" }),
  );

  await waitFor(() => {
    expect(screen.getByText("DB error")).toBeInTheDocument();
  });
});

test("shows success modal on successful submission", async () => {
  mockCreateEvent.mockResolvedValue(undefined);

  render(<ActivityForm />);
  fireEvent.change(screen.getByLabelText(/activityForm.fields.title/), {
    target: { value: "Test" },
  });
  fireEvent.change(screen.getByLabelText(/activityForm.fields.dateTime/), {
    target: { value: "2026-06-01T10:00" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "activityForm.buttons.create" }),
  );

  await waitFor(() => {
    expect(
      screen.getByText("activityForm.modal.title"),
    ).toBeInTheDocument();
  });
});

test("reset button clears the form", () => {
  render(<ActivityForm />);
  const titleInput = screen.getByLabelText(
    /activityForm.fields.title/,
  ) as HTMLInputElement;
  fireEvent.change(titleInput, { target: { value: "Test" } });
  expect(titleInput.value).toBe("Test");

  fireEvent.click(
    screen.getByRole("button", { name: "activityForm.buttons.reset" }),
  );
  expect(titleInput.value).toBe("");
});
