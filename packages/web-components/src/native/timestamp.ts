import {
  DigitaltableteurElement,
  enumAttribute,
  numberAttribute,
  reflectAttribute,
  stringAttribute,
} from "./base";
import { resolveElementLocale } from "./localization";

const FORMATS = [
  "auto",
  "relative",
  "date",
  "date_time",
  "time",
  "system_date",
  "system_date_time",
  "system_time",
] as const;
const SIZES = ["xxs", "xs", "s", "m"] as const;
const TONES = ["default", "muted"] as const;
const ISO_CALENDAR_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MAX_FOUR_DIGIT_UNIX_SECONDS = 253_402_300_799;

export type DtTimestampFormat = (typeof FORMATS)[number];
export type DtTimestampSize = (typeof SIZES)[number];
export type DtTimestampTone = (typeof TONES)[number];

type ParsedTimestamp = {
  date: Date;
  dateTime: string | undefined;
};

const styles = `
  :host { display: inline; }
  :host([hidden]) { display: none; }
  .timestamp {
    font-family: var(--primary-body-font);
    font-style: normal;
    font-variant-numeric: tabular-nums;
  }
  .toneDefault { color: var(--color-text); }
  .toneMuted { color: var(--color-muted); }
  .sizeXXS { font-size: var(--font-size-text-xxs); }
  .sizeXS { font-size: var(--font-size-text-xs); }
  .sizeS { font-size: var(--font-size-text-s); }
  .sizeM { font-size: var(--font-size-text-m); }
`;

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

function invalidTimestamp(): ParsedTimestamp {
  return {
    date: new Date(Number.NaN),
    dateTime: undefined,
  };
}

export function parseTimestampValue(
  value: string | number | Date,
): ParsedTimestamp {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? invalidTimestamp()
      : { date: value, dateTime: value.toISOString() };
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) return invalidTimestamp();

    const epochMs =
      Math.abs(value) <= MAX_FOUR_DIGIT_UNIX_SECONDS ? value * 1000 : value;
    const date = new Date(epochMs);
    return Number.isNaN(date.getTime())
      ? invalidTimestamp()
      : { date, dateTime: date.toISOString() };
  }

  const normalizedValue = value.trim();
  if (!normalizedValue) return invalidTimestamp();

  const calendarDate = ISO_CALENDAR_DATE.exec(normalizedValue);
  if (calendarDate) {
    const year = Number(calendarDate[1]);
    const month = Number(calendarDate[2]) - 1;
    const day = Number(calendarDate[3]);
    const date = new Date(2000, month, day);
    date.setFullYear(year);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    ) {
      return invalidTimestamp();
    }

    return { date, dateTime: normalizedValue };
  }

  const date = new Date(normalizedValue);
  return Number.isNaN(date.getTime())
    ? invalidTimestamp()
    : { date, dateTime: date.toISOString() };
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function systemDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function systemTime(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function timezoneAbbreviation(date: Date, locale: string): string {
  const part = new Intl.DateTimeFormat(locale, { timeZoneName: "short" })
    .formatToParts(date)
    .find((entry) => entry.type === "timeZoneName");
  return part ? part.value : "";
}

function relativeLabel(date: Date, nowDate: Date, locale: string): string {
  const deltaSeconds = Math.round((date.getTime() - nowDate.getTime()) / 1000);
  const magnitude = Math.abs(deltaSeconds);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (magnitude < 45) return formatter.format(0, "second");

  const step =
    RELATIVE_STEPS.find((candidate) => magnitude < candidate.limit) ??
    RELATIVE_STEPS[RELATIVE_STEPS.length - 1];
  return formatter.format(Math.round(deltaSeconds / step.divisor), step.unit);
}

function booleanAttribute(
  element: Element,
  name: string,
  fallback: boolean,
): boolean {
  const value = element.getAttribute(name);
  if (value === null) return fallback;
  if (!value) return true;

  const normalized = value.trim().toLowerCase();
  if (["false", "0", "no", "off"].includes(normalized)) return false;
  if (["true", "1", "yes", "on"].includes(normalized)) return true;
  return fallback;
}

function sizeClass(size: DtTimestampSize): string {
  switch (size) {
    case "xxs":
      return "sizeXXS";
    case "xs":
      return "sizeXS";
    case "s":
      return "sizeS";
    case "m":
      return "sizeM";
  }
}

export function formatTimestamp(
  date: Date,
  nowDate: Date,
  format: DtTimestampFormat,
  locale: string,
  showTimezone: boolean,
  autoThreshold: number,
): string {
  const resolvedFormat: Exclude<DtTimestampFormat, "auto"> =
    format === "auto"
      ? Math.abs(nowDate.getTime() - date.getTime()) / 1000 < autoThreshold
        ? "relative"
        : "date_time"
      : format;

  const timezone = showTimezone ? ` ${timezoneAbbreviation(date, locale)}` : "";

  switch (resolvedFormat) {
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
        }).format(date) + timezone
      );
    case "time":
      return (
        new Intl.DateTimeFormat(locale, {
          hour: "2-digit",
          minute: "2-digit",
        }).format(date) + timezone
      );
    case "system_date":
      return systemDate(date);
    case "system_date_time":
      return `${systemDate(date)} ${systemTime(date)}${timezone}`;
    case "system_time":
      return `${systemTime(date)}${timezone}`;
  }
}

