"use client";

import {
  Button,
  FlexBox,
  Section,
  Title,
  VisuallyHidden,
} from "@digitaltableteur/react";
// Alpha: imported from source until promoted into the package.
import SummaryList from "@dt/SummaryList";

import { answerLabel, answerLines, summaryTitle } from "@/app/lib/intake/answer-text";
import { intakeCopy } from "@/app/lib/intake/copy";
import { isInputField, isVisible } from "@/app/lib/intake/schema";
import type { Answers, IntakeLocale, Questionnaire } from "@/app/lib/intake/types";

export { answerDisplay, answerLabel, sentenceCase } from "@/app/lib/intake/answer-text";

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
                          value: answerLines(field, answers[field.id], locale),
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
