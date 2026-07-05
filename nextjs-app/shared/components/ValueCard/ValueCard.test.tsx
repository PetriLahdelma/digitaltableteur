import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { ValueCard } from "./ValueCard";

expect.extend(toHaveNoViolations);

const baseProps = {
  icon: <svg aria-hidden data-testid="icon" />,
  title: "Clarity first",
  description: "Interfaces should explain themselves before they decorate.",
};

describe("ValueCard", () => {
  it("renders the title and description inside an article region", () => {
    render(<ValueCard {...baseProps} />);
    expect(screen.getByRole("article")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Clarity first" }),
    ).toBeInTheDocument();
    expect(screen.getByText(baseProps.description)).toBeInTheDocument();
  });

  it("applies the variant surface class", () => {
    const { container } = render(<ValueCard {...baseProps} variant="elevated" />);
    expect((container.firstChild as HTMLElement).className).toContain("bg-card");
  });

  it("keeps the elevated lift flat under reduced motion", () => {
    const { container } = render(<ValueCard {...baseProps} variant="elevated" />);
    const className = (container.firstChild as HTMLElement).className;
    expect(className).toContain("motion-reduce:hover:translate-y-0");
    expect(className).toContain("motion-reduce:transition-none");
  });

  it("has no axe violations", async () => {
    const { container } = render(<ValueCard {...baseProps} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
