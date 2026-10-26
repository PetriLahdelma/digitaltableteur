import { isInputField } from "./schema";
import type { Questionnaire, Sensitivity } from "./types";

/**
 * Proposed data handling for the intake system. PROPOSAL, pending the owner's
 * decisions in docs/intake/README.md (open questions). Nothing reads these
 * values at runtime yet.
 */
export const RETENTION_PROPOSAL = {
  inviteLinkHours: 72,
  loginCodeMinutes: 10,
  sessionIdleMinutes: 30,
  sessionAbsoluteHours: 12,
  draftDaysSinceLastEdit: 90,
  submissionMonths: 24,
  auditLogMonths: 12,
} as const;

type ClassPolicy = Readonly<{
  atRest: string;
  travelsTo: string;
  neverIn: string;
  retention: string;
}>;

const ANSWER_STORE = "AES-256-GCM answer document in MongoDB (key outside the database)";
const NEVER = "email bodies, Sentry, Vercel logs, analytics";

export const CLASS_POLICY: Readonly<Record<Sensitivity, ClassPolicy>> = {
  personal: {
    atRest: `${ANSWER_STORE}; email also kept as an HMAC for lookup`,
    travelsTo: "browser, intake function, MongoDB, PDF renderer, admin export",
    neverIn: NEVER,
    retention: "draft 90 d after last edit; submission 24 mo",
  },
  third_party_personal: {
    atRest: ANSWER_STORE,
    travelsTo: "browser, intake function, MongoDB, PDF renderer, admin export",
    neverIn: NEVER,
    retention: "draft 90 d after last edit; submission 24 mo",
  },
  business_confidential: {
    atRest: ANSWER_STORE,
    travelsTo: "browser, intake function, MongoDB, PDF renderer, admin export",
    neverIn: NEVER,
    retention: "draft 90 d after last edit; submission 24 mo",
  },
  operational: {
    atRest: ANSWER_STORE,
    travelsTo: "browser, intake function, MongoDB, PDF renderer, admin export",
    neverIn: "Sentry, Vercel logs, analytics",
    retention: "same as the submission it belongs to",
  },
};

const SENSITIVITY_LABEL: Readonly<Record<Sensitivity, string>> = {
  personal: "Personal",
  third_party_personal: "Third-party personal",
  business_confidential: "Business confidential",
  operational: "Operational",
};

/** Markdown data map, one row per answer field. Kept in sync by a test. */
export function renderDataMap(questionnaires: readonly Questionnaire[]): string {
  const lines = [
    "# Intake data map",
    "",
    "Generated from `app/lib/intake` by `npm run generate:intake-data-map`. Do not edit by hand.",
    "",
    "## Classes",
    "",
    "| Class | At rest | Travels to | Never in | Retention (proposal) |",
    "| --- | --- | --- | --- | --- |",
    ...(Object.keys(CLASS_POLICY) as Sensitivity[]).map((key) => {
      const policy = CLASS_POLICY[key];
      return `| ${SENSITIVITY_LABEL[key]} | ${policy.atRest} | ${policy.travelsTo} | ${policy.neverIn} | ${policy.retention} |`;
    }),
  ];
  for (const q of questionnaires) {
    lines.push("", `## ${q.title.en} (v${q.version})`, "", "| Page | Field | Kind | Required | Class |", "| --- | --- | --- | --- | --- |");
    for (const page of q.pages) {
      for (const section of page.sections) {
        for (const field of section.fields) {
          if (!isInputField(field)) continue;
          const conditional = section.showWhen || page.showWhen ? " (conditional)" : "";
          lines.push(
            `| ${page.title.en} | \`${field.id}\`${conditional} | ${field.kind} | ${field.required === "submit" ? "on submit" : "no"} | ${SENSITIVITY_LABEL[field.sensitivity]} |`,
          );
        }
      }
    }
  }
  return `${lines.join("\n")}\n`;
}
