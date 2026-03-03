/**
 * Unit tests for tutorial components.
 *
 * Acknowledgement: Generated with AI assistance from GitHub Copilot.
 */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

jest.mock("@/lib/utils", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
}));

import { TutorialStep } from "@/components/tutorial/tutorial-step";
import { ConnectSupabaseSteps } from "@/components/tutorial/connect-supabase-steps";
import { FetchDataSteps } from "@/components/tutorial/fetch-data-steps";
import { CodeBlock } from "@/components/tutorial/code-block";

describe("TutorialStep", () => {
  test("renders title and children", () => {
    render(
      <TutorialStep title="My Step">
        <p>Step content</p>
      </TutorialStep>,
    );
    expect(screen.getByText("My Step")).toBeInTheDocument();
    expect(screen.getByText("Step content")).toBeInTheDocument();
  });

  test("renders a checkbox", () => {
    render(
      <TutorialStep title="Check Step">
        <p>Content</p>
      </TutorialStep>,
    );
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });
});

describe("ConnectSupabaseSteps", () => {
  test("renders steps", () => {
    render(<ConnectSupabaseSteps />);
    expect(screen.getByText("Create Supabase project")).toBeInTheDocument();
    expect(
      screen.getByText("Declare environment variables"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Restart your Next.js development server"),
    ).toBeInTheDocument();
  });
});

describe("FetchDataSteps", () => {
  test("renders fetch data steps", () => {
    render(<FetchDataSteps />);
    expect(
      screen.getByText("Create some tables and insert some data"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Enable Row Level Security (RLS)"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Build in a weekend and scale to millions!"),
    ).toBeInTheDocument();
  });
});

describe("CodeBlock", () => {
  test("renders code content", () => {
    render(<CodeBlock code="console.log('hello')" />);
    expect(screen.getByText("console.log('hello')")).toBeInTheDocument();
  });

  test("has a copy button", () => {
    render(<CodeBlock code="test" />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
