import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { TranslationProvider } from "../../lib/translation";
import ReliablePartnerBadge, {
  getReliablePartnerReportHref,
} from "./ReliablePartnerBadge";

expect.extend(toHaveNoViolations);

function renderInLanguage(language: string, ui: React.ReactElement) {
  return render(
    <TranslationProvider language={language} resolvedLanguage={language}>
      {ui}
    </TranslationProvider>,
  );
}

describe("ReliablePartnerBadge", () => {
  it("falls back to the English mark and report with no language context", () => {
    render(<ReliablePartnerBadge />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/logos/partners/reliable-partner-green.jpg");
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/docs/reliable-partner/reliable-partner-report-en.pdf",
    );
  });

  // The mark and the report must move together: a Finnish badge linking to the
  // English PDF is the specific mismatch this component exists to prevent.
  it.each([
    ["fi", "/logos/partners/luotettava-kumppani-green.png", "reliable-partner-report-fi.pdf"],
    ["sv", "/logos/partners/palitlig-partner-green.jpg", "reliable-partner-report-sv.pdf"],
    ["en", "/logos/partners/reliable-partner-green.jpg", "reliable-partner-report-en.pdf"],
  ])("matches mark and report for %s", (language, src, report) => {
    renderInLanguage(language, <ReliablePartnerBadge />);
    expect(screen.getByRole("img")).toHaveAttribute("src", src);
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      `/docs/reliable-partner/${report}`,
    );
  });

  it("treats a regional tag as its base language", () => {
    renderInLanguage("fi-FI", <ReliablePartnerBadge />);
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "/logos/partners/luotettava-kumppani-green.png",
    );
  });

  it("falls back to English for an unsupported language", () => {
    renderInLanguage("de", <ReliablePartnerBadge />);
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/docs/reliable-partner/reliable-partner-report-en.pdf",
    );
  });

  it("opens the report safely in a new tab", () => {
    render(<ReliablePartnerBadge />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(link).toHaveAttribute("rel", expect.stringContaining("noreferrer"));
  });

  it("honours an explicit href", () => {
    render(<ReliablePartnerBadge href="https://www.vastuugroup.fi/" />);
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "https://www.vastuugroup.fi/",
    );
  });

  it("renders unlinked when href is null but keeps the alt meaning", () => {
    render(<ReliablePartnerBadge href={null} />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByRole("img")).toHaveAccessibleName(/reliable partner/i);
  });

  it("never renders an empty alt, since the link has no other accessible name", () => {
    render(<ReliablePartnerBadge />);
    expect(screen.getByRole("img").getAttribute("alt")).toBeTruthy();
  });

  it("exposes report hrefs through the helper, including regional tags", () => {
    expect(getReliablePartnerReportHref("fi")).toBe(
      "/docs/reliable-partner/reliable-partner-report-fi.pdf",
    );
    expect(getReliablePartnerReportHref("sv-FI")).toBe(
      "/docs/reliable-partner/reliable-partner-report-sv.pdf",
    );
    expect(getReliablePartnerReportHref("pt")).toBe(
      "/docs/reliable-partner/reliable-partner-report-en.pdf",
    );
  });

  it("has no axe violations", async () => {
    const { container } = render(<ReliablePartnerBadge />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
