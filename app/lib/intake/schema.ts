import { z } from "zod";

import type { Answers, Condition, IntakeField, IntakePage, IntakeSection, Questionnaire } from "./types";

/** Server-side limits. The client mirrors them as maxLength hints only. */
export const INTAKE_LIMITS = {
  text: 200,
  email: 254,
  tel: 40,
  longText: 4000,
} as const;

type InputField = Exclude<IntakeField, { kind: "submissionDate" }>;

export function isInputField(field: IntakeField): field is InputField {
  return field.kind !== "submissionDate";
}

export function inputFields(questionnaire: Questionnaire): InputField[] {
  return questionnaire.pages.flatMap((page) =>
    page.sections.flatMap((section) => section.fields.filter(isInputField)),
  );
}

function valueSchema(field: InputField): z.ZodType {
  switch (field.kind) {
    case "text":
      return z.string().trim().max(INTAKE_LIMITS.text);
    case "email":
      return z.union([z.literal(""), z.email().max(INTAKE_LIMITS.email)]);
    case "tel":
      return z
        .string()
        .trim()
        .max(INTAKE_LIMITS.tel)
        .regex(/^[0-9+()\-.\s]*$/, "Only digits, spaces and + ( ) - . are allowed");
    case "longText":
      return z.string().trim().max(INTAKE_LIMITS.longText);
    case "choices": {
      const ids = field.options.map((option) => option.id) as [string, ...string[]];
      return z
        .array(z.enum(ids))
        .max(ids.length)
        .refine((values) => new Set(values).size === values.length, "Duplicate option");
    }
    case "select": {
      const ids = field.options.map((option) => option.id) as [string, ...string[]];
      return z.union([z.literal(""), z.enum(ids)]);
    }
    case "scale":
      return z.number().int().min(field.min).max(field.max);
    case "confirm":
      return z.boolean();
  }
}

/** Drafts: every answer optional, unknown keys rejected, limits enforced. */
export function draftSchema(questionnaire: Questionnaire) {
  const shape: Record<string, z.ZodType> = {};
  for (const field of inputFields(questionnaire)) shape[field.id] = valueSchema(field).optional();
  return z.object(shape).strict();
}

function isEmpty(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === false ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0)
  );
}

function conditionMet(condition: Condition, answers: Answers): boolean {
  const value = answers[condition.field];
  if (!Array.isArray(value) || value.length === 0) return true;
  return condition.includesAny.some((option) => value.includes(option));
}

export function isVisible(node: IntakePage | IntakeSection, answers: Answers): boolean {
  return !node.showWhen || node.showWhen.some((condition) => conditionMet(condition, answers));
}

/** Input fields the respondent can currently see. */
export function visibleFields(questionnaire: Questionnaire, answers: Answers): InputField[] {
  return questionnaire.pages
    .filter((page) => isVisible(page, answers))
    .flatMap((page) =>
      page.sections
        .filter((section) => isVisible(section, answers))
        .flatMap((section) => section.fields.filter(isInputField)),
    );
}

/**
 * Data minimisation at submit: answers to sections the respondent can no
 * longer see (for example after unticking "Website") are dropped, not kept.
 */
export function pruneHiddenAnswers(questionnaire: Questionnaire, answers: Answers): Answers {
  const keep = new Set(visibleFields(questionnaire, answers).map((field) => field.id));
  return Object.fromEntries(Object.entries(answers).filter(([id, value]) => keep.has(id) && !isEmpty(value)));
}

/** Submission: draft rules plus required answers among the visible fields. */
export function submissionSchema(questionnaire: Questionnaire) {
  return draftSchema(questionnaire).superRefine((answers, ctx) => {
    for (const field of visibleFields(questionnaire, answers as Answers)) {
      if (field.required === "submit" && isEmpty((answers as Answers)[field.id])) {
        ctx.addIssue({ code: "custom", path: [field.id], message: "Required" });
      }
    }
  });
}
