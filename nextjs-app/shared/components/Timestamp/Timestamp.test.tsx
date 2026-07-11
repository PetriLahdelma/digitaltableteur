import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import Timestamp, { formatTimestamp } from "./Timestamp";

expect.extend(toHaveNoViolations);

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

const NOW = new Date("2026-02-19T19:00:00Z");
const TWO_HOURS_AGO = new Date("2026-02-19T17:00:00Z");
const OLDER = new Date("2025-11-29T12:00:00Z");

describe("formatTimestamp", () => {
  it("renders relative labels for recent values", () => {
    expect(formatTimestamp(TWO_HOURS_AGO, NOW, "relative", "en", false, 604800)).toBe(
      "2 hours ago",
    );
  });

  it("auto switches from relative to date_time at the threshold", () => {
    expect(
      formatTimestamp(TWO_HOURS_AGO, NOW, "auto", "en", false, 604800),
    ).toBe("2 hours ago");
    expect(formatTimestamp(OLDER, NOW, "auto", "en", false, 604800)).toMatch(
      /Nov.*2025/,
    );
  });

  it("formats absolute date with a short month", () => {
    expect(formatTimestamp(OLDER, NOW, "date", "en", false, 604800)).toMatch(
      /^Nov 29, 2025$|^29 Nov 2025$/,
    );
  });

  it("formats system variants as ISO-style local time", () => {
    expect(formatTimestamp(OLDER, NOW, "system_date", "en", false, 604800)).toMatch(
      /^\d{4}-\d{2}-\d{2}$/,
    );
    expect(
      formatTimestamp(OLDER, NOW, "system_date_time", "en", false, 604800),
    ).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });

  it("localizes output (Finnish date shape differs from English)", () => {
    const fi = formatTimestamp(OLDER, NOW, "date", "fi", false, 604800);
    const en = formatTimestamp(OLDER, NOW, "date", "en", false, 604800);
    // ICU renders fi short-month dates numerically ("29.11.2025"); the exact
    // shape is Intl's business, locale divergence is ours to guarantee.
    expect(fi).toContain("2025");
    expect(fi).not.toBe(en);
  });
});

describe("Timestamp", () => {
  it("renders a semantic time element with a machine-readable dateTime", () => {
    render(<Timestamp value="2025-11-29T12:00:00Z" format="date" now={NOW} />);
    const time = document.querySelector("time");
    expect(time).toBeInTheDocument();
    expect(time).toHaveAttribute("dateTime", "2025-11-29T12:00:00.000Z");
  });

  it("shows a full-date tooltip on relative output and none on absolute", () => {
    render(
      <Timestamp value={TWO_HOURS_AGO} format="relative" now={NOW} />,
    );
    expect(screen.getByText("2 hours ago")).toHaveAttribute("title");

    render(<Timestamp value={OLDER} format="date" now={NOW} />);
    const absolute = document.querySelectorAll("time")[1];
    expect(absolute).not.toHaveAttribute("title");
  });

  it("accepts Unix seconds", () => {
    render(
      <Timestamp
        value={Math.floor(OLDER.getTime() / 1000)}
        format="system_date"
        now={NOW}
      />,
    );
    expect(document.querySelector("time")?.textContent).toMatch(
      /^\d{4}-\d{2}-\d{2}$/,
    );
  });

  it("renders nothing readable for invalid values without crashing", () => {
    render(<Timestamp value="not-a-date" format="date" now={NOW} />);
    const time = document.querySelector("time");
    expect(time?.textContent).toBe("");
    expect(time).not.toHaveAttribute("dateTime");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <p>
        Last updated:{" "}
        <Timestamp value={OLDER} format="date" now={NOW} />
      </p>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
