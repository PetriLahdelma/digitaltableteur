import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { Center } from "./Center";

expect.extend(toHaveNoViolations);

describe("Center", () => {
  it("renders children with both-axis centering classes", () => {
    const { container } = render(<Center>focal</Center>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("items-center");
    expect(el.className).toContain("justify-center");
    expect(screen.getByText("focal")).toBeInTheDocument();
  });

  it("merges a caller className (the sizing hook)", () => {
    const { container } = render(<Center className="min-h-48">x</Center>);
    expect((container.firstChild as HTMLElement).className).toContain("min-h-48");
  });

  it("renders as the given element", () => {
    const { container } = render(<Center as="section">x</Center>);
    expect((container.firstChild as HTMLElement).tagName).toBe("SECTION");
  });

  it("has no axe violations", async () => {
    const { container } = render(<Center><p>content</p></Center>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
