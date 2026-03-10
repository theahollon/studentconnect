/**
 * Extra unit tests for moderation actions in lib/supabase/admin-actions.ts
 */

export {};

jest.mock("server-only", () => ({}));

const mockRequireAdmin = jest.fn();
jest.mock("@/lib/auth", () => ({
  requireAdmin: () => mockRequireAdmin(),
}));

const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockSelectEq = jest.fn();
const mockSingle = jest.fn();
const mockUpdate = jest.fn();
const mockUpdateEq = jest.fn();

jest.mock("@/lib/supabase/server", () => ({
  __esModule: true,
  createClient: jest.fn().mockResolvedValue({
    from: (...args: unknown[]) => mockFrom(...args),
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();

  mockRequireAdmin.mockResolvedValue(undefined);

  mockFrom.mockImplementation(() => ({
    select: (...args: unknown[]) => mockSelect(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
  }));

  mockSelect.mockImplementation(() => ({
    eq: (...args: unknown[]) => mockSelectEq(...args),
  }));

  mockSelectEq.mockImplementation(() => ({
    single: () => mockSingle(),
  }));

  mockUpdate.mockImplementation(() => ({
    eq: (...args: unknown[]) => mockUpdateEq(...args),
  }));
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  addStrike,
  removeStrike,
  banUserUntil,
  clearBan,
} = require("@/lib/supabase/admin-actions");

describe("admin-actions moderation helpers", () => {
  test("addStrike increments strikes by one", async () => {
    mockSingle.mockResolvedValue({ data: { strikes: 2 }, error: null });
    mockUpdateEq.mockResolvedValue({ error: null });

    const result = await addStrike("user-1");

    expect(mockUpdate).toHaveBeenCalledWith({ strikes: 3 });
    expect(mockUpdateEq).toHaveBeenCalledWith("id", "user-1");
    expect(result).toEqual({});
  });

  test("removeStrike never goes below zero", async () => {
    mockSingle.mockResolvedValue({ data: { strikes: 0 }, error: null });
    mockUpdateEq.mockResolvedValue({ error: null });

    const result = await removeStrike("user-1");

    expect(mockUpdate).toHaveBeenCalledWith({ strikes: 0 });
    expect(mockUpdateEq).toHaveBeenCalledWith("id", "user-1");
    expect(result).toEqual({});
  });

  test("removeStrike decrements when strikes are above zero", async () => {
    mockSingle.mockResolvedValue({ data: { strikes: 3 }, error: null });
    mockUpdateEq.mockResolvedValue({ error: null });

    const result = await removeStrike("user-1");

    expect(mockUpdate).toHaveBeenCalledWith({ strikes: 2 });
    expect(mockUpdateEq).toHaveBeenCalledWith("id", "user-1");
    expect(result).toEqual({});
  });

  test("banUserUntil rejects malformed date without writing to db", async () => {
    const result = await banUserUntil("user-1", "not-a-date");

    expect(result).toHaveProperty("error");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  test("banUserUntil rejects past date without writing to db", async () => {
    const result = await banUserUntil("user-1", "2020-01-01T10:00");

    expect(result).toHaveProperty("error");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  test("banUserUntil writes ISO timestamp for valid future date", async () => {
    mockUpdateEq.mockResolvedValue({ error: null });

    const result = await banUserUntil("user-1", "2099-03-20T12:30");

    const updateArg = mockUpdate.mock.calls[0][0];
    expect(updateArg).toHaveProperty("banned_until");
    expect(typeof updateArg.banned_until).toBe("string");
    expect(updateArg.banned_until).toContain("2099-03-20");

    expect(mockUpdateEq).toHaveBeenCalledWith("id", "user-1");
    expect(result).toEqual({});
  });

  test("clearBan sets banned_until to null", async () => {
    mockUpdateEq.mockResolvedValue({ error: null });

    const result = await clearBan("user-1");

    expect(mockUpdate).toHaveBeenCalledWith({ banned_until: null });
    expect(mockUpdateEq).toHaveBeenCalledWith("id", "user-1");
    expect(result).toEqual({});
  });
});