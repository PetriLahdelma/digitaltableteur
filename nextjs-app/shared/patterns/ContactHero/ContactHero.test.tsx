import React from "react";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect, vi } from "vitest";
import { ContactHero } from "./ContactHero";

expect.extend(toHaveNoViolations);

vi.mock("framer-motion", async () => {
  const actual =
    await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return { ...actual, useReducedMotion: () => true };
});

describe("ContactHero", () => {
  it("renders the title as a heading", () => {
    render(<ContactHero title="Get in touch" />);
    // TextReveal splits words into spans; match on the heading's condensed text.
    const heading = screen.getByRole("heading");
    expect(heading.textContent?.replace(/\s+/g, "")).toBe("Getintouch");
  });

  it("renders the subtitle when provided", () => {
    render(<ContactHero title="Get in touch" subtitle="We reply fast." />);
    expect(screen.getByText(/We reply fast\./)).toBeInTheDocument();
  });

  it("appends a custom className", () => {
    const { container } = render(
      <ContactHero title="Get in touch" className="custom-class" />,
    );
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <ContactHero title="Get in touch" subtitle="We reply fast." />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
