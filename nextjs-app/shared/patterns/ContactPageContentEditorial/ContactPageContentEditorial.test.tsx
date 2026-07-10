import React from "react";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect, vi } from "vitest";
import { ContactPageContentEditorial } from "./ContactPageContentEditorial";

expect.extend(toHaveNoViolations);

// Mock the package translation adapter, not the app's i18next runtime.
vi.mock("../../lib/translation", () => {
  const t = (key: string, fallback?: string) => fallback ?? key;
  return {
    useTranslate: () => t,
    useLocalization: () => ({
      translate: t,
      language: "en",
      resolvedLanguage: "en",
      changeLanguage: vi.fn(),
      getResourceBundle: vi.fn(),
    }),
  };
});

vi.mock("framer-motion", async () => {
  const actual =
    await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return { ...actual, useReducedMotion: () => false };
});

describe("ContactPageContentEditorial", () => {
  it("renders the contact page heading", () => {
    render(<ContactPageContentEditorial />);
    expect(screen.getAllByRole("heading").length).toBeGreaterThan(0);
  });

  it("appends a custom className", () => {
    const { container } = render(
      <ContactPageContentEditorial className="custom-class" />,
    );
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("renders the booking mode when deep-linked via initialInquiryMode", () => {
    const { container } = render(
      <ContactPageContentEditorial initialInquiryMode="book" />,
    );
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<ContactPageContentEditorial />);
    expect(await axe(container)).toHaveNoViolations();
  }, 30_000);
});
