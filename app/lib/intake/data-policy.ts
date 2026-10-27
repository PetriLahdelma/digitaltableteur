import { isInputField } from "./schema";
import type { IntakeLocale, Questionnaire, Sensitivity } from "./types";

/**
 * Data handling for the intake system, decided 2026-10-26 (docs/intake/
 * README.md section 10). The owner keeps every submitted PDF locally, so the
 * server keeps data only as long as the client area needs it.
 */
export const RETENTION = {
  inviteLinkHours: 72,
  loginCodeMinutes: 10,
  sessionIdleMinutes: 30,
  sessionAbsoluteHours: 12,
  draftDaysSinceLastEdit: 90,
  submissionMonths: 12,
  auditLogMonths: 12,
} as const;

/**
 * Times in the intake read in the business's zone everywhere: pages, emails
 * and the PDF. Server renders would otherwise show UTC.
 */
export const INTAKE_TIME_ZONE = "Europe/Helsinki";

/** Swedish copy stays in the definitions but is not offered until reviewed. */
export const ENABLED_INTAKE_LOCALES: readonly IntakeLocale[] = ["en", "fi"];

type ClassPolicy = Readonly<{
  atRest: string;
  travelsTo: string;
  neverIn: string;
  retention: string;
}>;

const ANSWER_STORE = "AES-256-GCM answer document in Postgres (Neon, EU; key outside the database)";
const NEVER = "client emails, Sentry, Vercel logs, analytics";
const ROUTE =
  "browser, intake function (EU), Postgres, PDF renderer (EU, in memory), owner admin view, owner's copy by email at submit (Resend/SES Ireland to Microsoft 365, answers and PDF)";

export const CLASS_POLICY: Readonly<Record<Sensitivity, ClassPolicy>> = {
  personal: {
    atRest: `${ANSWER_STORE}; email also kept as an HMAC for lookup`,
    travelsTo: ROUTE,
    neverIn: NEVER,
    retention: "draft 90 d after last edit; submission and PDF 12 mo; the owner's emailed copy stays with the project correspondence",
  },
  third_party_personal: {
    atRest: ANSWER_STORE,
    travelsTo: ROUTE,
    neverIn: NEVER,
    retention: "draft 90 d after last edit; submission and PDF 12 mo; the owner's emailed copy stays with the project correspondence",
  },
  business_confidential: {
    atRest: ANSWER_STORE,
    travelsTo: ROUTE,
    neverIn: NEVER,
    retention: "draft 90 d after last edit; submission and PDF 12 mo; the owner's emailed copy stays with the project correspondence",
  },
  operational: {
    atRest: ANSWER_STORE,
    travelsTo: ROUTE,
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
    "| Class | At rest | Travels to | Never in | Retention |",
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
