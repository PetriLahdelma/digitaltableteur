import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("mails, calls, copies and opens WhatsApp or Signal", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    render(<ContactPageContentEditorial />);

    expect(
      screen.getByRole("link", { name: "mail@digitaltableteur.com" }),
    ).toHaveAttribute("href", "mailto:mail@digitaltableteur.com");

    await user.click(screen.getByRole("button", { name: "Copy email address" }));
    expect(writeText).toHaveBeenCalledWith("mail@digitaltableteur.com");
    expect(await screen.findByText("Copied")).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "+358 45 657 4469" }),
    ).toHaveAttribute("href", "tel:+358456574469");
    await user.click(screen.getByRole("button", { name: "Copy phone number" }));
    expect(writeText).toHaveBeenCalledWith("+358 45 657 4469");

    const whatsapp = screen.getByRole("link", { name: /WhatsApp/ });
    expect(whatsapp).toHaveAttribute("href", "https://wa.me/358456574469");
    const signal = screen.getByRole("link", { name: /Signal/ });
    expect(signal).toHaveAttribute("href", expect.stringMatching(/^https:\/\/signal\.me\/#eu\//));
    for (const chat of [whatsapp, signal]) {
      expect(chat).toHaveAttribute("target", "_blank");
      expect(chat.getAttribute("rel")).toContain("noopener");
    }
  });

  it("has no axe violations", async () => {
    const { container } = render(<ContactPageContentEditorial />);
    expect(await axe(container)).toHaveNoViolations();
  }, 30_000);
});
