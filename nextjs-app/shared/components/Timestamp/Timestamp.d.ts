import React from "react";
/**
 * Display format, mirroring the Astryx Timestamp reference
 * (https://astryx.atmeta.com/components/Timestamp): user-facing `date`,
 * `date_time`, `time` and `relative`; ISO-style `system_*` variants for
 * developer surfaces; `auto` switches from relative to date_time once the
 * value is older than `autoThreshold`.
 */
export type TimestampFormat = "auto" | "relative" | "date" | "date_time" | "time" | "system_date" | "system_date_time" | "system_time";
export type TimestampSize = "xxs" | "xs" | "s" | "m";
export interface TimestampProps {
    /** The date/time to display: ISO 8601 calendar date or instant, Unix seconds, or Date. */
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
/** Pure formatter, exported for tests. */
export declare const formatTimestamp: (date: Date, nowDate: Date, format: TimestampFormat, locale: string, showTimezone: boolean, autoThreshold: number) => string;
/**
 * Formats a date or time value into human-readable text: relative for
 * recency, absolute for precision, or `auto` to switch between them.
 * Renders a semantic `<time>` with a machine-readable dateTime attribute;
 * relative modes carry the full date as a native tooltip.
 */
export declare const Timestamp: React.ForwardRefExoticComponent<TimestampProps & React.RefAttributes<HTMLTimeElement>>;
export default Timestamp;
//# sourceMappingURL=Timestamp.d.ts.map