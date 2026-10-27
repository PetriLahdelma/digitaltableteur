"use client";

import type { ReactNode } from "react";
import {
  Button,
  FlexBox,
  Section,
  Title,
  VisuallyHidden,
} from "@digitaltableteur/react";
// Alpha: imported from source until promoted into the package.
import SummaryList from "@dt/SummaryList";

import { format, intakeCopy } from "@/app/lib/intake/copy";
import { isInputField, isVisible } from "@/app/lib/intake/schema";
import type {
  AnswerValue,
  Answers,
  IntakeField,
  IntakeLocale,
  Questionnaire,
} from "@/app/lib/intake/types";

/** Definitions keep section titles in capitals for the PDF; on screen they read in sentence case. */
export function sentenceCase(text: string): string {
  const lower = text.toLocaleLowerCase();
  return lower.charAt(0).toLocaleUpperCase() + lower.slice(1);
}

/** A section title without its form instruction ("... / skip if not relevant"). */
function summaryTitle(title: string): string {
  return sentenceCase(title.split(" / ")[0]);
}

export function answerLabel(field: IntakeField, locale: IntakeLocale): string {
  const t = intakeCopy(locale);
  if (field.kind === "scale")
    return t("scaleLegend", {
      min: field.minLabel[locale],
      max: field.maxLabel[locale],
    });
  return field.label[locale];
}

function isEmpty(value: AnswerValue | undefined): boolean {
  return (
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}

/** The answer as text, for error summaries and anywhere a plain string is needed. */
export function answerDisplay(
  field: IntakeField,
  value: AnswerValue | undefined,
  locale: IntakeLocale,
): string {
  const t = intakeCopy(locale);
  if (isEmpty(value)) return t("notAnswered");
  switch (field.kind) {
    case "choices":
      return (value as readonly string[])
        .map(
          (id) =>
            field.options.find((option) => option.id === id)?.label[locale] ??
            id,
        )
        .join(", ");
    case "select":
      return (
        field.options.find((option) => option.id === value)?.label[locale] ??
        String(value)
      );
    case "confirm":
      return value === true ? t("yes") : t("no");
    case "scale": {
      const n = Number(value);
      const middle = (field.min + field.max) / 2;
      if (n === middle)
        return t("scaleAnswerMiddle", { value: n, max: field.max });
      return t("scaleAnswer", {
        value: n,
        max: field.max,
        side: (n < middle ? field.minLabel : field.maxLabel)[locale],
      });
    }
    default:
      return String(value);
  }
}

/** The answer for the summary: several choices one per line (the value keeps line breaks), everything else as text. */
function answerNode(
  field: IntakeField,
  value: AnswerValue | undefined,
  locale: IntakeLocale,
): ReactNode {
  if (field.kind === "choices" && Array.isArray(value) && value.length > 1)
    return value
      .map(
        (id) =>
          field.options.find((option) => option.id === id)?.label[locale] ??
          id,
      )
      .join("\n");
  return answerDisplay(field, value, locale);
}

/**
 * Every visible answer, grouped as the rail groups them: a heading per part,
 * then each section as a summary list. With `onChange`, each section gets a
 * Change link that names it for screen readers (Check and submit); without,
 * it is the read-only record (the submission page).
 */
export function AnswerSummary({
  questionnaire,
  answers,
  locale,
  onChange,
}: {
  questionnaire: Questionnaire;
  answers: Answers;
  locale: IntakeLocale;
  onChange?: (sectionId: string) => void;
}) {
  const t = intakeCopy(locale);
  return (
    <FlexBox direction="column" gap="var(--space-layout-48)">
      {questionnaire.pages
        .filter((page) => isVisible(page, answers))
        .map((page) => (
          <Section
            key={page.id}
            spacing="none"
            aria-labelledby={`summary-${page.id}`}
          >
            <FlexBox direction="column" gap="var(--space-internal-24)">
              <Title level={2} size="s" id={`summary-${page.id}`}>
                {page.title[locale]}
              </Title>
              {page.sections
                .filter((section) => isVisible(section, answers))
                .map((section) => {
                  const title = summaryTitle(section.title[locale]);
                  return (
                    <FlexBox
                      key={section.id}
                      direction="column"
                      gap="var(--space-internal-12)"
                    >
                      <FlexBox
                        direction="row"
                        justify="space-between"
                        align="center"
                        gap="var(--space-internal-16)"
                      >
                        <Title level={3} size="xs">
                          {title}
                        </Title>
                        {onChange ? (
                          <Button
                            variant="tertiary"
                            icon="pencil"
                            onClick={() => onChange(section.id)}
                          >
                            {t("change")}
                            <VisuallyHidden> {title}</VisuallyHidden>
                          </Button>
                        ) : null}
                      </FlexBox>
                      <SummaryList
                        rows={section.fields.filter(isInputField).map((field) => ({
                          id: field.id,
                          label: answerLabel(field, locale),
                          value: answerNode(field, answers[field.id], locale),
                        }))}
                      />
                    </FlexBox>
                  );
                })}
            </FlexBox>
          </Section>
        ))}
    </FlexBox>
  );
}
