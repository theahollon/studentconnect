/**
 * Unit tests for the DeleteCompanyButton component (client component).
 *
 * Acknowledgement: Generated with AI assistance from GitHub Copilot.
 */

import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

jest.mock("@/lib/i18n/client", () => ({
  t: (key: string) => key,
}));

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockDeleteCompanyProfile = jest.fn().mockResolvedValue(undefined);
jest.mock("@/lib/supabase/database", () => ({
  deleteCompanyProfile: (...args: unknown[]) => mockDeleteCompanyProfile(...args),
}));

import DeleteCompanyButton from "@/app/companies/[name]/DeleteCompanyButton";

beforeEach(() => {
  jest.clearAllMocks();
});

test("renders delete button with translated label", () => {
  render(<DeleteCompanyButton id="c1" />);
  expect(
    screen.getByText("deleteCompanyProfileButton.label"),
  ).toBeInTheDocument();
});

test("calls deleteCompanyProfile and navigates on click", async () => {
  render(<DeleteCompanyButton id="c1" />);
  fireEvent.click(screen.getByText("deleteCompanyProfileButton.label"));

  await waitFor(() => {
    expect(mockDeleteCompanyProfile).toHaveBeenCalledWith("c1");
    expect(mockPush).toHaveBeenCalledWith("/admin/companies");
  });
});

test("button has correct styling classes", () => {
  render(<DeleteCompanyButton id="c1" />);
  const button = screen.getByText("deleteCompanyProfileButton.label");
  expect(button).toHaveClass("bg-red-600", "text-white");
});
