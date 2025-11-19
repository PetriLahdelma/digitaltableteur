export type IssueDomain = "design-system" | "app";

export interface ClassificationInput {
  title: string;
  description: string;
  pageOrComponent?: string;
  issueType?: string;
}

export interface ClassificationResult {
  domain: IssueDomain;
  confidence: "high" | "medium" | "low";
  matchedKeywords: string[];
  reason: string;
}

const DESIGN_SYSTEM_KEYWORDS = [
  "token",
  "storybook",
  "component",
  "grid",
  "icon",
  "design system",
  "theme",
  "component api",
  "docs",
  "documentation",
  "figma",
  "library",
];

const APP_KEYWORDS = [
  "page",
  "screen",
  "flow",
  "login",
  "checkout",
  "homepage",
  "dashboard",
  "form",
  "cta",
  "modal",
  "user",
  "session",
  "profile",
];

export function classifyIssueDomain(
  input: ClassificationInput,
): ClassificationResult {
  const text = [input.title, input.description, input.pageOrComponent]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  let designHits = 0;
  let appHits = 0;
  const matched: string[] = [];

  DESIGN_SYSTEM_KEYWORDS.forEach((keyword) => {
    if (text.includes(keyword)) {
      designHits += 1;
      matched.push(keyword);
    }
  });

  APP_KEYWORDS.forEach((keyword) => {
    if (text.includes(keyword)) {
      appHits += 1;
      matched.push(keyword);
    }
  });

  const domain: IssueDomain = designHits > appHits ? "design-system" : "app";
  const spread = Math.abs(designHits - appHits);
  const rawConfidence = designHits === appHits ? 0 : spread;

  const confidence =
    rawConfidence >= 2 ? "high" : rawConfidence === 1 ? "medium" : "low";

  const reason =
    matched.length > 0
      ? `Matched keywords: ${matched.join(", ")}`
      : "No keyword match; defaulting to app domain.";

  return { domain, confidence, matchedKeywords: matched, reason };
}

export interface LabelDerivationInput {
  domain: IssueDomain;
  issueType?: string;
  providedLabels?: string[];
  componentLabels?: string[];
}

export function deriveLabels(
  input: LabelDerivationInput,
): { labels: string[]; autoApplied: string[] } {
  const base = new Set(
    (input.providedLabels ?? [])
      .map((label) => label.trim())
      .filter(Boolean),
  );
  const autoApplied: string[] = [];

  if (input.domain === "design-system") {
    ["design-system", "ds-triage"].forEach((label) => {
      if (!base.has(label)) {
        autoApplied.push(label);
        base.add(label);
      }
    });
  } else if (input.issueType?.toLowerCase() === "bug") {
    if (!base.has("ui-app-bug")) {
      base.add("ui-app-bug");
      autoApplied.push("ui-app-bug");
    }
  } else {
    if (!base.has("ui-app-triage")) {
      base.add("ui-app-triage");
      autoApplied.push("ui-app-triage");
    }
  }

  (input.componentLabels ?? []).forEach((label) => {
    if (!base.has(label)) {
      base.add(label);
      autoApplied.push(label);
    }
  });

  return { labels: Array.from(base), autoApplied };
}
