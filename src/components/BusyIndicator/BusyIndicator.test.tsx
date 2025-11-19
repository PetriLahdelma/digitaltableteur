import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n";
import BusyIndicator from "./BusyIndicator";

function withI18n(ui: React.ReactElement) {
  return <I18nextProvider i18n={i18n}>{ui}</I18nextProvider>;
}

describe("BusyIndicator", () => {
  it("renders spinner with default label", () => {
    render(withI18n(<BusyIndicator />));
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });
  it("renders determinate progress with correct dot activation and aria attributes", () => {
    render(withI18n(<BusyIndicator progress={0.5} />)); // 50% should activate first two dots
    const pb = screen.getByRole("progressbar");
    expect(pb).toHaveAttribute("aria-valuemin", "0");
    expect(pb).toHaveAttribute("aria-valuemax", "100");
    expect(pb).toHaveAttribute("aria-valuenow", "50");
    const ariaValueText = pb.getAttribute("aria-valuetext");
    expect(ariaValueText).toMatch(/50/);
    // Count active dots
    const activeDots = pb.querySelectorAll("[data-active='true']");
    expect(activeDots.length).toBeGreaterThanOrEqual(2);
  });
});
