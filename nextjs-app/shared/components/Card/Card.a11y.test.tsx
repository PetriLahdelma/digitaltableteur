import React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import Card from "./Card";

expect.extend(toHaveNoViolations);

describe("Card accessibility", () => {
  it("default surface with header content has no axe violations", async () => {
    const { container } = render(
      <Card title="Design tokens" description="Layer 0 of the system.">
        <p>Body content.</p>
      </Card>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("link mode has no axe violations and a single link", async () => {
    const { container } = render(
      <Card
        title="Case study"
        description="What we shipped."
        link="/work/case-study"
        linkLabel="Read the case study"
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
    expect(container.querySelectorAll("a")).toHaveLength(1);
  });

  it("loading state has no axe violations", async () => {
    const { container } = render(<Card loading>replaced</Card>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
