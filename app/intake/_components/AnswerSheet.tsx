import { Text, Title } from "@digitaltableteur/react";

import { format, intakeCopy } from "@/app/lib/intake/copy";
import { isInputField, isVisible } from "@/app/lib/intake/schema";
import type { AnswerValue, Answers, IntakeField, IntakeLocale, Questionnaire } from "@/app/lib/intake/types";

import styles from "./intake.module.css";

function label(field: IntakeField, locale: IntakeLocale): string {
  const t = intakeCopy(locale);
  if (field.kind === "scale") return t("scaleLegend", { min: field.minLabel[locale], max: field.maxLabel[locale] });
  return field.label[locale];
}

function display(field: IntakeField, value: AnswerValue | undefined, locale: IntakeLocale): string {
  const t = intakeCopy(locale);
  if (value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) return t("notAnswered");
  switch (field.kind) {
    case "choices":
      return (value as readonly string[]).map((id) => field.options.find((option) => option.id === id)?.label[locale] ?? id).join(", ");
    case "confirm":
      return value === true ? t("yes") : t("no");
    case "scale":
      return format("{value} / 5", { value: String(value) });
    default:
      return String(value);
  }
}

/** Read-only answers, page by page, in the language they were given in. */
export function AnswerSheet({ questionnaire, answers, locale }: { questionnaire: Questionnaire; answers: Answers; locale: IntakeLocale }) {
  return (
    <div className={styles.stack}>
      {questionnaire.pages
        .filter((page) => isVisible(page, answers))
        .map((page) => (
          <section key={page.id} className={styles.section} aria-labelledby={`answers-${page.id}`}>
            <Title level={2} size="s" id={`answers-${page.id}`}>
              {page.title[locale]}
            </Title>
            {page.sections
              .filter((section) => isVisible(section, answers))
              .map((section) => (
                <div key={section.id} className={styles.stack}>
                  <Title level={3} size="xs">
                    {section.title[locale]}
                  </Title>
                  <dl className={styles.answers}>
                    {section.fields.filter(isInputField).map((field) => (
                      <div key={field.id} className={styles.answerRow}>
                        <dt className={styles.answerTerm}>
                          <Text as="span" size="s">
                            {label(field, locale)}
                          </Text>
                        </dt>
                        <dd className={styles.answerValue}>
                          <Text as="span">{display(field, answers[field.id], locale)}</Text>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
          </section>
        ))}
    </div>
  );
}
