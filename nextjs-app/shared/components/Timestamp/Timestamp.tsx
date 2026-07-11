"use client";

import React from "react";
import { useLocalization } from "../../lib/translation";
import styles from "./Timestamp.module.css";

/**
 * Display format, mirroring the Astryx Timestamp reference
 * (https://astryx.atmeta.com/components/Timestamp): user-facing `date`,
 * `date_time`, `time` and `relative`; ISO-style `system_*` variants for
 * developer surfaces; `auto` switches from relative to date_time once the
 * value is older than `autoThreshold`.
 */
export type TimestampFormat =
  | "auto"
  | "relative"
  | "date"
  | "date_time"
  | "time"
  | "system_date"
  | "system_date_time"
  | "system_time";

export type TimestampSize = "xxs" | "xs" | "s" | "m" | "l" | "xl" | "xxl";

export interface TimestampProps {
  /** The date/time to display: ISO 8601 string, Unix seconds, or Date. */
  value: string | number | Date;
  /** Display format. @default "auto" */
  format?: TimestampFormat;
  /**
   * Seconds after which `auto` switches from relative to date_time.
   * @default 604800 (7 days)
   */
  autoThreshold?: number;
  /** Text-ladder size. @default "s" */
  size?: TimestampSize;
  /** Color role: body text or muted metadata. @default "muted" */
  tone?: "default" | "muted";
  /** Append the timezone abbreviation (date_time/time/system equivalents). @default false */
  showTimezone?: boolean;
  /** Native tooltip with the full date when showing relative time. @default true */
  tooltip?: boolean;
  /** Keep relative output ticking while mounted. @default false */
  live?: boolean;
  /**
   * Reference "now" for relative/auto output. Defaults to render time; pass a
   * fixed value in stories/tests for deterministic output.
   */
  now?: string | number | Date;
  /** Locale override; defaults to the active site language. */
  locale?: string;
  /** Optional className passthrough. */
  className?: string;
}

const SIZE_CLASS: Record<TimestampSize, string> = {
  xxs: styles.sizeXXS,
  xs: styles.sizeXS,
  s: styles.sizeS,
  m: styles.sizeM,
  l: styles.sizeL,
  xl: styles.sizeXL,
  xxl: styles.sizeXXL,
};

const toDate = (value: string | number | Date): Date => {
  if (value instanceof Date) return value;
  if (typeof value === "number") {
    // Unix seconds (Astryx convention); treat obviously-millisecond values as ms.
    return new Date(value > 1e12 ? value : value * 1000);
  }
  return new Date(value);
};

const pad = (n: number) => String(n).padStart(2, "0");

