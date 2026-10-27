import { parsePhoneNumberFromString } from "libphonenumber-js";

import { intakeCopy } from "./copy";
import { isInputField, isVisible } from "./schema";
import type { AnswerValue, Answers, IntakeField, IntakeLocale, Questionnaire } from "./types";

/**
 * Answers as text, shared by the on-screen summary (AnswerSummary) and the
 * owner's emailed copy, so both read the same. No React here: server code
 * (mail) and client components both import it.
 */

/** Definitions keep section titles in capitals for the PDF; on screen they read in sentence case. */
export function sentenceCase(text: string): string {
  const lower = text.toLocaleLowerCase();
  return lower.charAt(0).toLocaleUpperCase() + lower.slice(1);
}

/** A section title without its form instruction ("... / skip if not relevant"). */
export function summaryTitle(title: string): string {
  return sentenceCase(title.split(" / ")[0]);
}

export function answerLabel(field: IntakeField, locale: IntakeLocale): string {
  const t = intakeCopy(locale);
  if (field.kind === "scale") return t("scaleLegend", { min: field.minLabel[locale], max: field.maxLabel[locale] });
  return field.label[locale];
}

export function isEmptyAnswer(value: AnswerValue | undefined): boolean {
  return value === undefined || value === "" || (Array.isArray(value) && value.length === 0);
}

/** The answer as text, for error summaries and anywhere a plain string is needed. */
export function answerDisplay(field: IntakeField, value: AnswerValue | undefined, locale: IntakeLocale): string {
  const t = intakeCopy(locale);
  if (isEmptyAnswer(value)) return t("notAnswered");
  switch (field.kind) {
    case "choices":
      return (value as readonly string[]).map((id) => field.options.find((option) => option.id === id)?.label[locale] ?? id).join(", ");
    case "select":
      return field.options.find((option) => option.id === value)?.label[locale] ?? String(value);
    case "confirm":
      return value === true ? t("yes") : t("no");
    case "tel":
      // Stored as E.164 (+358456574469); read as +358 45 6574469.
      return parsePhoneNumberFromString(String(value))?.formatInternational() ?? String(value);
    case "scale": {
      const n = Number(value);
      const middle = (field.min + field.max) / 2;
      if (n === middle) return t("scaleAnswerMiddle", { value: n, max: field.max });
      return t("scaleAnswer", { value: n, max: field.max, side: (n < middle ? field.minLabel : field.maxLabel)[locale] });
    }
    default:
      return String(value);
  }
}

/** Like answerDisplay, but several choices one per line (the value keeps line breaks). */
export function answerLines(field: IntakeField, value: AnswerValue | undefined, locale: IntakeLocale): string {
  if (field.kind === "choices" && Array.isArray(value) && value.length > 1)
    return value.map((id) => field.options.find((option) => option.id === id)?.label[locale] ?? id).join("\n");
  return answerDisplay(field, value, locale);
}

export type AnswerOutline = ReadonlyArray<{
  title: string;
  sections: ReadonlyArray<{ title: string; rows: ReadonlyArray<{ label: string; value: string }> }>;
}>;

/**
 * Every visible question grouped by part and section, in reading order. With
 * `answeredOnly`, unanswered questions are left out, and so are sections and
 * parts left empty (the owner's email; the PDF keeps the full form).
 */
export function answerOutline(
  questionnaire: Questionnaire,
  answers: Answers,
  locale: IntakeLocale,
  { answeredOnly = false }: { answeredOnly?: boolean } = {},
): AnswerOutline {
  return questionnaire.pages
    .filter((page) => isVisible(page, answers))
    .map((page) => ({
      title: page.title[locale],
      sections: page.sections
        .filter((section) => isVisible(section, answers))
        .map((section) => ({
          title: summaryTitle(section.title[locale]),
          rows: section.fields
            .filter(isInputField)
            .filter((field) => !answeredOnly || !isEmptyAnswer(answers[field.id]))
            .map((field) => ({ label: answerLabel(field, locale), value: answerLines(field, answers[field.id], locale) })),
        }))
        .filter((section) => section.rows.length > 0),
    }))
    .filter((page) => page.sections.length > 0);
}
