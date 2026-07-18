/**
 * Pricing model for the /pricing calculator (owner-approved 2026-07-18):
 * standard rate 120 €/h at 7.5 h/day. Only the 6/12-month partnership tiers
 * discount, at a flat 90 €/h (−25%), and only at a partnership workload of
 * 4+ days/week; lighter workloads stay at the standard rate.
 */

export const STANDARD_RATE = 120;
export const HOURS_PER_DAY = 7.5;
export const FULL_WEEK_DAYS = 5;
export const PARTNERSHIP_MIN_DAYS = 4;

const WEEKS_PER_MONTH = 52 / 12;

export type DurationId = "2w" | "1m" | "2m" | "3m" | "6m" | "12m";

export interface DurationOption {
  id: DurationId;
  /** Displayed quantity (2 weeks, 1 month, …). */
  amount: number;
  unit: "weeks" | "months";
  /** Duration in weeks as an exact fraction (52/12 weeks per month), so hour
   * totals can round on true midpoints instead of float noise. */
  weeksNumerator: number;
  weeksDenominator: number;
  weeks: number;
  /** Fractional discount applied to the hourly rate. */
  discount: number;
  /** Marks the long-commitment partnership tiers. */
  partnership: boolean;
}

export const DURATION_OPTIONS: DurationOption[] = [
  { id: "2w", amount: 2, unit: "weeks", weeksNumerator: 2, weeksDenominator: 1, weeks: 2, discount: 0, partnership: false },
  { id: "1m", amount: 1, unit: "months", weeksNumerator: 52, weeksDenominator: 12, weeks: WEEKS_PER_MONTH, discount: 0, partnership: false },
  { id: "2m", amount: 2, unit: "months", weeksNumerator: 104, weeksDenominator: 12, weeks: 2 * WEEKS_PER_MONTH, discount: 0, partnership: false },
  { id: "3m", amount: 3, unit: "months", weeksNumerator: 156, weeksDenominator: 12, weeks: 3 * WEEKS_PER_MONTH, discount: 0, partnership: false },
  { id: "6m", amount: 6, unit: "months", weeksNumerator: 312, weeksDenominator: 12, weeks: 6 * WEEKS_PER_MONTH, discount: 0.25, partnership: true },
  { id: "12m", amount: 12, unit: "months", weeksNumerator: 624, weeksDenominator: 12, weeks: 12 * WEEKS_PER_MONTH, discount: 0.25, partnership: true },
];

export const DAYS_PER_WEEK_OPTIONS = [2, 3, 4, 5] as const;

/** Short engagements (2 weeks / 1 month) require a 4+ days/week workload;
 * lighter 2–3 day paces are only offered from 2 months up. */
const SHORT_DURATIONS: DurationId[] = ["2w", "1m"];

export function getWorkloadOptions(durationId: DurationId): number[] {
  const short = SHORT_DURATIONS.includes(durationId);
  return DAYS_PER_WEEK_OPTIONS.filter(
    (days) => !short || days >= PARTNERSHIP_MIN_DAYS,
  );
}

export interface PricingBreakdown {
  totalHours: number;
  standardRate: number;
  /** Standard rate after the duration tier discount, rounded to whole euros. */
  effectiveRate: number;
  discount: number;
  /** Share of a full 5-day week, as a whole percentage. */
  allocationPercent: number;
  total: number;
  /** Saved versus the standard rate; 0 when no discount applies. */
  savings: number;
}

export function getDurationOption(id: DurationId): DurationOption {
  return DURATION_OPTIONS.find((option) => option.id === id) ?? DURATION_OPTIONS[0];
}

export function computePricing(
  durationId: DurationId,
  daysPerWeek: number,
): PricingBreakdown {
  const duration = getDurationOption(durationId);
  // Integer numerator (weeks×days×7.5 = ×15/2) so .5-hour midpoints round
  // consistently up instead of drifting on 52/12 float noise.
  const totalHours = Math.round(
    (duration.weeksNumerator * daysPerWeek * 15) /
      (2 * duration.weeksDenominator),
  );
  const discount =
    duration.discount > 0 && daysPerWeek >= PARTNERSHIP_MIN_DAYS
      ? duration.discount
      : 0;
  const effectiveRate = Math.round(STANDARD_RATE * (1 - discount));
  const total = Math.round(totalHours * effectiveRate);
  return {
    totalHours,
    standardRate: STANDARD_RATE,
    effectiveRate,
    discount,
    allocationPercent: Math.round((daysPerWeek / FULL_WEEK_DAYS) * 100),
    total,
    savings: totalHours * STANDARD_RATE - total,
  };
}
