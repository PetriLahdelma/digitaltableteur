import { render, screen } from "@testing-library/react";
import React from "react";
import OpenHours from "./OpenHours";
import { WEEKLY_HOURS } from "../../data/openHours";
import { I18nextProvider } from "react-i18next";
import i18n, { initI18n } from "../../i18n";

function withI18n(ui: React.ReactElement) {
  return <I18nextProvider i18n={i18n}>{ui}</I18nextProvider>;
}

describe("OpenHours", () => {
  it("renders heading and columns", async () => {
    await initI18n();
    render(withI18n(<OpenHours />));
    expect(
      screen.getByText(/Open hours|Aukioloajat|Öppettider/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Day|Päivä|Dag/)).toBeInTheDocument();
    expect(screen.getByText(/Opens|Avautuu|Öppnar/)).toBeInTheDocument();
    expect(screen.getByText(/Closes|Sulkeutuu|Stänger/)).toBeInTheDocument();
  });

  it("shows closed for weekend", async () => {
    const saturday = WEEKLY_HOURS.find((d) => d.day === "saturday");
    expect(saturday?.open).toBeNull();
    await initI18n();
    render(
      withI18n(
        <OpenHours
          showAllDays={false}
          date={new Date("2025-11-01T10:00:00")}
        />,
      ),
    ); // 1 Nov 2025 is Saturday
    const closedEls = screen.getAllByText(/Closed|Suljettu|Stängt/);
    expect(closedEls.length).toBeGreaterThan(0);
  });

  it("renders success state + check icon when currently open", async () => {
    // Choose a weekday inside defined open interval, e.g. Monday 10:00 Helsinki local
    await initI18n();
    const date = new Date("2025-11-03T10:00:00"); // assume Monday open window
    render(withI18n(<OpenHours date={date} />));
    const contentNode = screen.getByText(/Open now|Auki|Öppet/i);
    const innerSpan = contentNode.closest("span");
    const badge = innerSpan?.parentElement as HTMLSpanElement | null; // outer badge wrapper
    expect(badge).toBeTruthy();
    expect(badge?.className).toMatch(/success/);
    const iconEl = badge?.querySelector("svg");
    expect(iconEl).toBeTruthy();
  });

  it("renders error state + times icon when currently closed", async () => {
    // Use a time outside open hours, e.g. Monday 20:00
    await initI18n();
    const date = new Date("2025-11-03T20:00:00");
    render(withI18n(<OpenHours date={date} />));
    const contentNode = screen.getByText(/Closed now|Suljettu|Stängt/i);
    const innerSpan = contentNode.closest("span");
    const badge = innerSpan?.parentElement as HTMLSpanElement | null;
    expect(badge).toBeTruthy();
    expect(badge?.className).toMatch(/error/);
    const iconEl = badge?.querySelector("svg");
    expect(iconEl).toBeTruthy();
  });
});
