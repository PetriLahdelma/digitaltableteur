import React from "react";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect, vi } from "vitest";
import { ServicesSection, type ServiceItem } from "./ServicesSection";

expect.extend(toHaveNoViolations);

vi.mock("framer-motion", async () => {
  const actual =
    await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return { ...actual, useReducedMotion: () => false };
});

const services: ServiceItem[] = [
  {
    icon: <span aria-hidden="true">◆</span>,
    title: "Design systems",
    description: "Token-driven component libraries.",
    href: "/services/design-systems",
  },
  {
    icon: <span aria-hidden="true">◆</span>,
    title: "AI integration",
    description: "GenAI-ready specs and flows.",
  },
];

describe("ServicesSection", () => {
  it("renders the section title and description", () => {
    render(
      <ServicesSection
        title="What we do"
        description="Senior-led delivery."
        services={services}
      />,
    );
    expect(screen.getByRole("heading", { name: "What we do" })).toBeInTheDocument();
    expect(screen.getByText("Senior-led delivery.")).toBeInTheDocument();
  });

  it("renders a card per service with its description", () => {
    render(<ServicesSection services={services} />);
    expect(screen.getByText("Design systems")).toBeInTheDocument();
    expect(screen.getByText("AI integration")).toBeInTheDocument();
    expect(
      screen.getByText("Token-driven component libraries."),
    ).toBeInTheDocument();
  });

  it("uses the custom section id", () => {
    const { container } = render(
      <ServicesSection services={services} id="offering" />,
    );
    expect(container.querySelector("section")).toHaveAttribute("id", "offering");
  });

  it("appends a custom className", () => {
    const { container } = render(
      <ServicesSection services={services} className="custom-class" />,
    );
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <ServicesSection
        title="What we do"
        description="Senior-led delivery."
        services={services}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
