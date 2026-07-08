import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import Footer from "./Footer";

const mockT = vi.fn((key: string) => key);

vi.mock("../../lib/translation", () => ({
  useTranslate: () => mockT,
  useLocalization: () => ({
    translate: mockT,
    language: "en",
    resolvedLanguage: "en",
    changeLanguage: vi.fn(),
    getResourceBundle: vi.fn(),
  }),
}));

describe("Footer", () => {
  it("renders contact info and social links", () => {
    render(<Footer />);

    expect(screen.getByLabelText("footerAriaEmail")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "footerImprint" })).toHaveAttribute(
      "href",
      "/imprint",
    );
    const socialLinks = screen.getAllByRole("link");
    expect(socialLinks.length).toBeGreaterThanOrEqual(7);

    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year, "i"))).toBeInTheDocument();
  });
});
