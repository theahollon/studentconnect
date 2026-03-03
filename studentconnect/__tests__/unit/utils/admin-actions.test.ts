/**
 * Unit tests for admin server actions (promoteToAdminById, revokeAdmin).
 *
 * Edge cases covered:
 *  - Happy path: correct Supabase query is executed and empty object returned
 *  - Supabase error: error message is surfaced to the caller
 *  - Unauthorised caller: requireAdmin throws → action rejects
 *  - Correct userId is forwarded to the DB query
 *  - Self-revoke has no server-side guard (only the UI disables the button)
 *
 * Acknowledgement: Written with AI assistance from Claude Code.
 */

// --- Mocks must be declared before any imports ---

jest.mock("../../../lib/auth", () => ({
  requireAdmin: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../../../lib/supabase/server", () => {
  const mockEq = jest.fn().mockResolvedValue({ error: null });
  const mockUpdate = jest.fn(() => ({ eq: mockEq }));
  const mockFrom = jest.fn(() => ({ update: mockUpdate }));

  return {
    createClient: jest.fn().mockResolvedValue({ from: mockFrom }),
    __mocks__: { mockEq, mockUpdate, mockFrom },
  };
});

// --- Resolve modules after mocks are in place ---

const { promoteToAdminById, revokeAdmin } = require("../../../lib/supabase/admin-actions");
const serverModule = require("../../../lib/supabase/server");
const authModule = require("../../../lib/auth");
const mocks: {
  mockEq: jest.Mock;
  mockUpdate: jest.Mock;
  mockFrom: jest.Mock;
} = serverModule.__mocks__;

// ---------------------------------------------------------------------------

describe("promoteToAdminById", () => {
  afterEach(() => {
    jest.clearAllMocks();
    mocks.mockEq.mockResolvedValue({ error: null });
    authModule.requireAdmin.mockResolvedValue(undefined);
  });

  it("returns {} and calls requireAdmin once on success", async () => {
    const result = await promoteToAdminById("user-abc");

    expect(result).toEqual({});
    expect(authModule.requireAdmin).toHaveBeenCalledTimes(1);
  });

  it("updates the profiles table with role: 'admin'", async () => {
    await promoteToAdminById("user-abc");

    expect(mocks.mockFrom).toHaveBeenCalledWith("profiles");
    expect(mocks.mockUpdate).toHaveBeenCalledWith({ role: "admin" });
  });

  it("passes the correct userId to the eq filter", async () => {
    const userId = "specific-user-id-123";
    await promoteToAdminById(userId);

    expect(mocks.mockEq).toHaveBeenCalledWith("id", userId);
  });

  it("returns { error } when Supabase returns an error", async () => {
    mocks.mockEq.mockResolvedValue({ error: { message: "Row not found" } });

    const result = await promoteToAdminById("user-abc");

    expect(result).toEqual({ error: "Row not found" });
  });

  it("throws when the caller is not an admin", async () => {
    authModule.requireAdmin.mockRejectedValue(new Error("NEXT_REDIRECT"));

    await expect(promoteToAdminById("user-abc")).rejects.toThrow();
  });

  it("does not update anything when requireAdmin throws", async () => {
    authModule.requireAdmin.mockRejectedValue(new Error("NEXT_REDIRECT"));

    await promoteToAdminById("user-abc").catch(() => {});

    expect(mocks.mockFrom).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------

describe("revokeAdmin", () => {
  afterEach(() => {
    jest.clearAllMocks();
    mocks.mockEq.mockResolvedValue({ error: null });
    authModule.requireAdmin.mockResolvedValue(undefined);
  });

  it("returns {} and calls requireAdmin once on success", async () => {
    const result = await revokeAdmin("admin-xyz");

    expect(result).toEqual({});
    expect(authModule.requireAdmin).toHaveBeenCalledTimes(1);
  });

  it("updates the profiles table with role: 'user'", async () => {
    await revokeAdmin("admin-xyz");

    expect(mocks.mockFrom).toHaveBeenCalledWith("profiles");
    expect(mocks.mockUpdate).toHaveBeenCalledWith({ role: "user" });
  });

  it("passes the correct userId to the eq filter", async () => {
    const userId = "admin-to-demote-456";
    await revokeAdmin(userId);

    expect(mocks.mockEq).toHaveBeenCalledWith("id", userId);
  });

  it("returns { error } when Supabase returns an error", async () => {
    mocks.mockEq.mockResolvedValue({ error: { message: "Permission denied" } });

    const result = await revokeAdmin("admin-xyz");

    expect(result).toEqual({ error: "Permission denied" });
  });

  it("throws when the caller is not an admin", async () => {
    authModule.requireAdmin.mockRejectedValue(new Error("NEXT_REDIRECT"));

    await expect(revokeAdmin("admin-xyz")).rejects.toThrow();
  });

  it("has no server-side guard against self-revoke (only the UI prevents it)", async () => {
    // The UI disables the revoke button for the current user, but the server
    // action itself accepts any valid userId — including the caller's own id.
    // This test documents that intentional gap so it is not accidentally "fixed"
    // in a way that breaks the UI-level protection instead.
    const result = await revokeAdmin("current-user-id");

    expect(result).toEqual({});
    expect(mocks.mockUpdate).toHaveBeenCalledWith({ role: "user" });
  });
});
