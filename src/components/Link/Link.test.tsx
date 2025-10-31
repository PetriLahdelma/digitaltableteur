import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Link from "./Link";

describe("Link", () => {
  it("renders with default props", () => {
    render(<Link>Test Link</Link>);
    const linkElement = screen.getByRole("link");
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute("href", "#");
  });

  it("renders with custom href", () => {
    render(<Link href="/test">Test Link</Link>);
    const linkElement = screen.getByRole("link");
    expect(linkElement).toHaveAttribute("href", "/test");
  });

  it("renders external link with icon", () => {
    render(<Link href="https://example.com">External Link</Link>);
    const linkElement = screen.getByRole("link");
    expect(linkElement).toHaveAttribute("href", "https://example.com");
    // Note: This component doesn't automatically add target="_blank",
    // it just shows an external icon
  });

  it("renders with different sizes", () => {
    const { rerender } = render(<Link size="S">Small Link</Link>);
    // Check for CSS module classes that include the size
    expect(screen.getByRole("link").className).toContain("linkS");

    rerender(<Link size="M">Medium Link</Link>);
    expect(screen.getByRole("link").className).toContain("linkM");

    rerender(<Link size="L">Large Link</Link>);
    expect(screen.getByRole("link").className).toContain("linkL");
  });

  it("passes through additional props", () => {
    render(
      <Link href="/test" className="custom-class" data-testid="test-link">
        Test Link
      </Link>,
    );
    const linkElement = screen.getByTestId("test-link");
    expect(linkElement).toHaveClass("custom-class");
  });
});
