import React from "react";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect } from "vitest";
import { SocialIconLink } from "./SocialIconLink";

expect.extend(toHaveNoViolations);

function Glyph() {
  return <svg viewBox="0 0 16 16" />;
}

describe("SocialIconLink", () => {
  it("renders a link named by label with an aria-hidden icon", () => {
    render(
      <SocialIconLink href="https://example.com/x" label="Us on X">
        <Glyph />
      </SocialIconLink>,
    );
    const link = screen.getByRole("link", { name: "Us on X" });
    expect(link).toHaveAttribute("href", "https://example.com/x");
    expect(link.querySelector("[aria-hidden='true'] svg")).toBeInTheDocument();
  });

  it("is external-safe by default", () => {
    render(
      <SocialIconLink href="https://example.com" label="Profile">
        <Glyph />
      </SocialIconLink>,
    );
    const link = screen.getByRole("link", { name: "Profile" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("drops target/rel for internal links (external=false)", () => {
    render(
      <SocialIconLink href="/contact" label="Contact" external={false}>
        <Glyph />
      </SocialIconLink>,
    );
    const link = screen.getByRole("link", { name: "Contact" });
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
  });

  it("applies the size class", () => {
    const { container } = render(
      <SocialIconLink href="https://example.com" label="P" size="lg">
        <Glyph />
      </SocialIconLink>,
    );
    expect((container.firstElementChild as HTMLElement).className).toMatch(/lg/);
  });

  it("appends custom className and forwards anchor attributes", () => {
    render(
      <SocialIconLink
        href="https://example.com"
        label="P"
        className="custom-class"
        data-testid="social"
      >
        <Glyph />
      </SocialIconLink>,
    );
    const link = screen.getByTestId("social");
    expect(link.className).toContain("custom-class");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <>
        <SocialIconLink href="https://example.com/a" label="Instagram profile">
          <Glyph />
        </SocialIconLink>
        <SocialIconLink href="/inner" label="Internal" external={false}>
          <Glyph />
        </SocialIconLink>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
