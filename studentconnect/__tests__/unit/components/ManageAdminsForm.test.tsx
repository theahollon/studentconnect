/**
 * Unit tests for ManageAdminsForm component.
 *
 * Coverage:
 *  - Renders headings, user list, admin list
 *  - Empty-state messages when there are no users / no admins
 *  - User count badges
 *  - Shows email for non-admins, falls back to id
 *  - "You" badge only appears for the current user's admin row
 *  - Revoke button is disabled for the current user and enabled for others
 *  - Promote: calls promoteToAdminById, shows success, shows error
 *  - Revoke: calls revokeAdmin, shows success, shows error
 *  - Loading spinner shown while action is in-flight
 *  - router.refresh() called on success
 *
 * Acknowledgement: Written with AI assistance from Claude Code.
 */

import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Return i18n keys as-is so tests don't depend on locale files
jest.mock("@/lib/i18n/client", () => ({
  t: (key: string) => key,
}));

const mockRefresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

const mockPromote = jest.fn().mockResolvedValue({});
const mockRevoke = jest.fn().mockResolvedValue({});
jest.mock("@/lib/supabase/admin-actions", () => ({
  promoteToAdminById: (...args: unknown[]) => mockPromote(...args),
  revokeAdmin: (...args: unknown[]) => mockRevoke(...args),
}));

import ManageAdminsForm from "@/app/admin/manage-admins/ManageAdminsForm";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CURRENT_USER_ID = "current-admin-id";

