/**
 * Pricing model for the /pricing calculator (owner-approved 2026-07-18):
 * standard rate 120 €/h at 7 h/day, with hourly-rate discounts on longer
 * commitments (3 mo −5%, 6 mo −10%, 12 mo −15%).
 */

export const STANDARD_RATE = 120;
export const HOURS_PER_DAY = 7;
export const FULL_WEEK_DAYS = 5;

const WEEKS_PER_MONTH = 52 / 12;

export type DurationId = "2w" | "1m" | "2m" | "3m" | "6m" | "12m";

export interface DurationOption {
  id: DurationId;
  /** Displayed quantity (2 weeks, 1 month, …). */
  amount: number;
  unit: "weeks" | "months";
  weeks: number;
  /** Fractional discount applied to the hourly rate. */
  discount: number;
  /** Marks the long-commitment partnership tiers. */
  partnership: boolean;
}

export const DURATION_OPTIONS: DurationOption[] = [
  { id: "2w", amount: 2, unit: "weeks", weeks: 2, discount: 0, partnership: false },
  { id: "1m", amount: 1, unit: "months", weeks: WEEKS_PER_MONTH, discount: 0, partnership: false },
  { id: "2m", amount: 2, unit: "months", weeks: 2 * WEEKS_PER_MONTH, discount: 0, partnership: false },
  { id: "3m", amount: 3, unit: "months", weeks: 3 * WEEKS_PER_MONTH, discount: 0.05, partnership: false },
  { id: "6m", amount: 6, unit: "months", weeks: 6 * WEEKS_PER_MONTH, discount: 0.1, partnership: true },
  { id: "12m", amount: 12, unit: "months", weeks: 12 * WEEKS_PER_MONTH, discount: 0.15, partnership: true },
];

export const DAYS_PER_WEEK_OPTIONS = [2, 3, 4, 5] as const;

export interface PricingBreakdown {
  totalHours: number;
  standardRate: number;
  /** Standard rate after the duration tier discount, rounded to whole euros. */
  effectiveRate: number;
  discount: number;
  /** Share of a full 5-day week, as a whole percentage. */
  allocationPercent: number;
  total: number;
}

export function getDurationOption(id: DurationId): DurationOption {
  return DURATION_OPTIONS.find((option) => option.id === id) ?? DURATION_OPTIONS[0];
}

export function computePricing(
  durationId: DurationId,
  daysPerWeek: number,
): PricingBreakdown {
  const duration = getDurationOption(durationId);
  const totalHours = Math.round(duration.weeks * daysPerWeek * HOURS_PER_DAY);
  const effectiveRate = Math.round(STANDARD_RATE * (1 - duration.discount));
  return {
    totalHours,
    standardRate: STANDARD_RATE,
    effectiveRate,
    discount: duration.discount,
    allocationPercent: Math.round((daysPerWeek / FULL_WEEK_DAYS) * 100),
    total: Math.round(totalHours * effectiveRate),
  };
}
