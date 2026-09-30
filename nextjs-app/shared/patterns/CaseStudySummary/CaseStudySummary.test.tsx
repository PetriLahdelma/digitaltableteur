import { screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect } from "vitest";
import { renderWithProviders, i18n } from "../../../../test-utils/render";
import { CaseStudySummary } from "./CaseStudySummary";

expect.extend(toHaveNoViolations);

const props = {
  outcome: "One library replaced fragmented components.",
  role: "Design System Lead",
  constraints: ["Distributed team", "WCAG 2.1 AA"],
  decisions: [
    { title: "Tokens first", detail: "Shared semantic names." },
    { title: "Lifecycle", detail: "Reviewed every two weeks." },
  ],
  evidence: [
    { claim: "100+ components", source: "Self-reported, from project records" },
    {
      claim: "Public system",
      source: "Live site",
      href: "https://example.com",
    },
  ],
};

describe("CaseStudySummary", () => {
  it("labels the section with its heading", async () => {
    await i18n.changeLanguage("en");
    renderWithProviders(<CaseStudySummary {...props} />);
    expect(
      screen.getByRole("region", { name: "At a glance" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "Key decisions" }),
    ).toBeInTheDocument();
  });

  it("renders every decision in order", async () => {
    await i18n.changeLanguage("en");
    renderWithProviders(<CaseStudySummary {...props} />);
    const list = screen.getByRole("heading", {
      name: "Key decisions",
    }).nextElementSibling;
    expect(list?.tagName).toBe("OL");
    expect(list?.textContent).toMatch(/Tokens first.*Lifecycle/);
  });

  it("preserves native list semantics through the design-system List", async () => {
    await i18n.changeLanguage("en");
    renderWithProviders(<CaseStudySummary {...props} />);

    expect(screen.getAllByRole("list")).toHaveLength(3);
    expect(screen.getAllByRole("listitem")).toHaveLength(6);
  });

  it("gives every evidence item a source label and links only when an href exists", async () => {
    await i18n.changeLanguage("en");
    renderWithProviders(<CaseStudySummary {...props} />);
    expect(screen.getAllByText(/^Source:/)).toHaveLength(2);
    expect(screen.getByRole("link", { name: /Live site/ })).toHaveAttribute(
      "href",
      "https://example.com",
    );
    expect(screen.queryByRole("link", { name: /Self-reported/ })).toBeNull();
  });

  it("accepts a custom title", async () => {
    await i18n.changeLanguage("en");
    renderWithProviders(<CaseStudySummary {...props} title="Summary" />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Summary" }),
    ).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    await i18n.changeLanguage("en");
    const { container } = renderWithProviders(<CaseStudySummary {...props} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
