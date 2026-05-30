import type { DonnyState } from "@dt/DonnyAvatar";

/** User-requestable avatar moods (excludes lifecycle states like typing/loading). */
export const DONNY_SHOWCASE_EXPRESSIONS = [
  "celebrating",
  "confused",
  "curious",
  "playful",
  "thinking",
  "impressed",
  "skeptical",
  "waving",
  "apologetic",
  "confident",
  "suggesting",
  "remembering",
  "focused",
  "greeting",
] as const satisfies readonly DonnyState[];

export type DonnyShowcaseExpression = (typeof DONNY_SHOWCASE_EXPRESSIONS)[number];

export const DEFAULT_DONNY_EXPRESSION_DURATION_MS = 2_500;

export const DONNY_EXPRESSION_LABELS: Record<DonnyShowcaseExpression, string> = {
  celebrating: "Celebrating",
  confused: "Confused",
  curious: "Curious",
  playful: "Playful",
  thinking: "Thinking",
  impressed: "Impressed",
  skeptical: "Skeptical",
  waving: "Waving",
  apologetic: "Apologetic",
  confident: "Confident",
  suggesting: "Suggesting",
  remembering: "Remembering",
  focused: "Focused",
  greeting: "Greeting",
};

const SHOWCASE_SET = new Set<string>(DONNY_SHOWCASE_EXPRESSIONS);

export function isDonnyShowcaseExpression(
  value: string,
): value is DonnyShowcaseExpression {
  return SHOWCASE_SET.has(value);
}

const EXPRESSION_ALIASES: Record<string, DonnyShowcaseExpression> = {
  happy: "celebrating",
  happiness: "celebrating",
  joy: "celebrating",
  joyful: "celebrating",
  excited: "celebrating",
  celebrate: "celebrating",
  celebration: "celebrating",
  success: "celebrating",
  sad: "apologetic",
  sorry: "apologetic",
  apologize: "apologetic",
  surprise: "impressed",
  surprised: "impressed",
  wow: "impressed",
  wave: "waving",
  hello: "greeting",
  hi: "greeting",
  welcome: "greeting",
  think: "thinking",
  ponder: "thinking",
  wonder: "curious",
  question: "curious",
  doubt: "skeptical",
  unsure: "skeptical",
  focus: "focused",
  remember: "remembering",
  recall: "remembering",
  suggest: "suggesting",
  idea: "suggesting",
  fun: "playful",
  silly: "playful",
  wink: "playful",
  mood: "playful",
  expression: "playful",
  face: "playful",
};

function normalizeExpressionToken(raw: string): string {
  return raw.trim().toLowerCase().replace(/[\s_]+/g, "-");
}

/** Resolve natural language or canonical ids to a showcase expression. */
export function resolveDonnyShowcaseExpression(
  raw: string | undefined | null,
  fallback: DonnyShowcaseExpression = "playful",
): DonnyShowcaseExpression {
  if (!raw?.trim()) return fallback;

  const normalized = normalizeExpressionToken(raw);
  if (isDonnyShowcaseExpression(normalized)) {
    return normalized;
  }

  const alias = EXPRESSION_ALIASES[normalized.replace(/-/g, "")] ??
    EXPRESSION_ALIASES[normalized];
  if (alias) return alias;

  return fallback;
}

export function clampDonnyExpressionDurationMs(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_DONNY_EXPRESSION_DURATION_MS;
  }
  return Math.max(800, Math.min(Math.round(value), 8_000));
}

export function listDonnyShowcaseExpressions(): Array<{
  id: DonnyShowcaseExpression;
  label: string;
}> {
  return DONNY_SHOWCASE_EXPRESSIONS.map((id) => ({
    id,
    label: DONNY_EXPRESSION_LABELS[id],
  }));
}
