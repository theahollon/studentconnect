/**
 * Unit tests for app/auth/confirm/route.ts (GET handler).
 *
 * Acknowledgement: Generated with AI assistance from GitHub Copilot.
 */

// ── Mocks ─────────────────────────────────────────────────────────
jest.mock("server-only", () => ({}));
jest.mock("next/headers", () => ({
  cookies: jest.fn().mockResolvedValue({ get: jest.fn() }),
}));

const mockVerifyOtp = jest.fn();
jest.mock("@/lib/supabase/server", () => ({
  __esModule: true,
  createClient: jest.fn().mockResolvedValue({
    auth: { verifyOtp: (...args: unknown[]) => mockVerifyOtp(...args) },
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
const { GET } = require("@/app/auth/confirm/route");

beforeEach(() => {
  jest.clearAllMocks();
});

function fakeRequest(params: Record<string, string>) {
  const url = new URL("http://localhost:3000/auth/confirm");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return { url: url.toString() } as unknown;
}

test("redirects to next on successful OTP verification", async () => {
  mockVerifyOtp.mockResolvedValue({ error: null });

  await expect(
    GET(fakeRequest({ token_hash: "abc123", type: "email", next: "/dashboard" })),
  ).rejects.toThrow("REDIRECT:/dashboard");

  expect(mockVerifyOtp).toHaveBeenCalledWith({
    type: "email",
    token_hash: "abc123",
  });
  expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
});

test("redirects to / by default when next is not specified", async () => {
  mockVerifyOtp.mockResolvedValue({ error: null });

  await expect(
    GET(fakeRequest({ token_hash: "abc123", type: "signup" })),
  ).rejects.toThrow("REDIRECT:/");

  expect(mockRedirect).toHaveBeenCalledWith("/");
});

test("redirects to error page when OTP verification fails", async () => {
  mockVerifyOtp.mockResolvedValue({ error: { message: "Token expired" } });

  await expect(
    GET(fakeRequest({ token_hash: "abc123", type: "email" })),
  ).rejects.toThrow("REDIRECT:/auth/error?error=Token expired");

  expect(mockRedirect).toHaveBeenCalledWith(
    "/auth/error?error=Token expired",
  );
});

test("redirects to error page when token_hash is missing", async () => {
  await expect(
    GET(fakeRequest({ type: "email" })),
  ).rejects.toThrow("REDIRECT:/auth/error?error=No token hash or type");

  expect(mockVerifyOtp).not.toHaveBeenCalled();
});

test("redirects to error page when type is missing", async () => {
  await expect(
    GET(fakeRequest({ token_hash: "abc123" })),
  ).rejects.toThrow("REDIRECT:/auth/error?error=No token hash or type");

  expect(mockVerifyOtp).not.toHaveBeenCalled();
});
