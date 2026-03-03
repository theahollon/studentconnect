/**
 * Unit tests for lib/supabase/server.ts (createClient).
 *
 * Acknowledgement: Generated with AI assistance from GitHub Copilot.
 */

// ── Mocks ─────────────────────────────────────────────────────────
const mockGetAll = jest.fn().mockReturnValue([]);
const mockSet = jest.fn();
jest.mock("next/headers", () => ({
  cookies: jest.fn().mockResolvedValue({
    getAll: mockGetAll,
    set: mockSet,
  }),
}));

const mockCreateServerClient = jest.fn().mockReturnValue({
  auth: { getUser: jest.fn() },
});
jest.mock("@supabase/ssr", () => ({
  createServerClient: (...args: unknown[]) => mockCreateServerClient(...args),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require("@/lib/supabase/server");

beforeEach(() => {
  jest.clearAllMocks();
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
});

test("creates a Supabase server client with correct URL and key", async () => {
  await createClient();

  expect(mockCreateServerClient).toHaveBeenCalledWith(
    "https://test.supabase.co",
    "test-anon-key",
    expect.objectContaining({
      cookies: expect.objectContaining({
        getAll: expect.any(Function),
        setAll: expect.any(Function),
      }),
    }),
  );
});

test("cookie adapter getAll reads from the cookie store", async () => {
  mockGetAll.mockReturnValue([{ name: "sb-token", value: "abc" }]);

  await createClient();

  // Extract the cookies adapter that was passed to createServerClient
  const cookiesArg = mockCreateServerClient.mock.calls[0][2].cookies;
  const result = cookiesArg.getAll();

  expect(result).toEqual([{ name: "sb-token", value: "abc" }]);
});

test("cookie adapter setAll writes to the cookie store", async () => {
  await createClient();

  const cookiesArg = mockCreateServerClient.mock.calls[0][2].cookies;
  cookiesArg.setAll([
    { name: "sb-token", value: "xyz", options: { path: "/" } },
  ]);

  expect(mockSet).toHaveBeenCalledWith("sb-token", "xyz", { path: "/" });
});

test("cookie adapter setAll does not throw when set fails", async () => {
  mockSet.mockImplementation(() => {
    throw new Error("Read-only cookies in Server Component");
  });

  await createClient();

  const cookiesArg = mockCreateServerClient.mock.calls[0][2].cookies;

  // Should not throw — the catch block in server.ts swallows the error
  expect(() =>
    cookiesArg.setAll([{ name: "sb-token", value: "xyz", options: {} }]),
  ).not.toThrow();
});
