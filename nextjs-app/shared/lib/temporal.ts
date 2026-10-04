import { useEffect, useState } from "react";

/**
 * Shared temporal thresholds: the timing half of a component's temporal
 * contract (`temporal` in *.contract.json, exported as `x-temporal`).
 * Contracts state these values as data; components import them from here,
 * and each component's temporal test asserts the two agree, so the contract
 * an agent reads and the behavior a person sees cannot drift apart.
 *
 * Sources: Nielsen, "Response Times: The 3 Important Limits" (0.1 s feels
 * instant, 1 s keeps flow, 10 s is the limit of attention), and the
 * undo-over-confirm guidance in Raskin, "The Humane Interface".
 */
export const TEMPORAL_THRESHOLDS = {
  /** Below this a response feels instant; no feedback is needed. */
  instantMs: 100,
  /** From here a busy indicator is warranted. */
  indicatorMs: 1_000,
  /** From here the delay must be acknowledged in words, with a way out. */
  acknowledgeDelayMs: 10_000,
  /** How long an undoable action stays undoable. */
  undoWindowMs: 10_000,
} as const;

export type TemporalThreshold = keyof typeof TEMPORAL_THRESHOLDS;

/**
 * True once `active` has held continuously for `ms`. Resets to false as soon
 * as `active` turns false, so a new wait starts its clock from zero.
 */
export function useElapsed(active: boolean, ms: number): boolean {
  const [elapsed, setElapsed] = useState(false);
  useEffect(() => {
    if (!active) {
      setElapsed(false);
      return;
    }
    const timer = setTimeout(() => setElapsed(true), ms);
    return () => clearTimeout(timer);
  }, [active, ms]);
  return active && elapsed;
}
