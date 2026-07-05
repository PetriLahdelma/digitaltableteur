import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { ServiceCard } from "./ServiceCard";

expect.extend(toHaveNoViolations);

const baseProps = {
  icon: <svg aria-hidden data-testid="icon" />,
  title: "Design systems",
  description: "Tokens, components, and governance that scale with your product.",
};

describe("ServiceCard", () => {
  it("renders the title and description", () => {
    render(<ServiceCard {...baseProps} />);
    expect(
      screen.getByRole("heading", { name: "Design systems" }),
    ).toBeInTheDocument();
    expect(screen.getByText(baseProps.description)).toBeInTheDocument();
  });

  it("renders a link when href is provided", () => {
    render(<ServiceCard {...baseProps} href="/services/design-systems" />);
    const link = screen.getByRole("link", { name: /Design systems/ });
    expect(link).toHaveAttribute("href", "/services/design-systems");
  });

  it("applies the variant surface class", () => {
    const { container } = render(
      <ServiceCard {...baseProps} variant="elevated" />,
    );
    expect((container.firstChild as HTMLElement).className).toContain("bg-card");
  });

  it("guards the hover animation under reduced motion", () => {
    const { container } = render(
      <ServiceCard {...baseProps} variant="elevated" />,
    );
    expect((container.firstChild as HTMLElement).className).toContain(
      "motion-reduce:transition-none",
    );
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <ServiceCard {...baseProps} href="/services/design-systems" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
