"use client";

import {
  Checkbox,
  CheckboxGroup,
  Combobox,
  MultiCombobox,
  PhoneInput,
  FlexBox,
  RadioGroup,
  Select,
  Text,
  TextArea,
  TextInput,
} from "@digitaltableteur/react";

import { format, type IntakeCopyTable } from "@/app/lib/intake/copy";
import { INTAKE_LIMITS } from "@/app/lib/intake/schema";
import type {
  AnswerValue,
  IntakeField as Field,
  IntakeLocale,
} from "@/app/lib/intake/types";

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

const SCALE_OPTIONS = [1, 2, 3, 4, 5].map((value) => ({
  value: String(value),
  label: String(value),
}));

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
  const required = field.required === "submit";
  const help = "help" in field && field.help ? field.help[locale] : undefined;

  let control: React.ReactNode;
  switch (field.kind) {
    case "tel":
      control = (
        <PhoneInput
          label={field.label[locale]}
          defaultCountry="FI"
          size="lg"
          value={typeof value === "string" ? value : ""}
          onChange={(next) => onChange(next ?? "")}
          required={required}
          helperText={help}
          error={error}
        />
      );
      break;
    case "text":
    case "email":
      control = (
        <TextInput
          label={field.label[locale]}
          type={field.kind}
          size="lg"
          width={field.kind === "email" ? "30ch" : "full"}
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
      // A short list stays as checkboxes, all visible at once; a long one
      // (every service on offer) becomes a multi-select with type-to-filter.
      control =
        field.options.length > 8 ? (
          <MultiCombobox
            label={field.label[locale]}
            options={field.options.map((option) => ({
              value: option.id,
              label: option.label[locale],
            }))}
            value={Array.isArray(value) ? [...value] : []}
            onValueChange={(next) => onChange(next)}
            placeholder={copy.selectPlaceholder}
            required={required}
            helperText={help}
            error={error}
          />
        ) : (
          <CheckboxGroup
            id={field.id}
            label={field.label[locale]}
            hideLegend={field.labelIsSectionTitle}
            showMasterCheckbox={false}
            options={field.options.map((option) => ({
              value: option.id,
              label: option.label[locale],
            }))}
            defaultSelected={Array.isArray(value) ? [...value] : []}
            onChange={(selected) => onChange(selected)}
          />
        );
      break;
    case "select":
      // A long list (every time zone) gets type-to-filter; a short one stays a native select.
      control =
        field.options.length > 12 ? (
          <Combobox
            label={field.label[locale]}
            options={field.options.map((option) => ({
              value: option.id,
              label: option.label[locale],
            }))}
            value={typeof value === "string" ? value : ""}
            onValueChange={(next) => onChange(next)}
            placeholder={copy.selectPlaceholder}
            required={required}
            helperText={help}
            error={error}
          />
        ) : (
          <Select
            label={field.label[locale]}
            size="lg"
            value={typeof value === "string" ? value : ""}
            onValueChange={(next) => onChange(next)}
            options={[
              { value: "", label: copy.selectPlaceholder },
              ...field.options.map((option) => ({
                value: option.id,
                label: option.label[locale],
              })),
            ]}
            required={required}
            helperText={help}
            error={error}
          />
        );
      break;
    case "scale":
      control = (
        <RadioGroup
          name={field.id}
          legend={format(copy.scaleLegend, {
            min: field.minLabel[locale],
            max: field.maxLabel[locale],
          })}
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
        <FlexBox direction="column" gap="var(--space-internal-4)">
          <Text as="span" size="s">
            {field.label[locale]}
          </Text>
          <Text as="span" size="s">
            {copy.submissionDatePending}
          </Text>
        </FlexBox>
      );
      break;
  }

  return <div id={fieldAnchor(field.id)}>{control}</div>;
}
