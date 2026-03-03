/**
 * Unit tests for lib/supabase/proxy.ts (updateSession middleware).
 *
 * Acknowledgement: Generated with AI assistance from GitHub Copilot.
 */

/**
 * Unit tests for lib/supabase/proxy.ts (updateSession middleware).
 *
 * The whatwg-fetch polyfill in jest.setup.js conflicts with NextRequest
 * construction, so we mock the module at a higher level and test the
 * routing logic by controlling the mock's behaviour.
 *
 * Acknowledgement: Generated with AI assistance from GitHub Copilot.
 */

// ── Mocks ─────────────────────────────────────────────────────────
const mockGetClaims = jest.fn();
const mockRedirect = jest.fn();
const mockCookiesGetAll = jest.fn().mockReturnValue([]);
const mockCookiesSet = jest.fn();
const mockResponseCookiesSet = jest.fn();

// We'll track calls to NextResponse.next and NextResponse.redirect
let capturedResponse: any;

jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn((_url: string, _key: string, opts: any) => {
    opts?.cookies?.getAll?.();
    return {
      auth: { getClaims: () => mockGetClaims() },
    };
  }),
}));

jest.mock("@/lib/utils", () => {
  let _hasEnvVars = true;
  return {
    get hasEnvVars() {
      return _hasEnvVars;
    },
    set hasEnvVars(v: boolean) {
      _hasEnvVars = v;
    },
  };
});

// Re-read the actual source to test the logic, but with a helper
// that builds a minimal NextRequest-like object.
function buildFakeRequest(path: string) {
  const url = new URL(path, "http://localhost:3000");
  // Add clone() to match NextURL's interface used by the proxy
  (url as any).clone = () => new URL(url.toString());
  return {
    url: url.toString(),
    nextUrl: url,
    cookies: {
      getAll: mockCookiesGetAll,
      set: mockCookiesSet,
    },
  } as any;
}

// We can't easily import the real function because NextResponse.next/redirect
// also depend on platform APIs. Instead, test the core logic directly.
// Read the proxy source and replicate its decision tree in a unit-testable way.

import { updateSession } from "@/lib/supabase/proxy";

// In the test environment, NextResponse.next() and NextResponse.redirect()
// will work because next/jest transforms them. The issue is only with
// NextRequest construction due to whatwg-fetch overriding Request.

beforeEach(() => {
  jest.clearAllMocks();
  // Reset hasEnvVars
  const utils = require("@/lib/utils");
  utils.hasEnvVars = true;
});

test("returns early when env vars are missing", async () => {
  const utils = require("@/lib/utils");
  utils.hasEnvVars = false;

  const response = await updateSession(buildFakeRequest("/events"));
  expect(response.status).toBe(200);
  expect(mockGetClaims).not.toHaveBeenCalled();
});

test("allows authenticated users through", async () => {
  mockGetClaims.mockResolvedValue({
    data: { claims: { email: "user@test.com" } },
  });

  const response = await updateSession(buildFakeRequest("/events"));
  expect(response.status).toBe(200);
  expect(response.headers.get("location")).toBeNull();
});

test("allows unauthenticated users to access /", async () => {
  mockGetClaims.mockResolvedValue({ data: { claims: null } });

  const response = await updateSession(buildFakeRequest("/"));
  expect(response.status).toBe(200);
});

test("allows unauthenticated users to access /auth paths", async () => {
  mockGetClaims.mockResolvedValue({ data: { claims: null } });

  const response = await updateSession(buildFakeRequest("/auth/login"));
  expect(response.status).toBe(200);
});

test("allows unauthenticated users to access /login", async () => {
  mockGetClaims.mockResolvedValue({ data: { claims: null } });

  const response = await updateSession(buildFakeRequest("/login"));
  expect(response.status).toBe(200);
});

test("redirects unauthenticated users from /events to /auth/login", async () => {
  mockGetClaims.mockResolvedValue({ data: { claims: null } });

  const response = await updateSession(buildFakeRequest("/events"));
  expect(response.status).toBe(307);
  expect(response.headers.get("location")).toContain("/auth/login");
});

test("redirects unauthenticated users from /protected to /auth/login", async () => {
  mockGetClaims.mockResolvedValue({ data: { claims: null } });

  const response = await updateSession(buildFakeRequest("/protected"));
  expect(response.status).toBe(307);
  expect(response.headers.get("location")).toContain("/auth/login");
});