export class DtTimestampElement extends DigitaltableteurElement {
  static observedAttributes = [
    "value",
    "format",
    "auto-threshold",
    "size",
    "tone",
    "show-timezone",
    "tooltip",
    "live",
    "now",
    "locale",
    "lang",
  ];

  private intervalId: number | null = null;

  connectedCallback(): void {
    this.render();
    this.syncTicker();
  }

  disconnectedCallback(): void {
    this.clearTicker();
    super.disconnectedCallback();
  }

  attributeChangedCallback(): void {
    if (!this.isConnected) return;
    this.render();
    this.syncTicker();
  }

  get value(): string {
    return stringAttribute(this, "value");
  }

  set value(value: string | number | Date) {
    reflectAttribute(
      this,
      "value",
      value instanceof Date ? value.toISOString() : value,
    );
  }

  get format(): DtTimestampFormat {
    return enumAttribute(this, "format", FORMATS, "auto");
  }

  set format(value: DtTimestampFormat) {
    reflectAttribute(this, "format", value);
  }

  get autoThreshold(): number {
    return numberAttribute(this, "auto-threshold", 604800);
  }

  set autoThreshold(value: number) {
    reflectAttribute(this, "auto-threshold", value);
  }

  get size(): DtTimestampSize {
    return enumAttribute(this, "size", SIZES, "s");
  }

  set size(value: DtTimestampSize) {
    reflectAttribute(this, "size", value);
  }

  get tone(): DtTimestampTone {
    return enumAttribute(this, "tone", TONES, "muted");
  }

  set tone(value: DtTimestampTone) {
    reflectAttribute(this, "tone", value);
  }

  get showTimezone(): boolean {
    return booleanAttribute(this, "show-timezone", false);
  }

  set showTimezone(value: boolean) {
    reflectAttribute(this, "show-timezone", String(value));
  }

  get tooltip(): boolean {
    return booleanAttribute(this, "tooltip", true);
  }

  set tooltip(value: boolean) {
    reflectAttribute(this, "tooltip", String(value));
  }

  get live(): boolean {
    return booleanAttribute(this, "live", false);
  }

  set live(value: boolean) {
    reflectAttribute(this, "live", String(value));
  }

  get now(): string {
    return stringAttribute(this, "now");
  }

  set now(value: string | number | Date) {
    reflectAttribute(
      this,
      "now",
      value instanceof Date ? value.toISOString() : value,
    );
  }

  get locale(): string {
    return stringAttribute(this, "locale");
  }

  set locale(value: string) {
    reflectAttribute(this, "locale", value || null);
  }

  private clearTicker(): void {
    const view = this.ownerDocument.defaultView;
    if (view && this.intervalId !== null) {
      view.clearInterval(this.intervalId);
    }
    this.intervalId = null;
  }

  private syncTicker(): void {
    this.clearTicker();
    if (!this.live || this.hasAttribute("now")) return;
    if (this.format !== "relative" && this.format !== "auto") return;

    const view = this.ownerDocument.defaultView;
    if (!view) return;

    this.intervalId = view.setInterval(() => this.render(), 30_000);
  }

  private render(): void {
    const time = this.ownerDocument.createElement("time");
    time.className = [
      "timestamp",
      sizeClass(this.size),
      this.tone === "muted" ? "toneMuted" : "toneDefault",
    ].join(" ");
    time.setAttribute("part", "root timestamp");

    const parsedValue = parseTimestampValue(this.value);
    const nowDate = this.hasAttribute("now")
      ? parseTimestampValue(this.now).date
      : new Date();
    const locale = this.locale || resolveElementLocale(this);
    const isValid = !Number.isNaN(parsedValue.date.getTime());

    const label = isValid
      ? formatTimestamp(
          parsedValue.date,
          nowDate,
          this.format,
          locale,
          this.showTimezone,
          this.autoThreshold,
        )
      : "";

    const showsRelative =
      this.format === "relative" ||
      (this.format === "auto" &&
        isValid &&
        Math.abs(nowDate.getTime() - parsedValue.date.getTime()) / 1000 <
          this.autoThreshold);

    const fullDate =
      isValid && this.tooltip && showsRelative
        ? new Intl.DateTimeFormat(locale, {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(parsedValue.date)
        : undefined;

    if (isValid && parsedValue.dateTime) {
      time.setAttribute("datetime", parsedValue.dateTime);
    }
    if (fullDate) {
      time.setAttribute("title", fullDate);
    }
    time.textContent = label;

    this.replaceShadow(styles, time);
  }
}
