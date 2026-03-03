/**
 * Unit tests for UI components (Badge, Button, Card, Input, Label, Checkbox).
 *
 * Acknowledgement: Generated with AI assistance from GitHub Copilot.
 */

import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("@/lib/utils", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
}));

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

// ── Badge ─────────────────────────────────────────────────────────
describe("Badge", () => {
  test("renders with children", () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText("Test Badge")).toBeInTheDocument();
  });

  test("accepts variant prop", () => {
    const { container } = render(<Badge variant="destructive">Error</Badge>);
    expect(container.firstChild).toBeInTheDocument();
  });
});

// ── Button ────────────────────────────────────────────────────────
describe("Button", () => {
  test("renders button with text", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: "Click me" }),
    ).toBeInTheDocument();
  });

  test("renders disabled button", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  test("renders as child element with asChild", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>,
    );
    expect(screen.getByRole("link", { name: "Link Button" })).toHaveAttribute(
      "href",
      "/test",
    );
  });

  test("supports variant and size props", () => {
    const { container } = render(
      <Button variant="outline" size="sm">
        Small
      </Button>,
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});

// ── Card ──────────────────────────────────────────────────────────
describe("Card", () => {
  test("renders full card structure", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Body content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Body content")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });
});

// ── Input ─────────────────────────────────────────────────────────
describe("Input", () => {
  test("renders input element", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  test("accepts type prop", () => {
    render(<Input type="email" placeholder="Email" />);
    expect(screen.getByPlaceholderText("Email")).toHaveAttribute(
      "type",
      "email",
    );
  });
});

// ── Label ─────────────────────────────────────────────────────────
describe("Label", () => {
  test("renders label with text", () => {
    render(<Label>Username</Label>);
    expect(screen.getByText("Username")).toBeInTheDocument();
  });

  test("associates with input via htmlFor", () => {
    render(
      <>
        <Label htmlFor="name">Name</Label>
        <Input id="name" />
      </>,
    );
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
  });
});

// ── Checkbox ──────────────────────────────────────────────────────
describe("Checkbox", () => {
  test("renders checkbox", () => {
    render(<Checkbox />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  test("supports disabled state", () => {
    render(<Checkbox disabled />);
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });
});