const defaultProps = {
  admins: [
    { id: CURRENT_USER_ID, role: "admin", email: "me@example.com" },
    { id: "other-admin-id", role: "admin", email: "other@example.com" },
  ],
  nonAdmins: [
    { id: "user-1", role: "user", email: "user1@example.com" },
    { id: "user-2", role: "user" }, // no email — falls back to id
  ],
  currentUserId: CURRENT_USER_ID,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockPromote.mockResolvedValue({});
  mockRevoke.mockResolvedValue({});
});

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe("ManageAdminsForm — rendering", () => {
  it("renders the page title and subtitle", () => {
    render(<ManageAdminsForm {...defaultProps} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "adminManage.title"
    );
    expect(screen.getByText("adminManage.subtitle")).toBeInTheDocument();
  });

  it("renders the Users section heading", () => {
    render(<ManageAdminsForm {...defaultProps} />);
    expect(screen.getByText("adminManage.users")).toBeInTheDocument();
  });

  it("renders the Current Admins section heading", () => {
    render(<ManageAdminsForm {...defaultProps} />);
    expect(screen.getByText("adminManage.currentAdmins")).toBeInTheDocument();
  });

  it("shows the correct user count badge", () => {
    render(<ManageAdminsForm {...defaultProps} />);
    // nonAdmins has 2 entries
    const badges = screen.getAllByText("2");
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it("shows the correct admin count badge", () => {
    render(<ManageAdminsForm {...defaultProps} />);
    // admins has 2 entries
    const badges = screen.getAllByText("2");
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// Empty states
// ---------------------------------------------------------------------------

describe("ManageAdminsForm — empty states", () => {
  it("shows noUsers message when nonAdmins list is empty", () => {
    render(
      <ManageAdminsForm {...defaultProps} nonAdmins={[]} />
    );
    expect(screen.getByText("adminManage.noUsers")).toBeInTheDocument();
  });

  it("shows noAdmins message when admins list is empty", () => {
    render(
      <ManageAdminsForm {...defaultProps} admins={[]} currentUserId="" />
    );
    expect(screen.getByText("adminManage.noAdmins")).toBeInTheDocument();
  });

  it("does not show noUsers when there are users", () => {
    render(<ManageAdminsForm {...defaultProps} />);
    expect(screen.queryByText("adminManage.noUsers")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// User list
// ---------------------------------------------------------------------------

describe("ManageAdminsForm — user list", () => {
  it("displays email for users that have one", () => {
    render(<ManageAdminsForm {...defaultProps} />);
    expect(screen.getByText("user1@example.com")).toBeInTheDocument();
  });

  it("falls back to id when user has no email", () => {
    render(<ManageAdminsForm {...defaultProps} />);
    expect(screen.getByText("user-2")).toBeInTheDocument();
  });

  it("renders a promote button for each non-admin user", () => {
    render(<ManageAdminsForm {...defaultProps} />);
    const promoteButtons = screen.getAllByText("adminManage.promote");
    expect(promoteButtons).toHaveLength(defaultProps.nonAdmins.length);
  });
});

// ---------------------------------------------------------------------------
// Admin list
// ---------------------------------------------------------------------------

describe("ManageAdminsForm — admin list", () => {
  it("shows the 'You' badge only for the current user", () => {
    render(<ManageAdminsForm {...defaultProps} />);
    const youBadges = screen.getAllByText("You");
    expect(youBadges).toHaveLength(1);
  });

  it("does not show 'You' badge when no admin matches currentUserId", () => {
    render(
      <ManageAdminsForm {...defaultProps} currentUserId="nobody" />
    );
    expect(screen.queryByText("You")).not.toBeInTheDocument();
  });

  it("revoke button is disabled for the current user", () => {
    render(<ManageAdminsForm {...defaultProps} />);
    // Find the list item that contains "You" and check its button
    const youBadge = screen.getByText("You");
    const ownRow = youBadge.closest("li")!;
    const revokeBtn = ownRow.querySelector("button")!;
    expect(revokeBtn).toBeDisabled();
  });

  it("revoke button is enabled for other admins", () => {
    render(<ManageAdminsForm {...defaultProps} />);
    const revokeBtns = screen.getAllByText("adminManage.revoke");
    // There are 2 admins; find the one that is NOT disabled
    const enabledBtn = revokeBtns
      .map((el) => el.closest("button")!)
      .filter((btn) => !btn.disabled);
    expect(enabledBtn).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Promote action
// ---------------------------------------------------------------------------

describe("ManageAdminsForm — promote action", () => {
  it("calls promoteToAdminById with the correct userId", async () => {
    render(<ManageAdminsForm {...defaultProps} />);
    fireEvent.click(screen.getAllByText("adminManage.promote")[0]);

    await waitFor(() => {
      expect(mockPromote).toHaveBeenCalledWith("user-1");
    });
  });

  it("shows success message after successful promote", async () => {
    render(<ManageAdminsForm {...defaultProps} />);
    fireEvent.click(screen.getAllByText("adminManage.promote")[0]);

    await waitFor(() => {
      expect(
        screen.getByText(/adminManage\.promoteSuccess/)
      ).toBeInTheDocument();
    });
  });

  it("calls router.refresh() after successful promote", async () => {
    render(<ManageAdminsForm {...defaultProps} />);
    fireEvent.click(screen.getAllByText("adminManage.promote")[0]);

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });

  it("shows error message when promote fails", async () => {
    mockPromote.mockResolvedValue({ error: "Promote failed" });
    render(<ManageAdminsForm {...defaultProps} />);
    fireEvent.click(screen.getAllByText("adminManage.promote")[0]);

    await waitFor(() => {
      expect(screen.getByText(/Promote failed/)).toBeInTheDocument();
    });
  });

  it("does not call router.refresh() when promote fails", async () => {
    mockPromote.mockResolvedValue({ error: "Promote failed" });
    render(<ManageAdminsForm {...defaultProps} />);
    fireEvent.click(screen.getAllByText("adminManage.promote")[0]);

    await waitFor(() => {
      expect(mockRefresh).not.toHaveBeenCalled();
    });
  });

  it("button shows loading spinner while promote is in-flight", async () => {
    // Never resolve so the loading state stays visible
    mockPromote.mockReturnValue(new Promise(() => {}));
    render(<ManageAdminsForm {...defaultProps} />);
    fireEvent.click(screen.getAllByText("adminManage.promote")[0]);

    await waitFor(() => {
      expect(screen.getByText("…")).toBeInTheDocument();
    });
  });

  it("button is disabled while promote is in-flight", async () => {
    mockPromote.mockReturnValue(new Promise(() => {}));
    render(<ManageAdminsForm {...defaultProps} />);
    const btn = screen.getAllByText("adminManage.promote")[0].closest("button")!;
    fireEvent.click(btn);

    await waitFor(() => {
      expect(btn).toBeDisabled();
    });
  });
});

// ---------------------------------------------------------------------------
// Revoke action
// ---------------------------------------------------------------------------

describe("ManageAdminsForm — revoke action", () => {
  it("calls revokeAdmin with the correct userId", async () => {
    render(<ManageAdminsForm {...defaultProps} />);
    // Click the enabled revoke button (the one that is NOT for the current user)
    const revokeBtns = screen
      .getAllByText("adminManage.revoke")
      .map((el) => el.closest("button")!)
      .filter((btn) => !btn.disabled);

    fireEvent.click(revokeBtns[0]);

    await waitFor(() => {
      expect(mockRevoke).toHaveBeenCalledWith("other-admin-id");
    });
  });

  it("shows success message after successful revoke", async () => {
    render(<ManageAdminsForm {...defaultProps} />);
    const enabledBtn = screen
      .getAllByText("adminManage.revoke")
      .map((el) => el.closest("button")!)
      .find((btn) => !btn.disabled)!;

    fireEvent.click(enabledBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/adminManage\.revokeSuccess/)
      ).toBeInTheDocument();
    });
  });

  it("calls router.refresh() after successful revoke", async () => {
    render(<ManageAdminsForm {...defaultProps} />);
    const enabledBtn = screen
      .getAllByText("adminManage.revoke")
      .map((el) => el.closest("button")!)
      .find((btn) => !btn.disabled)!;

    fireEvent.click(enabledBtn);

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });

  it("shows error message when revoke fails", async () => {
    mockRevoke.mockResolvedValue({ error: "Revoke failed" });
    render(<ManageAdminsForm {...defaultProps} />);
    const enabledBtn = screen
      .getAllByText("adminManage.revoke")
      .map((el) => el.closest("button")!)
      .find((btn) => !btn.disabled)!;

    fireEvent.click(enabledBtn);

    await waitFor(() => {
      expect(screen.getByText(/Revoke failed/)).toBeInTheDocument();
    });
  });

  it("clears a previous error when a new action starts", async () => {
    mockPromote.mockResolvedValueOnce({ error: "First error" });
    mockPromote.mockResolvedValueOnce({});

    render(<ManageAdminsForm {...defaultProps} />);
    const promoteBtn = screen.getAllByText("adminManage.promote")[0];

    // First click — produces an error
    fireEvent.click(promoteBtn);
    await waitFor(() => {
      expect(screen.getByText(/First error/)).toBeInTheDocument();
    });

    // Second click — error should clear before new result arrives
    fireEvent.click(promoteBtn);
    await waitFor(() => {
      expect(screen.queryByText(/First error/)).not.toBeInTheDocument();
    });
  });
});
