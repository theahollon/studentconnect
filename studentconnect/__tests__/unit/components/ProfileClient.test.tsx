/**
 * Unit tests for the ProfileClient component.
 * Covers edge cases for the profile page: allergies and study program sections.
 */

import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock i18n — return the key as-is so assertions use known keys
jest.mock("@/lib/i18n/client", () => ({
  t: (key: string) => key,
}));

// Mock server actions used by ProfileClient
const mockUpdateStudyProgram = jest.fn();
const mockAddAllergy = jest.fn();
const mockDeleteAllergy = jest.fn();

jest.mock("@/lib/profile-actions", () => ({
  updateStudyProgram: (...args: unknown[]) => mockUpdateStudyProgram(...args),
  addAllergy: (...args: unknown[]) => mockAddAllergy(...args),
  deleteAllergy: (...args: unknown[]) => mockDeleteAllergy(...args),
}));

import ProfileClient from "@/app/profile/ProfileClient";

const baseProps = {
  email: "student@example.com",
  studyProgram: null,
  allergies: [],
};

beforeEach(() => {
  jest.clearAllMocks();
  // addAllergy returns the newly created record by default
  mockAddAllergy.mockResolvedValue({ id: "db-id-1", user_id: "user-1", allergy: "Nuts" });
  mockDeleteAllergy.mockResolvedValue(undefined);
  mockUpdateStudyProgram.mockResolvedValue(undefined);
});

describe("ProfileClient — profile header", () => {
  test("shows the user email", () => {
    render(<ProfileClient {...baseProps} />);
    expect(screen.getByText("student@example.com")).toBeInTheDocument();
  });

  test("shows the profile title translation key", () => {
    render(<ProfileClient {...baseProps} />);
    expect(screen.getByText("profile.title")).toBeInTheDocument();
  });
});

describe("ProfileClient — study program", () => {
  test("shows placeholder when no program is selected", () => {
    render(<ProfileClient {...baseProps} studyProgram={null} />);
    expect(screen.getByText("profile.selectProgram")).toBeInTheDocument();
  });

  test("shows the current study program when one is set", () => {
    render(<ProfileClient {...baseProps} studyProgram="Computer Science" />);
    expect(screen.getByText("Computer Science")).toBeInTheDocument();
  });

  test("opens dropdown when the program button is clicked", () => {
    render(<ProfileClient {...baseProps} />);
    fireEvent.click(screen.getByText("profile.selectProgram"));
    expect(screen.getByText("Informatics")).toBeInTheDocument();
  });

  test("closes dropdown after selecting a program", async () => {
    render(<ProfileClient {...baseProps} />);
    fireEvent.click(screen.getByText("profile.selectProgram"));
    fireEvent.click(screen.getByText("Informatics"));
    await waitFor(() => {
      expect(screen.getByText("Informatics")).toBeInTheDocument();
    });
    // The full list should no longer be visible (dropdown closed)
    expect(screen.queryByText("Mechanical Engineering")).not.toBeInTheDocument();
  });

  test("calls updateStudyProgram with the chosen program", async () => {
    render(<ProfileClient {...baseProps} />);
    fireEvent.click(screen.getByText("profile.selectProgram"));
    fireEvent.click(screen.getByText("Cybersecurity"));
    await waitFor(() => {
      expect(mockUpdateStudyProgram).toHaveBeenCalledWith("Cybersecurity");
    });
  });
});

describe("ProfileClient — allergies: empty state", () => {
  test("shows no-allergies message when list is empty", () => {
    render(<ProfileClient {...baseProps} allergies={[]} />);
    expect(screen.getByText("profile.noAllergies")).toBeInTheDocument();
  });

  test("does not show no-allergies message when allergies exist", () => {
    render(
      <ProfileClient
        {...baseProps}
        allergies={[{ id: "1", user_id: "u1", allergy: "Peanuts" }]}
      />
    );
    expect(screen.queryByText("profile.noAllergies")).not.toBeInTheDocument();
  });
});