const systemDate = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const systemTime = (d: Date) =>
  `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

const timezoneAbbreviation = (d: Date, locale: string) => {
  const part = new Intl.DateTimeFormat(locale, { timeZoneName: "short" })
    .formatToParts(d)
    .find((p) => p.type === "timeZoneName");
  return part ? part.value : "";
};

const RELATIVE_STEPS: Array<{
  limit: number;
  divisor: number;
  unit: Intl.RelativeTimeFormatUnit;
}> = [
  { limit: 60, divisor: 1, unit: "second" },
  { limit: 3600, divisor: 60, unit: "minute" },
  { limit: 86400, divisor: 3600, unit: "hour" },
  { limit: 604800, divisor: 86400, unit: "day" },
  { limit: 2629800, divisor: 604800, unit: "week" },
  { limit: 31557600, divisor: 2629800, unit: "month" },
  { limit: Infinity, divisor: 31557600, unit: "year" },
];

const relativeLabel = (date: Date, nowDate: Date, locale: string) => {
  const deltaSeconds = Math.round((date.getTime() - nowDate.getTime()) / 1000);
  const magnitude = Math.abs(deltaSeconds);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (magnitude < 45) return rtf.format(0, "second"); // "now"
  const step =
    RELATIVE_STEPS.find((s) => magnitude < s.limit) ??
    RELATIVE_STEPS[RELATIVE_STEPS.length - 1];
  return rtf.format(Math.round(deltaSeconds / step.divisor), step.unit);
};

/** Pure formatter, exported for tests. */
export const formatTimestamp = (
  date: Date,
  nowDate: Date,
  format: TimestampFormat,
  locale: string,
  showTimezone: boolean,
  autoThreshold: number,
): string => {
  const resolved: Exclude<TimestampFormat, "auto"> =
    format === "auto"
      ? Math.abs(nowDate.getTime() - date.getTime()) / 1000 < autoThreshold
        ? "relative"
        : "date_time"
      : format;

  const tz = showTimezone ? ` ${timezoneAbbreviation(date, locale)}` : "";

  switch (resolved) {
    case "relative":
      return relativeLabel(date, nowDate, locale);
    case "date":
      return new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
    case "date_time":
      return (
        new Intl.DateTimeFormat(locale, {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(date) + tz
      );
    case "time":
      return (
        new Intl.DateTimeFormat(locale, {
          hour: "2-digit",
          minute: "2-digit",
        }).format(date) + tz
      );
    case "system_date":
      return systemDate(date);
    case "system_date_time":
      return `${systemDate(date)} ${systemTime(date)}${tz}`;
    case "system_time":
      return `${systemTime(date)}${tz}`;
  }
};

/**
 * Formats a date or time value into human-readable text: relative for
 * recency, absolute for precision, or `auto` to switch between them.
 * Renders a semantic `<time>` with a machine-readable dateTime attribute;
 * relative modes carry the full date as a native tooltip.
 */
export const Timestamp = React.forwardRef<HTMLTimeElement, TimestampProps>(
  function Timestamp(
    {
      value,
      format = "auto",
      autoThreshold = 604800,
      size = "s",
      tone = "muted",
      showTimezone = false,
      tooltip = true,
      live = false,
      now,
      locale,
      className = "",
    },
    ref,
  ) {
    const { resolvedLanguage } = useLocalization();
    const activeLocale = locale || resolvedLanguage || "en";
    const date = toDate(value);

    // Ticks only when live; otherwise "now" is captured per render pass.
    const [tick, setTick] = React.useState(0);
    const nowDate = React.useMemo(
      () => (now !== undefined ? toDate(now) : new Date()),
      // eslint-disable-next-line react-hooks/exhaustive-deps -- tick forces live re-evaluation
      [now, tick],
    );

    React.useEffect(() => {
      if (!live || now !== undefined) return;
      if (format !== "relative" && format !== "auto") return;
      const interval = window.setInterval(() => setTick((v) => v + 1), 30_000);
      return () => window.clearInterval(interval);
    }, [live, now, format]);

    const isValid = !Number.isNaN(date.getTime());
    const label = isValid
      ? formatTimestamp(
          date,
          nowDate,
          format,
          activeLocale,
          showTimezone,
          autoThreshold,
        )
      : "";

    const showsRelative =
      format === "relative" ||
      (format === "auto" &&
        isValid &&
        Math.abs(nowDate.getTime() - date.getTime()) / 1000 < autoThreshold);

    const fullDate =
      isValid && tooltip && showsRelative
        ? new Intl.DateTimeFormat(activeLocale, {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(date)
        : undefined;

    return (
      <time
        ref={ref}
        dateTime={isValid ? date.toISOString() : undefined}
        title={fullDate}
        className={`${styles.timestamp} ${SIZE_CLASS[size]} ${
          tone === "muted" ? styles.toneMuted : styles.toneDefault
        } ${className}`.trim()}
        // Relative output derives from render-time "now"; server and client
        // can legitimately differ by a tick (React-sanctioned use of
        // suppressHydrationWarning for timestamps).
        suppressHydrationWarning
      >
        {label}
      </time>
    );
  },
);

export default Timestamp;
