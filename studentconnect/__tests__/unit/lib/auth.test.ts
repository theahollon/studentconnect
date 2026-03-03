/**
 * Unit tests for lib/auth.ts (requireAdmin).
 *
 * Acknowledgement: Generated with AI assistance from GitHub Copilot.
 */

export {};

// ── Mocks ─────────────────────────────────────────────────────────
jest.mock("server-only", () => ({}));
jest.mock("next/headers", () => ({
  cookies: jest.fn().mockResolvedValue({ get: jest.fn() }),
}));

const mockGetUser = jest.fn();
const mockSingle = jest.fn();
jest.mock("@/lib/supabase/server", () => ({
  __esModule: true,
  createClient: jest.fn().mockResolvedValue({
    auth: { getUser: () => mockGetUser() },
    from: () => ({
      select: () => ({
        eq: () => ({ single: () => mockSingle() }),
      }),
    }),
  }),
}));

const mockRedirect = jest.fn();
jest.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    throw new Error(`REDIRECT:${url}`);
  },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { requireAdmin } = require("@/lib/auth");

beforeEach(() => {
  jest.clearAllMocks();
});

test("redirects to /login when no user is authenticated", async () => {
  mockGetUser.mockResolvedValue({ data: { user: null } });

  await expect(requireAdmin()).rejects.toThrow("REDIRECT:/login");
  expect(mockRedirect).toHaveBeenCalledWith("/login");
});

test("redirects to /unauthorized when user has no profile", async () => {
  mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
  mockSingle.mockResolvedValue({ data: null });

  await expect(requireAdmin()).rejects.toThrow("REDIRECT:/unauthorized");
  expect(mockRedirect).toHaveBeenCalledWith("/unauthorized");
});

test("redirects to /unauthorized when user role is not admin", async () => {
  mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
  mockSingle.mockResolvedValue({ data: { role: "user" } });

  await expect(requireAdmin()).rejects.toThrow("REDIRECT:/unauthorized");
  expect(mockRedirect).toHaveBeenCalledWith("/unauthorized");
});

test("does not redirect when user is admin", async () => {
  mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
  mockSingle.mockResolvedValue({ data: { role: "admin" } });

  await expect(requireAdmin()).resolves.toBeUndefined();
  expect(mockRedirect).not.toHaveBeenCalled();
});