describe("ProfileClient — allergies: adding", () => {
  test("adds a new allergy and calls addAllergy", async () => {
    mockAddAllergy.mockResolvedValue({ id: "db-2", user_id: "u1", allergy: "Gluten" });
    render(<ProfileClient {...baseProps} />);

    fireEvent.change(screen.getByPlaceholderText("profile.addAllergyPlaceholder"), {
      target: { value: "Gluten" },
    });
    fireEvent.click(screen.getByText("profile.addButton"));

    await waitFor(() => {
      expect(mockAddAllergy).toHaveBeenCalledWith("Gluten");
    });
    expect(screen.getByText("Gluten")).toBeInTheDocument();
  });

  test("does not add an empty string allergy", async () => {
    render(<ProfileClient {...baseProps} />);
    fireEvent.change(screen.getByPlaceholderText("profile.addAllergyPlaceholder"), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByText("profile.addButton"));

    await waitFor(() => {
      expect(mockAddAllergy).not.toHaveBeenCalled();
    });
  });

  test("does not add a duplicate allergy", async () => {
    render(
      <ProfileClient
        {...baseProps}
        allergies={[{ id: "1", user_id: "u1", allergy: "Peanuts" }]}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("profile.addAllergyPlaceholder"), {
      target: { value: "Peanuts" },
    });
    fireEvent.click(screen.getByText("profile.addButton"));

    await waitFor(() => {
      expect(mockAddAllergy).not.toHaveBeenCalled();
    });
  });

  test("clears the input field after adding an allergy", async () => {
    mockAddAllergy.mockResolvedValue({ id: "db-3", user_id: "u1", allergy: "Soy" });
    render(<ProfileClient {...baseProps} />);

    const input = screen.getByPlaceholderText("profile.addAllergyPlaceholder");
    fireEvent.change(input, { target: { value: "Soy" } });
    fireEvent.click(screen.getByText("profile.addButton"));

    await waitFor(() => {
      expect((input as HTMLInputElement).value).toBe("");
    });
  });

  test("can also add an allergy by pressing Enter", async () => {
    mockAddAllergy.mockResolvedValue({ id: "db-4", user_id: "u1", allergy: "Dairy" });
    render(<ProfileClient {...baseProps} />);

    const input = screen.getByPlaceholderText("profile.addAllergyPlaceholder");
    fireEvent.change(input, { target: { value: "Dairy" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(mockAddAllergy).toHaveBeenCalledWith("Dairy");
    });
  });
});

describe("ProfileClient — allergies: removing", () => {
  test("removes an allergy from the UI and calls deleteAllergy", async () => {
    render(
      <ProfileClient
        {...baseProps}
        allergies={[{ id: "42", user_id: "u1", allergy: "Shellfish" }]}
      />
    );

    expect(screen.getByText("Shellfish")).toBeInTheDocument();

    // The X button is the only button inside the badge
    const removeButtons = screen.getAllByRole("button");
    const xButton = removeButtons.find(
      (btn) => btn.closest(".bg-pink-100") !== null
    );
    fireEvent.click(xButton!);

    await waitFor(() => {
      expect(mockDeleteAllergy).toHaveBeenCalledWith("42");
    });
    expect(screen.queryByText("Shellfish")).not.toBeInTheDocument();
  });

  test("shows no-allergies message after removing the last allergy", async () => {
    render(
      <ProfileClient
        {...baseProps}
        allergies={[{ id: "99", user_id: "u1", allergy: "Eggs" }]}
      />
    );

    const removeButtons = screen.getAllByRole("button");
    const xButton = removeButtons.find(
      (btn) => btn.closest(".bg-pink-100") !== null
    );
    fireEvent.click(xButton!);

    await waitFor(() => {
      expect(screen.getByText("profile.noAllergies")).toBeInTheDocument();
    });
  });
});
