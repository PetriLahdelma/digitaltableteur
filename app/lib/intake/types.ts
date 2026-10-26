/**
 * Questionnaire definition types for the client intake system.
 *
 * A definition is the single source for the web form, server validation and
 * the PDF. It is versioned: a submission stores `id` and `version`, so its
 * answers always resolve against the questions they were given to.
 */

export const INTAKE_LOCALES = ["en", "fi", "sv"] as const;
export type IntakeLocale = (typeof INTAKE_LOCALES)[number];

export type LocalizedCopy = Readonly<Record<IntakeLocale, string>>;

/**
 * Data classes drive encryption, logging and retention (see data-policy.ts).
 * - personal: identifies or contacts the respondent
 * - third_party_personal: names or describes people other than the respondent
 * - business_confidential: commercial, strategic or technical detail
 * - operational: low-risk selections that steer the form
 */
export type Sensitivity = "personal" | "third_party_personal" | "business_confidential" | "operational";

/**
 * A section or page is shown when ANY condition matches. A condition matches
 * when the choices field includes one of the listed options, or when the
 * respondent has selected nothing yet: content is never hidden behind an
 * unanswered question.
 */
export type Condition = Readonly<{ field: string; includesAny: readonly string[] }>;

type FieldBase = Readonly<{
  id: string;
  label: LocalizedCopy;
  help?: LocalizedCopy;
  width: "half" | "full";
  /** Only "submit" exists: drafts never enforce required fields. */
  required?: "submit";
  sensitivity: Sensitivity;
}>;

export type TextField = FieldBase & Readonly<{ kind: "text" | "email" | "tel" }>;
export type LongTextField = FieldBase & Readonly<{ kind: "longText"; rows: number }>;
export type ChoicesField = FieldBase &
  Readonly<{
    kind: "choices";
    multiple: true;
    options: readonly Readonly<{ id: string; label: LocalizedCopy }>[];
    /** The section title doubles as the group legend. */
    labelIsSectionTitle?: true;
  }>;
/** One choice from a fixed list, shown as a dropdown. */
export type SelectField = FieldBase &
  Readonly<{
    kind: "select";
    options: readonly Readonly<{ id: string; label: LocalizedCopy }>[];
  }>;
export type ScaleField = Omit<FieldBase, "label" | "help"> &
  Readonly<{ kind: "scale"; min: 1; max: 5; minLabel: LocalizedCopy; maxLabel: LocalizedCopy }>;
export type ConfirmField = FieldBase & Readonly<{ kind: "confirm" }>;
/** Display only: the server stamps the submission date. Never an answer. */
export type SubmissionDateField = FieldBase & Readonly<{ kind: "submissionDate" }>;

export type IntakeField = TextField | LongTextField | ChoicesField | SelectField | ScaleField | ConfirmField | SubmissionDateField;

export type IntakeSection = Readonly<{
  id: string;
  title: LocalizedCopy;
  description?: LocalizedCopy;
  closing?: LocalizedCopy;
  showWhen?: readonly Condition[];
  fields: readonly IntakeField[];
}>;

export type IntakePage = Readonly<{
  id: string;
  /** Header label, e.g. "PART A / INITIAL ENQUIRY". */
  part: LocalizedCopy;
  title: LocalizedCopy;
  intro: LocalizedCopy;
  closing?: LocalizedCopy;
  showWhen?: readonly Condition[];
  sections: readonly IntakeSection[];
}>;

export type Questionnaire = Readonly<{
  id: string;
  /** Semantic version; a published version is never edited in place. */
  version: string;
  title: LocalizedCopy;
  /** Footer document name in the PDF. */
  documentName: LocalizedCopy;
  pages: readonly IntakePage[];
}>;

export type AnswerValue = string | number | boolean | readonly string[];
export type Answers = Readonly<Record<string, AnswerValue>>;
