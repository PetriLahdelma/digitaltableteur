import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { SkipLink } from "./SkipLink";

expect.extend(toHaveNoViolations);

describe("SkipLink", () => {
  it("targets #main-content with an action-phrase label by default", () => {
    render(<SkipLink />);
    const link = screen.getByRole("link", { name: "Skip to main content" });
    expect(link).toHaveAttribute("href", "#main-content");
  });

  it("supports a custom target and label", () => {
    render(<SkipLink href="#results">Skip to search results</SkipLink>);
    expect(
      screen.getByRole("link", { name: "Skip to search results" }),
    ).toHaveAttribute("href", "#results");
  });

  it("stays focusable while visually hidden", () => {
    render(<SkipLink />);
    const link = screen.getByRole("link", { name: "Skip to main content" });
    link.focus();
    expect(link).toHaveFocus();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <div>
        <SkipLink />
        <main id="main-content">Content</main>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
