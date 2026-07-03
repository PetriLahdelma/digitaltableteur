import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { Section } from "./Section";

expect.extend(toHaveNoViolations);

describe("Section", () => {
  it("renders a section element with spacing classes", () => {
    const { container } = render(<Section>band</Section>);
    const el = container.firstChild as HTMLElement;
    expect(el.tagName).toBe("SECTION");
    expect(el.className).toContain("py-12");
  });

  it("hero and follow pair without a double gap", () => {
    const { container: hero } = render(<Section spacing="hero">h</Section>);
    const { container: follow } = render(<Section spacing="follow">f</Section>);
    expect((hero.firstChild as HTMLElement).className).toContain("pb-8");
    expect((follow.firstChild as HTMLElement).className).toContain("pt-0");
  });

  it("applies background surfaces", () => {
    const { container } = render(<Section background="inverse">x</Section>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("bg-foreground");
    expect(el.className).toContain("text-background");
  });

  it("exposes id and donnyTarget anchors", () => {
    const { container } = render(
      <Section id="pricing" donnyTarget="pricing-spot">x</Section>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.id).toBe("pricing");
    expect(el.getAttribute("data-donny-target")).toBe("pricing-spot");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <Section aria-label={undefined}>
        <p>content</p>
      </Section>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
