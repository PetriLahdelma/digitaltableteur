import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, beforeEach, afterEach, describe, it, expect } from "vitest";
import HelsinkiClock from "@dt/HelsinkiClock";
import { TranslationProvider } from "../../lib/translation";

const mockT = vi.fn((key: string) => {
  const translations: { [key: string]: string } = {
    weekdayMonday: "Monday",
    weekdayTuesday: "Tuesday",
    weekdayWednesday: "Wednesday",
    weekdayThursday: "Thursday",
    weekdayFriday: "Friday",
    weekdaySaturday: "Saturday",
    weekdaySunday: "Sunday",
    monthJanuary: "January",
    monthFebruary: "February",
    monthMarch: "March",
    monthApril: "April",
    monthMay: "May",
    monthJune: "June",
    monthJuly: "July",
    monthAugust: "August",
    monthSeptember: "September",
    monthOctober: "October",
    monthNovember: "November",
    monthDecember: "December",
    helsinki: "Helsinki",
    helsinkiFI: "Helsinki",
    helsinkiSV: "Helsingfors",
  };
  return translations[key] || key;
});

let mockLanguage = "en";

function renderClock() {
  return render(
    <TranslationProvider
      translate={mockT}
      language={mockLanguage}
      resolvedLanguage={mockLanguage}
    >
      <HelsinkiClock />
    </TranslationProvider>,
  );
}

describe("HelsinkiClock", () => {
  let mockDate: Date;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock a specific date: Monday, March 15, 2024, 14:30:45
    mockDate = new Date("2024-03-15T14:30:45");
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
    mockLanguage = "en";
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders Helsinki clock container", () => {
    renderClock();
    expect(screen.getByText(/Helsinki \(GMT\+2\)/)).toBeInTheDocument();
  });

  it("displays current date with translated weekday and month", () => {
    renderClock();
    expect(screen.getByText("Friday 15. March")).toBeInTheDocument();
  });

  it("displays Helsinki time with GMT+2 timezone", () => {
    renderClock();
    expect(screen.getByText(/Helsinki \(GMT\+2\)/)).toBeInTheDocument();
  });

  it("shows time in HH:MM:SS format", () => {
    renderClock();
    // The time should be displayed somewhere in the component
    const timeElement = screen.getByText(/\d{2}:\d{2}:\d{2}/);
    expect(timeElement).toBeInTheDocument();
  });

  it("uses Finnish Helsinki translation when language is fi", () => {
    mockLanguage = "fi";
    renderClock();
    expect(screen.getByText(/Helsinki \(GMT\+2\)/)).toBeInTheDocument();
  });

  it("uses Swedish Helsinki translation when language is sv", () => {
    mockLanguage = "sv";
    renderClock();
    expect(screen.getByText(/Helsingfors \(GMT\+2\)/)).toBeInTheDocument();
  });

  it("updates time every second", () => {
    renderClock();

    // Initial time
    expect(screen.getByText(/\d{2}:\d{2}:\d{2}/)).toBeInTheDocument();

    // Advance time by 1 second
    const newMockDate = new Date("2024-03-15T14:30:46");
    vi.setSystemTime(newMockDate);
    vi.advanceTimersByTime(1000);

    // Time should have updated
    expect(screen.getByText(/\d{2}:\d{2}:\d{2}/)).toBeInTheDocument();
  });

  it("handles different weekdays correctly", () => {
    // Test Sunday
    const sundayDate = new Date("2024-03-17T14:30:45"); // Sunday
    vi.setSystemTime(sundayDate);
    renderClock();
    expect(screen.getByText("Sunday 17. March")).toBeInTheDocument();
  });

  it("handles different months correctly", () => {
    // Test different month
    const januaryDate = new Date("2024-01-15T14:30:45");
    vi.setSystemTime(januaryDate);
    renderClock();
    expect(screen.getByText("Monday 15. January")).toBeInTheDocument();
  });
});
