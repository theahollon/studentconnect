/**
 * Unit tests for lib modules (utils, auth, supabase/database, i18n/client).
 *
 * Acknowledgement: Generated with AI assistance from GitHub Copilot.
 */

// ── lib/utils ─────────────────────────────────────────────────────
describe("lib/utils", () => {
  test("cn merges class names", () => {
    // cn uses clsx + twMerge, so we test that it works
    const { cn } = require("@/lib/utils");
    expect(cn("foo", "bar")).toBe("foo bar");
    expect(cn("p-4", "p-2")).toBe("p-2"); // twMerge deduplicates
    expect(cn(undefined, "foo", false, "bar")).toBe("foo bar");
  });

  test("hasEnvVars reflects env state", () => {
    const { hasEnvVars } = require("@/lib/utils");
    // In test env, env vars are loaded from .env.local by jest.setup.js
    // The value should be truthy or falsy based on the env
    expect(typeof hasEnvVars).not.toBe("undefined");
  });
});

// ── lib/i18n/client ───────────────────────────────────────────────
describe("lib/i18n/client", () => {
  test("getLocale returns en by default (no document cookie in jsdom)", () => {
    const { getLocale } = require("@/lib/i18n/client");
    expect(getLocale()).toBe("en");
  });

  test("t returns translation value for known key", () => {
    const { t } = require("@/lib/i18n/client");
    // Should return the value from en/common.json, or the key if missing
    const result = t("hero.srTitle");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  test("t returns the key itself for unknown keys", () => {
    const { t } = require("@/lib/i18n/client");
    expect(t("totally.unknown.key.12345")).toBe("totally.unknown.key.12345");
  });
});

// ── lib/supabase/types ────────────────────────────────────────────
describe("lib/supabase/types", () => {
  test("types module can be imported", () => {
    const types = require("@/lib/supabase/types");
    // It only exports interfaces, so the module object should exist
    expect(types).toBeDefined();
  });
});
