import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { Display } from "./Display";

expect.extend(toHaveNoViolations);

describe("Display", () => {
  it("renders an h1 by default", () => {
    render(<Display>Hero</Display>);
    expect(screen.getByRole("heading", { level: 1, name: "Hero" })).toBeInTheDocument();
  });

  it("renders the element chosen via as", () => {
    render(<Display as="p">Tagline</Display>);
    const el = screen.getByText("Tagline");
    expect(el.tagName).toBe("P");
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("keeps heading semantics for as h2", () => {
    render(<Display as="h2">Section hero</Display>);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it("passes through HTML attributes and className", () => {
    render(<Display className="max-w-xl" data-testid="d">x</Display>);
    expect(screen.getByTestId("d").className).toContain("max-w-xl");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <main>
        <Display>Accessible hero</Display>
      </main>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
