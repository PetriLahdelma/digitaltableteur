import React from "react";
import { screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders, i18n } from "../../../../test-utils/render";
import { DesignSprintsSection } from "./DesignSprintsSection";

expect.extend(toHaveNoViolations);

vi.mock("framer-motion", async () => {
  const actual =
    await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return { ...actual, useReducedMotion: () => false };
});

describe("DesignSprintsSection", () => {
  it("renders the sprint heading", async () => {
    await i18n.changeLanguage("en");
    renderWithProviders(<DesignSprintsSection />);
    expect(screen.getAllByRole("heading").length).toBeGreaterThan(0);
  });

  it("uses the custom section id for anchor linking", async () => {
    await i18n.changeLanguage("en");
    const { container } = renderWithProviders(
      <DesignSprintsSection id="sprints" />,
    );
    expect(container.querySelector("#sprints")).toBeInTheDocument();
  });

  it("appends a custom className", async () => {
    await i18n.changeLanguage("en");
    const { container } = renderWithProviders(
      <DesignSprintsSection className="custom-class" />,
    );
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("links each engagement card to its pricing destination", async () => {
    await i18n.changeLanguage("en");
    renderWithProviders(<DesignSprintsSection />);
    expect(screen.getByRole("link", { name: "UX Sprint" })).toHaveAttribute(
      "href",
      "/pricing#ux-sprint",
    );
    expect(screen.getByRole("link", { name: "AI-Ready Ops" })).toHaveAttribute(
      "href",
      "/pricing#ai-ready-designops",
    );
    expect(
      screen.getByRole("link", { name: "Design System Lift-Off" }),
    ).toHaveAttribute("href", "/pricing#design-system-lift-off");
    expect(
      screen.getByRole("link", { name: "Embedded partnership" }),
    ).toHaveAttribute("href", "/pricing?duration=6m&days=4#calculator");
  });

  it("has no axe violations", async () => {
    await i18n.changeLanguage("en");
    const { container } = renderWithProviders(<DesignSprintsSection />);
    expect(await axe(container)).toHaveNoViolations();
  }, 30_000);
});
