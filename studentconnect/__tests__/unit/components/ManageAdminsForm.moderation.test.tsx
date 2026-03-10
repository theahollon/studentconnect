//AI generated tests

/**
 * Focused unit tests for moderation features in ManageAdminsForm.
 *
 * Keeps selectors simple and avoids brittle assumptions about exact DOM layout.
 */

import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

jest.mock("@/lib/i18n/client", () => ({
  t: (key: string) => key,
}));

const mockRefresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

const mockPromote = jest.fn().mockResolvedValue({});
const mockRevoke = jest.fn().mockResolvedValue({});
const mockAddStrike = jest.fn().mockResolvedValue({});
const mockRemoveStrike = jest.fn().mockResolvedValue({});
const mockBanUserUntil = jest.fn().mockResolvedValue({});
const mockClearBan = jest.fn().mockResolvedValue({});

jest.mock("@/lib/supabase/admin-actions", () => ({
  promoteToAdminById: (...args: unknown[]) => mockPromote(...args),
  revokeAdmin: (...args: unknown[]) => mockRevoke(...args),
  addStrike: (...args: unknown[]) => mockAddStrike(...args),
  removeStrike: (...args: unknown[]) => mockRemoveStrike(...args),
  banUserUntil: (...args: unknown[]) => mockBanUserUntil(...args),
  clearBan: (...args: unknown[]) => mockClearBan(...args),
}));

import ManageAdminsForm from "@/app/admin/manage-admins/ManageAdminsForm";

const CURRENT_USER_ID = "current-admin-id";

const defaultProps = {
  admins: [
    {
      id: CURRENT_USER_ID,
      role: "admin",
      email: "me@example.com",
      strikes: 0,
      banned_until: null,
    },
  ],
  nonAdmins: [
    {
      id: "user-1",
      role: "user",
      email: "user1@example.com",
      strikes: 2,
      banned_until: null,
    },
  ],
  currentUserId: CURRENT_USER_ID,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockPromote.mockResolvedValue({});
  mockRevoke.mockResolvedValue({});
  mockAddStrike.mockResolvedValue({});
  mockRemoveStrike.mockResolvedValue({});
  mockBanUserUntil.mockResolvedValue({});
  mockClearBan.mockResolvedValue({});
});

