export interface TextRewriteInput {
  title: string;
  issueType: string;
  priority: string;
  description: string;
  pageOrComponent?: string;
  labels?: string[];
  rawInput: string;
}

export interface TextRewriteResult {
  cleaned: string;
  finalBody: string;
}

function sentenceSplit(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function extractSegments(description: string) {
  const sentences = sentenceSplit(description);
  const expected: string[] = [];
  const actual: string[] = [];
  const steps: string[] = [];
  const general: string[] = [];

  sentences.forEach((sentence) => {
    const lower = sentence.toLowerCase();
    if (/(expected|should|ideally)/.test(lower)) {
      expected.push(sentence);
    } else if (/(actual|currently|instead|right now)/.test(lower)) {
      actual.push(sentence);
    } else if (/^\d+\.?\s/.test(sentence) || /step\s+\d+/i.test(sentence)) {
      steps.push(sentence);
    } else {
      general.push(sentence);
    }
  });

  return { expected, actual, steps, general };
}

function buildAcceptanceCriteria(issueType: string): string[] {
  const normalized = issueType.toLowerCase();
  if (normalized === "bug") {
    return [
      "- [ ] Bug reproduced and root cause documented",
      "- [ ] Automated or manual test updated to cover regression",
      "- [ ] Fix validated in staging and production",
    ];
  }
  if (normalized === "enhancement") {
    return [
      "- [ ] Scope reviewed with design/system stakeholders",
      "- [ ] Implementation matches updated specs",
      "- [ ] QA sign-off recorded",
    ];
  }
  return [
    "- [ ] Requirements agreed upon with stakeholders",
    "- [ ] Work demoed or recorded",
  ];
}

export function rewriteIssueDescription(
  input: TextRewriteInput,
): TextRewriteResult {
  const segments = extractSegments(input.description);
  const problem =
    segments.general[0] ??
    segments.actual[0] ??
    "Reporter provided limited context. See raw notes below.";

  const expected =
    segments.expected.join(" ") ||
    "Reporter expects the experience to match the product specification.";
  const actual =
    segments.actual.join(" ") ||
    "Current behavior deviates from expectations described above.";

  const steps =
    segments.steps.length > 0
      ? segments.steps.map((step) => `- ${step}`)
      : [
          "- Navigate to the area described above",
          "- Match reporter context to reproduce",
        ];

  const acceptanceCriteria = buildAcceptanceCriteria(input.issueType);

  const cleanedSections = [
    `**Issue Type:** ${input.issueType} | **Priority:** ${input.priority}`,
    input.pageOrComponent
      ? `**Surface / Component:** ${input.pageOrComponent}`
      : undefined,
    input.labels?.length ? `**Labels:** ${input.labels.join(", ")}` : undefined,
    "",
    "**Description (Cleaned)**",
    `**Problem Statement**\n${problem}`,
    `**Observed / Actual**\n${actual}`,
    `**Expected**\n${expected}`,
    "**Steps to Reproduce**",
    ...steps,
    "",
    "**Acceptance Criteria**",
    ...acceptanceCriteria,
    "",
    "**User's Raw Input**",
    input.rawInput.trim(),
  ].filter(Boolean);

  const finalBody = cleanedSections.join("\n");
  return { cleaned: finalBody, finalBody };
}
