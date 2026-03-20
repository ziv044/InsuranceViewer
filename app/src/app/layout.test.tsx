import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RootLayout from "./layout";

// Mock next/font/google to avoid font loading in tests
vi.mock("next/font/google", () => ({
  Assistant: () => ({ variable: "--font-heading" }),
  Heebo: () => ({ variable: "--font-sans" }),
}));

// Mock Providers to avoid complex dependencies in smoke test
vi.mock("@/components/Providers", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("RootLayout", () => {
  it("renders children", () => {
    render(
      <RootLayout>
        <div data-testid="child">Hello</div>
      </RootLayout>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
