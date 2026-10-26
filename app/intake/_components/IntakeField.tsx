"use client";

import { Checkbox, CheckboxGroup, RadioGroup, Text, TextArea, TextInput } from "@digitaltableteur/react";

import { format, type IntakeCopyTable } from "@/app/lib/intake/copy";
import { INTAKE_LIMITS } from "@/app/lib/intake/schema";
import type { AnswerValue, IntakeField as Field, IntakeLocale } from "@/app/lib/intake/types";

import styles from "./intake.module.css";

const AUTOCOMPLETE: Record<string, string> = {
  contact_name: "name",
  email: "email",
  phone: "tel",
  business_name: "organization",
  contact_role: "organization-title",
};

export function fieldAnchor(fieldId: string): string {
  return `field-${fieldId}`;
}

const SCALE_OPTIONS = [1, 2, 3, 4, 5].map((value) => ({ value: String(value), label: String(value) }));

/** One questionnaire field, rendered with the design-system control for its kind. */
export function IntakeField({
  field,
  locale,
  copy,
  value,
  error,
  onChange,
}: {
  field: Field;
  locale: IntakeLocale;
  copy: IntakeCopyTable;
  value: AnswerValue | undefined;
  error?: string;
  onChange: (value: AnswerValue) => void;
}) {
  const wide = field.width === "full" || field.kind === "longText" || field.kind === "choices" || field.kind === "scale";
  const required = field.required === "submit";
  const help = "help" in field && field.help ? field.help[locale] : undefined;

  let control: React.ReactNode;
  switch (field.kind) {
    case "text":
    case "email":
    case "tel":
      control = (
        <TextInput
          label={field.label[locale]}
          type={field.kind}
          value={typeof value === "string" ? value : ""}
          onValueChange={(next) => onChange(String(next))}
          maxLength={INTAKE_LIMITS[field.kind]}
          autoComplete={AUTOCOMPLETE[field.id] ?? "off"}
          required={required}
          helperText={help}
          error={error}
        />
      );
      break;
    case "longText":
      control = (
        <TextArea
          label={field.label[locale]}
          value={typeof value === "string" ? value : ""}
          onChange={(next) => onChange(next)}
          rows={Math.max(field.rows, 3)}
          minRows={Math.max(field.rows, 3)}
          maxLength={INTAKE_LIMITS.longText}
          required={required}
          helperText={help}
          error={error}
        />
      );
      break;
    case "choices":
      control = (
        <CheckboxGroup
          id={field.id}
          label={field.label[locale]}
          hideLegend={field.labelIsSectionTitle}
          showMasterCheckbox={false}
          options={field.options.map((option) => ({ value: option.id, label: option.label[locale] }))}
          defaultSelected={Array.isArray(value) ? [...value] : []}
          onChange={(selected) => onChange(selected)}
        />
      );
      break;
    case "scale":
      control = (
        <RadioGroup
          name={field.id}
          legend={format(copy.scaleLegend, { min: field.minLabel[locale], max: field.maxLabel[locale] })}
          hideLegend
          orientation="horizontal"
          options={SCALE_OPTIONS}
          value={typeof value === "number" ? String(value) : ""}
          onValueChange={(next) => onChange(Number(next))}
          startLabel={field.minLabel[locale]}
          endLabel={field.maxLabel[locale]}
          error={error}
        />
      );
      break;
    case "confirm":
      control = (
        <Checkbox
          label={`${field.label[locale]}${required ? " *" : ""}`}
          checked={value === true}
          onCheckedChange={(checked) => onChange(checked)}
          helperText={help}
          error={error}
        />
      );
      break;
    case "submissionDate":
      control = (
        <span className={styles.stack}>
          <Text as="span" size="s">
            {field.label[locale]}
          </Text>
          <Text as="span" size="s" className={styles.status}>
            {copy.submissionDatePending}
          </Text>
        </span>
      );
      break;
  }

  return (
    <div id={fieldAnchor(field.id)} className={wide ? styles.full : undefined}>
      {control}
    </div>
  );
}
