/**
 * Unit tests for DeleteEventButton and DeleteJoblistingButton (client components).
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

const mockDeleteEvent = jest.fn().mockResolvedValue(undefined);
const mockDeleteJoblisting = jest.fn().mockResolvedValue(undefined);
jest.mock("@/lib/supabase/database", () => ({
  deleteEvent: (...args: unknown[]) => mockDeleteEvent(...args),
  deleteJoblisting: (...args: unknown[]) => mockDeleteJoblisting(...args),
}));

import DeleteEventButton from "@/app/events/[id]/DeleteEventButton";
import DeleteJoblistingButton from "@/app/joblistings/[id]/DeleteJoblistingButton";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("DeleteEventButton", () => {
  test("renders delete button", () => {
    render(<DeleteEventButton id="ev-1" />);
    expect(
      screen.getByText("deleteEventButton.label"),
    ).toBeInTheDocument();
  });

  test("calls deleteEvent and navigates on click", async () => {
    render(<DeleteEventButton id="ev-1" />);
    fireEvent.click(screen.getByText("deleteEventButton.label"));

    await waitFor(() => {
      expect(mockDeleteEvent).toHaveBeenCalledWith("ev-1");
      expect(mockPush).toHaveBeenCalledWith("/events");
    });
  });
});

describe("DeleteJoblistingButton", () => {
  test("renders delete button", () => {
    render(<DeleteJoblistingButton id="job-1" />);
    expect(
      screen.getByText("deleteJoblistingButton.label"),
    ).toBeInTheDocument();
  });

  test("calls deleteJoblisting and navigates on click", async () => {
    render(<DeleteJoblistingButton id="job-1" />);
    fireEvent.click(screen.getByText("deleteJoblistingButton.label"));

    await waitFor(() => {
      expect(mockDeleteJoblisting).toHaveBeenCalledWith("job-1");
      expect(mockPush).toHaveBeenCalledWith("/joblistings");
    });
  });
});
