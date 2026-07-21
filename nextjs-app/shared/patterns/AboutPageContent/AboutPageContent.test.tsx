import React from "react";
import { screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders, i18n } from "../../../../test-utils/render";
import { AboutPageContent } from "./AboutPageContent";

expect.extend(toHaveNoViolations);

// Mock motion for animations (same setup as app/__tests__/accessibility-pages).
vi.mock("motion/react", async () => {
  const actual =
    await vi.importActual<typeof import("motion/react")>("motion/react");
  return {
    ...actual,
    motion: {
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      section: ({ children, ...props }: any) => (
        <section {...props}>{children}</section>
      ),
      h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
      h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
      p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
      span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    },
  };
});

vi.mock("framer-motion", async () => {
  const actual =
    await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return { ...actual, useReducedMotion: () => false };
});

describe("AboutPageContent", () => {
  it("renders the delivery section title", async () => {
    await i18n.changeLanguage("en");
    renderWithProviders(<AboutPageContent />);
    expect(
      screen.getByRole("heading", { name: /How we deliver at scale/i }),
    ).toBeInTheDocument();
  });

  it("lists the published design-system packages with versions", async () => {
    await i18n.changeLanguage("en");
    renderWithProviders(<AboutPageContent />);
    // Rendered as shortName chips; the full package name + version is the label.
    expect(
      screen.getByLabelText(/@digitaltableteur\/react \d/),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/@digitaltableteur\/web-components \d/),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/@digitaltableteur\/tokens \d/),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/@digitaltableteur\/tokens-css \d/),
    ).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    await i18n.changeLanguage("en");
    const { container } = renderWithProviders(<AboutPageContent />);
    expect(await axe(container)).toHaveNoViolations();
  }, 30_000);
});
