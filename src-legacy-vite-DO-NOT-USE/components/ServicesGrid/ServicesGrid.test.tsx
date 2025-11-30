import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ServicesGrid from "./ServicesGrid";
import "../../setupTests";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n";
import en from "../../locales/en/translation.json";

// Ensure i18n has resources loaded (dynamic import pattern in app, static here for tests)
if (!i18n.isInitialized) {
  i18n.init({
    resources: { en: { translation: en as any } },
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });
}

const renderWithI18n = (ui: React.ReactElement) => {
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);
};

describe("ServicesGrid", () => {
  it("renders four items", () => {
    renderWithI18n(<ServicesGrid />);
    const items = screen.getAllByTestId("services-grid-item");
    expect(items.length).toBe(4);
  });

  it("renders distinct localized titles", () => {
    renderWithI18n(<ServicesGrid />);
    const texts = screen
      .getAllByTestId("services-grid-item")
      .map((el) => el.textContent);
    expect(texts).toEqual([
      expect.stringMatching(/Design/i),
      expect.stringMatching(/Development/i),
      expect.stringMatching(/Strategy/i),
      expect.stringMatching(/AI Innovation/i),
    ]);
  });

  it("exposes accessible labels", () => {
    renderWithI18n(<ServicesGrid />);
    const grid = screen.getByTestId("services-grid");
    expect(grid).toBeInTheDocument();
  });

  it("includes titles in aria-labels", () => {
    renderWithI18n(<ServicesGrid />);
    const items = screen.getAllByTestId("services-grid-item");
    const labels = items.map((el) => el.getAttribute("aria-label") || "");
    expect(labels[0]).toMatch(/Design/);
    expect(labels[1]).toMatch(/Development/);
    expect(labels[2]).toMatch(/Strategy/);
    expect(labels[3]).toMatch(/AI Innovation/);
  });

  it("renders one icon per item", () => {
    renderWithI18n(<ServicesGrid />);
    const icons = screen.getAllByTestId("services-grid-icon");
    expect(icons.length).toBe(4);
    icons.forEach((wrapper) => {
      const svg = wrapper.querySelector("svg");
      expect(svg).not.toBeNull();
    });
  });
});
