import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { Container } from "./Container";

expect.extend(toHaveNoViolations);

describe("Container", () => {
  it("renders children inside a div by default", () => {
    render(<Container>content</Container>);
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("applies the size clamp class", () => {
    const { container } = render(<Container size="sm">x</Container>);
    expect((container.firstChild as HTMLElement).className).toContain("max-w-container-sm");
  });

  it("renders as the given landmark element", () => {
    render(<Container as="main">landmark</Container>);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("centers by default and can opt out", () => {
    const { container: on } = render(<Container>x</Container>);
    const { container: off } = render(<Container center={false}>x</Container>);
    expect((on.firstChild as HTMLElement).className).not.toEqual(
      (off.firstChild as HTMLElement).className,
    );
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <Container as="main">
        <p>Accessible content</p>
      </Container>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
