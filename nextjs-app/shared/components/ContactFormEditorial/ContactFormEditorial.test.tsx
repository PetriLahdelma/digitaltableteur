import React from "react";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect, vi } from "vitest";
import { ContactFormEditorial } from "./ContactFormEditorial";

expect.extend(toHaveNoViolations);

// Mock the package adapter runtimes, not the app's i18next/router.
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

vi.mock("../../lib/navigation", async () => {
  const actual = await vi.importActual<object>("../../lib/navigation");
  return {
    ...actual,
    useNavigationSearchParams: () => new URLSearchParams(),
  };
});

vi.mock("../../lib/toast", async () => {
  const actual = await vi.importActual<object>("../../lib/toast");
  return {
    ...actual,
    useToast: () => ({ showToast: vi.fn() }),
  };
});

vi.mock("framer-motion", async () => {
  const actual =
    await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return { ...actual, useReducedMotion: () => true };
});

describe("ContactFormEditorial", () => {
  it("renders the core contact fields", () => {
    render(<ContactFormEditorial />);
    expect(screen.getAllByRole("textbox").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole("button", { name: /send|submit/i })).toBeInTheDocument();
  });

  it("appends a custom className", () => {
    const { container } = render(
      <ContactFormEditorial className="custom-class" />,
    );
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<ContactFormEditorial />);
    expect(await axe(container)).toHaveNoViolations();
  }, 30_000);
});