describe("ManageAdminsForm moderation", () => {
  it("renders moderation section labels", () => {
    render(<ManageAdminsForm {...defaultProps} />);

    expect(screen.getAllByText("adminManage.strikeSection").length).toBeGreaterThan(0);
    expect(screen.getAllByText("adminManage.adminSection").length).toBeGreaterThan(0);
    expect(screen.getAllByText("adminManage.banSection").length).toBeGreaterThan(0);
  });

  it("shows strike label and not-banned state", () => {
    render(<ManageAdminsForm {...defaultProps} />);

    expect(screen.getAllByText(/adminManage\.strikes/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("adminManage.notBanned").length).toBeGreaterThan(0);
  });

  it("shows banned-until state for banned user", () => {
    render(
      <ManageAdminsForm
        {...defaultProps}
        nonAdmins={[
          {
            id: "user-1",
            role: "user",
            email: "user1@example.com",
            strikes: 2,
            banned_until: "2099-01-01T10:00:00.000Z",
          },
        ]}
      />
    );

    expect(screen.getAllByText(/adminManage\.bannedUntil/).length).toBeGreaterThan(0);
  });

  it("calls addStrike for the non-admin user", async () => {
    render(<ManageAdminsForm {...defaultProps} />);

    fireEvent.click(screen.getAllByText("adminManage.addStrike")[0]);

    await waitFor(() => {
      expect(mockAddStrike).toHaveBeenCalledWith("user-1");
    });
  });

  it("shows success after addStrike", async () => {
    render(<ManageAdminsForm {...defaultProps} />);

    fireEvent.click(screen.getAllByText("adminManage.addStrike")[0]);

    await waitFor(() => {
      expect(screen.getByText(/adminManage\.addStrikeSuccess/)).toBeInTheDocument();
    });
  });

  it("calls removeStrike for the non-admin user", async () => {
    render(<ManageAdminsForm {...defaultProps} />);

    fireEvent.click(screen.getAllByText("adminManage.removeStrike")[0]);

    await waitFor(() => {
      expect(mockRemoveStrike).toHaveBeenCalledWith("user-1");
    });
  });

  it("shows success after removeStrike", async () => {
    render(<ManageAdminsForm {...defaultProps} />);

    fireEvent.click(screen.getAllByText("adminManage.removeStrike")[0]);

    await waitFor(() => {
      expect(screen.getByText(/adminManage\.removeStrikeSuccess/)).toBeInTheDocument();
    });
  });

  it("shows validation error when set ban is clicked without a date", async () => {
    render(<ManageAdminsForm {...defaultProps} />);

    fireEvent.click(screen.getAllByText("adminManage.setBan")[0]);

    await waitFor(() => {
      expect(screen.getByText(/adminManage\.banDateRequired/)).toBeInTheDocument();
    });

    expect(mockBanUserUntil).not.toHaveBeenCalled();
  });

  it("calls banUserUntil with selected date", async () => {
    render(<ManageAdminsForm {...defaultProps} />);

    const inputs = document.querySelectorAll('input[type="datetime-local"]');
    fireEvent.change(inputs[0], { target: { value: "2026-03-20T12:30" } });

    fireEvent.click(screen.getAllByText("adminManage.setBan")[0]);

    await waitFor(() => {
      expect(mockBanUserUntil).toHaveBeenCalledWith("user-1", "2026-03-20T12:30");
    });
  });

  it("shows success after set ban", async () => {
    render(<ManageAdminsForm {...defaultProps} />);

    const inputs = document.querySelectorAll('input[type="datetime-local"]');
    fireEvent.change(inputs[0], { target: { value: "2026-03-20T12:30" } });

    fireEvent.click(screen.getAllByText("adminManage.setBan")[0]);

    await waitFor(() => {
      expect(screen.getByText(/adminManage\.banSuccess/)).toBeInTheDocument();
    });
  });

  it("calls clearBan for the non-admin user", async () => {
    render(<ManageAdminsForm {...defaultProps} />);

    fireEvent.click(screen.getAllByText("adminManage.clearBan")[0]);

    await waitFor(() => {
      expect(mockClearBan).toHaveBeenCalledWith("user-1");
    });
  });

  it("shows success after clear ban", async () => {
    render(<ManageAdminsForm {...defaultProps} />);

    fireEvent.click(screen.getAllByText("adminManage.clearBan")[0]);

    await waitFor(() => {
      expect(screen.getByText(/adminManage\.clearBanSuccess/)).toBeInTheDocument();
    });
  });

  it("maps invalid_ban_date to translated error", async () => {
    mockBanUserUntil.mockResolvedValue({ error: "invalid_ban_date" });

    render(<ManageAdminsForm {...defaultProps} />);

    const inputs = document.querySelectorAll('input[type="datetime-local"]');
    fireEvent.change(inputs[0], { target: { value: "2026-03-20T12:30" } });

    fireEvent.click(screen.getAllByText("adminManage.setBan")[0]);

    await waitFor(() => {
      expect(screen.getByText(/adminManage\.invalidBanDate/)).toBeInTheDocument();
    });
  });

  it("maps ban_date_must_be_future to translated error", async () => {
    mockBanUserUntil.mockResolvedValue({ error: "ban_date_must_be_future" });

    render(<ManageAdminsForm {...defaultProps} />);

    const inputs = document.querySelectorAll('input[type="datetime-local"]');
    fireEvent.change(inputs[0], { target: { value: "2020-01-01T10:00" } });

    fireEvent.click(screen.getAllByText("adminManage.setBan")[0]);

    await waitFor(() => {
      expect(screen.getByText(/adminManage\.banDateMustBeFuture/)).toBeInTheDocument();
    });
  });
});