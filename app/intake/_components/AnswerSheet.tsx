import {
  Divider,
  FlexBox,
  Grid,
  Section,
  Text,
  Title,
} from "@digitaltableteur/react";

import { format, intakeCopy } from "@/app/lib/intake/copy";
import { isInputField, isVisible } from "@/app/lib/intake/schema";
import type {
  AnswerValue,
  Answers,
  IntakeField,
  IntakeLocale,
  Questionnaire,
} from "@/app/lib/intake/types";

function label(field: IntakeField, locale: IntakeLocale): string {
  const t = intakeCopy(locale);
  if (field.kind === "scale")
    return t("scaleLegend", {
      min: field.minLabel[locale],
      max: field.maxLabel[locale],
    });
  return field.label[locale];
}

function display(
  field: IntakeField,
  value: AnswerValue | undefined,
  locale: IntakeLocale,
): string {
  const t = intakeCopy(locale);
  if (
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  )
    return t("notAnswered");
  switch (field.kind) {
    case "choices":
      return (value as readonly string[])
        .map(
          (id) =>
            field.options.find((option) => option.id === id)?.label[locale] ??
            id,
        )
        .join(", ");
    case "confirm":
      return value === true ? t("yes") : t("no");
    case "scale":
      return format("{value} / 5", { value: String(value) });
    default:
      return String(value);
  }
}

/** Read-only answers, page by page: each answer under its question, two to a row from tablet width. */
export function AnswerSheet({
  questionnaire,
  answers,
  locale,
}: {
  questionnaire: Questionnaire;
  answers: Answers;
  locale: IntakeLocale;
}) {
  return (
    <>
      {questionnaire.pages
        .filter((page) => isVisible(page, answers))
        .map((page) => (
          <Section
            key={page.id}
            spacing="none"
            aria-labelledby={`answers-${page.id}`}
          >
            <FlexBox direction="column" gap="var(--space-internal-16)">
              <Divider />
              <Title level={2} size="s" id={`answers-${page.id}`}>
                {page.title[locale]}
              </Title>
              {page.sections
                .filter((section) => isVisible(section, answers))
                .map((section) => (
                  <FlexBox
                    key={section.id}
                    direction="column"
                    gap="var(--space-internal-12)"
                  >
                    <Title level={3} size="xs">
                      {section.title[locale]}
                    </Title>
                    <Grid
                      columns={1}
                      tabletColumns={2}
                      gap="var(--space-internal-16)"
                    >
                      {section.fields.filter(isInputField).map((field) => (
                        <FlexBox
                          key={field.id}
                          direction="column"
                          gap="var(--space-internal-4)"
                        >
                          <Text as="span" size="s">
                            {label(field, locale)}
                          </Text>
                          <Text as="span">
                            {display(field, answers[field.id], locale)}
                          </Text>
                        </FlexBox>
                      ))}
                    </Grid>
                  </FlexBox>
                ))}
            </FlexBox>
          </Section>
        ))}
    </>
  );
}
