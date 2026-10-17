import { describe, expect, it } from "vitest";
import { formatPeriod } from "./formatPeriod";

const present = (start: string) => `${start} – Present`;

describe("formatPeriod", () => {
  it("formats a month range per locale", () => {
    expect(formatPeriod({ start: "2022-03", end: "2026-02" }, "en", present)).toBe(
      "Mar 2022 – Feb 2026",
    );
    expect(formatPeriod({ start: "2022-03", end: "2026-02" }, "fi", present)).toBe(
      "maalis 2022–helmi 2026",
    );
  });

  it("collapses a single month and a single year", () => {
    expect(formatPeriod({ start: "2026-09", end: "2026-09" }, "en", present)).toBe("Sep 2026");
    expect(formatPeriod({ start: "2018", end: "2018" }, "en", present)).toBe("2018");
  });

  it("uses years for the whole period when either end lacks a month", () => {
    expect(formatPeriod({ start: "2020-08", end: "2022" }, "en", present)).toBe("2020–2022");
  });

  it("hands an ongoing period's formatted start to the ongoing phrase", () => {
    expect(formatPeriod({ start: "2025-12" }, "en", present)).toBe("Dec 2025 – Present");
    expect(formatPeriod({ start: "2016" }, "en", present)).toBe("2016 – Present");
  });

  it("rejects malformed values", () => {
    expect(() => formatPeriod({ start: "Mar 2022" }, "en", present)).toThrow();
  });
});
