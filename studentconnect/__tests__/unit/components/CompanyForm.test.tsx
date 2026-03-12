/**
 * Unit tests for the CompanyForm component (client component).
 *
 * Acknowledgement: Generated with AI assistance from GitHub Copilot.
 */

import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock i18n — return the key as-is
jest.mock("@/lib/i18n/client", () => ({
  t: (key: string) => key,
}));

// Mock Supabase client with chainable query builder
const mockInsert = jest.fn();
jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      insert: mockInsert,
    }),
  }),
}));

import CompanyForm from "@/app/admin/companies/companyForm/companyForm";

beforeEach(() => {
  jest.clearAllMocks();
  mockInsert.mockResolvedValue({ error: null });
});

test("renders the form with heading", () => {
  render(<CompanyForm />);
  expect(screen.getByText("companyForm.heading")).toBeInTheDocument();
});

test("submit button is disabled when name is empty", () => {
  render(<CompanyForm />);
  const submit = screen.getByRole("button", {
    name: "companyForm.buttons.create",
  });
  expect(submit).toBeDisabled();
});

test("submit button enables when name is filled", () => {
  render(<CompanyForm />);
  fireEvent.change(screen.getByLabelText(/companyForm.fields.name/), {
    target: { value: "Acme Inc" },
  });
  const submit = screen.getByRole("button", {
    name: "companyForm.buttons.create",
  });
  expect(submit).toBeEnabled();
});

test("shows error on failed submission", async () => {
  mockInsert.mockResolvedValue({ error: { message: "Duplicate name" } });

  render(<CompanyForm />);
  fireEvent.change(screen.getByLabelText(/companyForm.fields.name/), {
    target: { value: "Acme Inc" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "companyForm.buttons.create" }),
  );

  await waitFor(() => {
    expect(screen.getByText("Duplicate name")).toBeInTheDocument();
  });
});

test("shows success modal on successful submission", async () => {
  mockInsert.mockResolvedValue({ error: null });

  render(<CompanyForm />);
  fireEvent.change(screen.getByLabelText(/companyForm.fields.name/), {
    target: { value: "New Corp" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "companyForm.buttons.create" }),
  );

  await waitFor(() => {
    expect(
      screen.getByText("companyForm.modal.title"),
    ).toBeInTheDocument();
  });
});

test("reset button clears the form", () => {
  render(<CompanyForm />);
  const nameInput = screen.getByLabelText(
    /companyForm.fields.name/,
  ) as HTMLInputElement;
  fireEvent.change(nameInput, { target: { value: "Test" } });
  expect(nameInput.value).toBe("Test");

  fireEvent.click(
    screen.getByRole("button", { name: "companyForm.buttons.reset" }),
  );
  expect(nameInput.value).toBe("");
});

test("submits trimmed values including optional fields", async () => {
  mockInsert.mockResolvedValue({ error: null });

  render(<CompanyForm />);
  fireEvent.change(screen.getByLabelText(/companyForm.fields.name/), {
    target: { value: "  Acme Corp  " },
  });
  fireEvent.change(screen.getByLabelText(/companyForm.fields.description/), {
    target: { value: "  A great company  " },
  });
  fireEvent.change(screen.getByLabelText(/companyForm.fields.websiteUrl/), {
    target: { value: "  https://acme.com  " },
  });

  fireEvent.click(
    screen.getByRole("button", { name: "companyForm.buttons.create" }),
  );

  await waitFor(() => {
    expect(mockInsert).toHaveBeenCalledWith({
      name: "Acme Corp",
      description: "A great company",
      website_url: "https://acme.com",
    });
  });
});
