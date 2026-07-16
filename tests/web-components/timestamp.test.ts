import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
  DtTimestampElement,
  formatTimestamp,
} from "../../packages/web-components/src/native/timestamp";

beforeAll(() => {
  if (!customElements.get("dt-timestamp")) {
    customElements.define("dt-timestamp", DtTimestampElement);
  }
});

afterEach(() => {
  document.body.replaceChildren();
  document.documentElement.removeAttribute("lang");
  vi.useRealTimers();
});

describe("DtTimestampElement", () => {
  const now = new Date("2026-02-19T19:00:00Z");
  const older = new Date("2025-11-29T12:00:00Z");

  it("formats relative and absolute output with the shared formatter", () => {
    expect(formatTimestamp(new Date("2026-02-19T17:00:00Z"), now, "relative", "en", false, 604800)).toBe(
      "2 hours ago",
    );
    expect(formatTimestamp(older, now, "system_date", "en", false, 604800)).toMatch(
      /^\d{4}-\d{2}-\d{2}$/,
    );
  });

  it("preserves calendar dates and machine-readable datetime for date-only values", () => {
    const element = document.createElement("dt-timestamp") as DtTimestampElement;
    element.setAttribute("value", "2025-11-29");
    element.setAttribute("format", "system_date");
    element.setAttribute("now", now.toISOString());
    document.body.append(element);

    const time = element.shadowRoot?.querySelector("time");
    expect(time).toHaveTextContent("2025-11-29");
    expect(time).toHaveAttribute("datetime", "2025-11-29");
  });

  it("adds a full-date tooltip for relative output and localizes the displayed text", () => {
    const element = document.createElement("dt-timestamp") as DtTimestampElement;
    element.setAttribute("value", "2026-02-19T17:00:00Z");
    element.setAttribute("format", "relative");
    element.setAttribute("now", now.toISOString());
    element.setAttribute("locale", "fi");
    document.body.append(element);

    const time = element.shadowRoot?.querySelector("time");
    expect(time?.textContent).not.toBe("2 hours ago");
    expect(time).toHaveAttribute("title");
  });

  it("appends a timezone abbreviation when requested", () => {
    const element = document.createElement("dt-timestamp") as DtTimestampElement;
    element.setAttribute("value", older.toISOString());
    element.setAttribute("format", "system_time");
    element.setAttribute("show-timezone", "true");
    element.setAttribute("now", now.toISOString());
    document.body.append(element);

    const expectedTz = new Intl.DateTimeFormat("en", { timeZoneName: "short" })
      .formatToParts(older)
      .find((part) => part.type === "timeZoneName")?.value;

    expect(element.shadowRoot?.querySelector("time")?.textContent).toBe(
      `${older.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })} ${expectedTz}`,
    );
  });

  it("re-renders live relative output without a framework runtime", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-19T19:00:00Z"));

    const element = document.createElement("dt-timestamp") as DtTimestampElement;
    element.setAttribute("value", "2026-02-19T18:59:30Z");
    element.setAttribute("format", "relative");
    element.setAttribute("live", "true");
    document.body.append(element);

    const initial = element.shadowRoot?.querySelector("time")?.textContent;
    vi.setSystemTime(new Date("2026-02-19T19:00:30Z"));
    vi.advanceTimersByTime(30_000);

    expect(initial).toBe("now");
    expect(element.shadowRoot?.querySelector("time")?.textContent).toBe(
      "1 minute ago",
    );
  });

  it("renders an empty time element for invalid values", () => {
    const element = document.createElement("dt-timestamp") as DtTimestampElement;
    element.setAttribute("value", "not-a-date");
    element.setAttribute("format", "date");
    document.body.append(element);

    const time = element.shadowRoot?.querySelector("time");
    expect(time).toBeEmptyDOMElement();
    expect(time).not.toHaveAttribute("datetime");
  });
});
