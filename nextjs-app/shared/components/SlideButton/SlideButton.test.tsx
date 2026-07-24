import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { SlideButton } from "./SlideButton";

expect.extend(toHaveNoViolations);

describe("SlideButton", () => {
  it("renders a link named by its label, pointing at href", () => {
    render(<SlideButton label="Start your sprint" href="/contact" />);
    const link = screen.getByRole("link", { name: "Start your sprint" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/contact");
  });

  it("forwards arbitrary anchor attributes (e.g. data-* hooks)", () => {
    render(
      <SlideButton
        label="Start your sprint"
        href="/contact"
        data-donny-interest="design-sprint"
      />
    );
    expect(screen.getByRole("link")).toHaveAttribute(
      "data-donny-interest",
      "design-sprint"
    );
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <SlideButton label="Start your sprint" href="/contact" />
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
