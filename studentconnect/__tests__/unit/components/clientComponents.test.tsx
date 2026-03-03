/**
 * Unit tests for miscellaneous client components:
 * Hero, DeployButton, EnvVarWarning, ThemeSwitcher.
 *
 * Acknowledgement: Generated with AI assistance from GitHub Copilot.
 */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

jest.mock("@/lib/i18n/client", () => ({
  t: (key: string) => key,
  getLocale: () => "en",
}));

jest.mock("@/lib/utils", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
}));

// Mock next-themes for ThemeSwitcher
jest.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: jest.fn() }),
}));

import { Hero } from "@/components/hero";
import { DeployButton } from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { ThemeSwitcher } from "@/components/theme-switcher";

describe("Hero", () => {
  test("renders hero section with logos", () => {
    const { container } = render(<Hero />);
    expect(screen.getByText("hero.srTitle")).toBeInTheDocument();
    // The headline text is split across multiple elements, so check the container
    expect(container.textContent).toContain("hero.headlinePrefix");
  });
});

describe("DeployButton", () => {
  test("renders deploy button", () => {
    render(<DeployButton />);
    expect(screen.getByText("deployButton.label")).toBeInTheDocument();
  });
});

describe("EnvVarWarning", () => {
  test("renders warning badge and disabled buttons", () => {
    render(<EnvVarWarning />);
    expect(screen.getByText("envVarWarning.badge")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "envVarWarning.signIn" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "envVarWarning.signUp" }),
    ).toBeDisabled();
  });
});

describe("ThemeSwitcher", () => {
  test("renders theme switcher button", () => {
    render(<ThemeSwitcher />);
    // The trigger button should be rendered
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
