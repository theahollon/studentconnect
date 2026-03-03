/**
 * Unit tests for lib/i18n/server.ts (getLocale, t).
 *
 * Acknowledgement: Generated with AI assistance from GitHub Copilot.
 */

// ── Mocks ─────────────────────────────────────────────────────────
jest.mock("server-only", () => ({}));

const mockGet = jest.fn();
jest.mock("next/headers", () => ({
  cookies: jest.fn().mockResolvedValue({
    get: (name: string) => mockGet(name),
  }),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getLocale, t } = require("@/lib/i18n/server");

beforeEach(() => {
  jest.clearAllMocks();
});

// ── getLocale ─────────────────────────────────────────────────────
describe("getLocale", () => {
  test("returns 'en' when no NEXT_LOCALE cookie is set", async () => {
    mockGet.mockReturnValue(undefined);
    expect(await getLocale()).toBe("en");
  });

  test("returns 'en' when NEXT_LOCALE cookie is 'en'", async () => {
    mockGet.mockReturnValue({ value: "en" });
    expect(await getLocale()).toBe("en");
  });

  test("returns 'it' when NEXT_LOCALE cookie is 'it'", async () => {
    mockGet.mockReturnValue({ value: "it" });
    expect(await getLocale()).toBe("it");
  });

  test("returns 'en' for any unrecognised locale value", async () => {
    mockGet.mockReturnValue({ value: "fr" });
    expect(await getLocale()).toBe("en");
  });
});

// ── t ─────────────────────────────────────────────────────────────
describe("t", () => {
  test("returns English translation for a known key", async () => {
    mockGet.mockReturnValue(undefined); // defaults to en
    const result = await t("hero.srTitle");
    expect(result).toBe("Supabase and Next.js Starter Template");
  });

  test("returns Italian translation when locale is it", async () => {
    mockGet.mockReturnValue({ value: "it" });
    // We just verify it returns a string (the Italian JSON must have the key)
    const result = await t("hero.srTitle");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  test("returns the key itself for an unknown key", async () => {
    mockGet.mockReturnValue(undefined);
    const result = await t("totally.unknown.key.xyz");
    expect(result).toBe("totally.unknown.key.xyz");
  });
});
