"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertBanner,
  Button,
  Divider,
  FlexBox,
  Grid,
  Link,
  List,
  Pagination,
  Section,
  Text,
  Title,
} from "@digitaltableteur/react";

import { format, type IntakeCopyTable } from "@/app/lib/intake/copy";
import {
  isInputField,
  isVisible,
  visibleFields,
} from "@/app/lib/intake/schema";
import type {
  AnswerValue,
  Answers,
  IntakeField as Field,
  IntakeLocale,
  IntakeSection,
  Questionnaire,
} from "@/app/lib/intake/types";

import { postJson } from "./api";
import { IntakeField, fieldAnchor, isWideField } from "./IntakeField";
import { IntakeToolbar } from "./IntakePage";

const AUTOSAVE_DELAY_MS = 1500;

type SaveState =
  "idle" | "saving" | "saved" | "failed" | "conflict" | "signed_out";

function isEmpty(value: AnswerValue | undefined): boolean {
  return (
    value === undefined ||
    value === false ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0)
  );
}

function fieldLabel(
  field: Field,
  locale: IntakeLocale,
  copy: IntakeCopyTable,
): string {
  if (field.kind === "scale")
    return format(copy.scaleLegend, {
      min: field.minLabel[locale],
      max: field.maxLabel[locale],
    });
  return field.label[locale];
}

/** Consecutive half-width fields share a two-column row; wide fields stand alone. */
function fieldRows(section: IntakeSection): Field[][] {
  const rows: Field[][] = [];
  for (const field of section.fields) {
    const last = rows.at(-1);
    if (!isWideField(field) && last && !isWideField(last[0]) && last.length < 2)
      last.push(field);
    else rows.push([field]);
  }
  return rows;
}

/**
 * The questionnaire, one page at a time. Answers autosave 1.5 s after the
 * last change and on every page change; each save carries the revision it
 * was based on, so a second tab cannot silently overwrite newer answers.
 */
export function IntakeForm({
  inviteId,
  questionnaire,
  locale,
  copy,
  initialAnswers,
  initialRevision,
}: {
  inviteId: string;
  questionnaire: Questionnaire;
  locale: IntakeLocale;
  copy: IntakeCopyTable;
  initialAnswers: Answers;
  initialRevision: number;
}) {
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({
    ...initialAnswers,
  });
  const [pageIndex, setPageIndex] = useState(0);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Bumped on every failed submit, so the summary re-mounts and takes focus again.
  const [summaryAttempt, setSummaryAttempt] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const revision = useRef(initialRevision);
  const latest = useRef(answers);
  const dirty = useRef(false);
  const inFlight = useRef<Promise<boolean> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusAfterRender = useRef<string | null>(null);

  const pages = useMemo(
    () => questionnaire.pages.filter((page) => isVisible(page, answers)),
    [questionnaire, answers],
  );
  const page = pages[Math.min(pageIndex, pages.length - 1)];

  const save = useCallback(async (): Promise<boolean> => {
    if (inFlight.current) await inFlight.current;
    if (!dirty.current) return true;
    dirty.current = false;
    setSaveState("saving");
    const run = (async () => {
      const { httpStatus, data } = await postJson(
        `/api/intake/forms/${inviteId}/draft`,
        { revision: revision.current, answers: latest.current },
        "PUT",
      );
      if (httpStatus === 200 && typeof data.revision === "number") {
        revision.current = data.revision;
        setSaveState(dirty.current ? "saving" : "saved");
        return true;
      }
      if (httpStatus === 409) setSaveState("conflict");
      else if (httpStatus === 401) setSaveState("signed_out");
      else {
        dirty.current = true;
        setSaveState("failed");
      }
      return false;
    })();
    inFlight.current = run;
    const ok = await run;
    inFlight.current = null;
    return ok;
  }, [inviteId]);

  const flush = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    return save();
  }, [save]);

  const update = useCallback(
    (fieldId: string, value: AnswerValue) => {
      setAnswers((current) => {
        const next = { ...current, [fieldId]: value };
        latest.current = next;
        return next;
      });
      setErrors((current) => {
        if (!current[fieldId]) return current;
        const { [fieldId]: _removed, ...rest } = current;
        return rest;
      });
      dirty.current = true;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void save(), AUTOSAVE_DELAY_MS);
    },
    [save],
  );

  // Retry failed saves, and save before the tab closes.
  useEffect(() => {
    if (saveState !== "failed") return undefined;
    const retry = setTimeout(() => void save(), 5000);
    return () => clearTimeout(retry);
  }, [saveState, save]);
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (dirty.current) {
        void flush();
        event.preventDefault();
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [flush]);

  // After a page change, move focus to the page heading or the field a summary link points at.
  useEffect(() => {
    const target = focusAfterRender.current;
    if (!target) return;
    focusAfterRender.current = null;
    const element = document.getElementById(target);
    const focusable = element?.matches("h2")
      ? element
      : element?.querySelector<HTMLElement>(
          "input, textarea, button, [tabindex]",
        );
    focusable?.focus();
    if (element?.matches("h2")) window.scrollTo({ top: 0 });
  }, [pageIndex, page]);

  async function goToPage(index: number) {
    void flush();
    focusAfterRender.current = "intake-page-title";
    setPageIndex(index);
  }

  function goToField(fieldId: string) {
    const index = pages.findIndex((candidate) =>
      candidate.sections.some(
        (section) =>
          isVisible(section, answers) &&
          section.fields.some((field) => field.id === fieldId),
      ),
    );
    focusAfterRender.current = fieldAnchor(fieldId);
    if (index >= 0 && index !== pageIndex) setPageIndex(index);
    else {
      const element = document.getElementById(fieldAnchor(fieldId));
      element?.querySelector<HTMLElement>("input, textarea, button")?.focus();
      focusAfterRender.current = null;
    }
  }

  function missingRequired(): string[] {
    return visibleFields(questionnaire, answers)
      .filter(
        (field) => field.required === "submit" && isEmpty(answers[field.id]),
      )
      .map((field) => field.id);
  }

  function showProblems(fieldIds: string[], message: string) {
    setErrors(Object.fromEntries(fieldIds.map((id) => [id, message])));
    setSummaryAttempt((attempt) => attempt + 1);
  }

  async function submit() {
    const missing = missingRequired();
    if (missing.length > 0) {
      showProblems(missing, copy.requiredError);
      return;
    }
    setSubmitting(true);
    const saved = await flush();
    if (!saved && dirty.current) {
      setSubmitting(false);
      return;
    }
    const { httpStatus, data } = await postJson(
      `/api/intake/forms/${inviteId}/submit`,
      { revision: revision.current },
    );
    if (httpStatus === 200 && typeof data.submissionId === "string") {
      window.location.assign(`/intake/submissions/${data.submissionId}`);
      return;
    }
    setSubmitting(false);
    if (httpStatus === 422 && Array.isArray(data.fields))
      showProblems(data.fields as string[], copy.requiredError);
    else if (httpStatus === 409) setSaveState("conflict");
    else if (httpStatus === 401) setSaveState("signed_out");
    else setSaveState("failed");
  }

  const fieldsById = useMemo(
    () =>
      new Map(
        questionnaire.pages
          .flatMap((p) => p.sections.flatMap((s) => s.fields))
          .map((field) => [field.id, field]),
      ),
    [questionnaire],
  );
  const errorIds = Object.keys(errors);
  const isLast = pageIndex >= pages.length - 1;
  const statusText =
    saveState === "saving"
      ? copy.saving
      : saveState === "saved"
        ? copy.saved
        : saveState === "failed"
          ? copy.saveFailed
          : "";

  const renderField = (field: Field) => (
    <IntakeField
      key={field.id}
      field={field}
      locale={locale}
      copy={copy}
      value={isInputField(field) ? answers[field.id] : undefined}
      error={errors[field.id]}
      onChange={(value) => update(field.id, value)}
    />
  );

  return (
    <FlexBox direction="column" gap="var(--space-internal-24)">
      <IntakeToolbar
        start={
          <Link href="/intake/forms" size="sm">
            {copy.backToIntakes}
          </Link>
        }
        signOutLabel={copy.signOut}
      />
      <Title level={1} size="l">
        {questionnaire.title[locale]}
      </Title>

      {saveState === "conflict" || saveState === "signed_out" ? (
        <AlertBanner
          tone="warning"
          title={saveState === "conflict" ? copy.conflictTitle : undefined}
          description={
            saveState === "conflict" ? copy.conflictBody : copy.codeExpired
          }
          focusOnMount
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.location.reload()}
            >
              {copy.reload}
            </Button>
          }
        />
      ) : null}

      {summaryAttempt > 0 && errorIds.length > 0 ? (
        <AlertBanner
          key={summaryAttempt}
          tone="error"
          title={copy.errorSummaryTitle}
          focusOnMount
          description={
            <>
              <Text size="s">{copy.errorSummaryIntro}</Text>
              <List
                items={errorIds.map((id) => {
                  const field = fieldsById.get(id);
                  return (
                    <Link
                      key={id}
                      href={`#${fieldAnchor(id)}`}
                      onClick={(event: React.MouseEvent) => {
                        event.preventDefault();
                        goToField(id);
                      }}
                    >
                      {field ? fieldLabel(field, locale, copy) : id}
                    </Link>
                  );
                })}
              />
            </>
          }
        />
      ) : null}

      <Section spacing="none" aria-labelledby="intake-page-title">
        <FlexBox direction="column" gap="var(--space-internal-16)">
          <Text size="xs">{page.part[locale]}</Text>
          <Title level={2} size="m" id="intake-page-title" tabIndex={-1}>
            {page.title[locale]}
          </Title>
          <Text>{page.intro[locale]}</Text>
        </FlexBox>
      </Section>

      {page.sections
        .filter((section) => isVisible(section, answers))
        .map((section) => (
          <Section
            spacing="none"
            key={section.id}
            aria-labelledby={`section-${section.id}`}
          >
            <FlexBox direction="column" gap="var(--space-internal-16)">
              <Divider />
              <Title level={3} size="xs" id={`section-${section.id}`}>
                {section.title[locale]}
              </Title>
              {section.description ? (
                <Text size="s">{section.description[locale]}</Text>
              ) : null}
              {fieldRows(section).map((row) =>
                row.length === 1 && isWideField(row[0]) ? (
                  renderField(row[0])
                ) : (
                  <Grid
                    key={row[0].id}
                    columns={1}
                    tabletColumns={2}
                    gap="var(--space-internal-24)"
                  >
                    {row.map(renderField)}
                  </Grid>
                ),
              )}
              {section.closing ? (
                <Text size="s">{section.closing[locale]}</Text>
              ) : null}
            </FlexBox>
          </Section>
        ))}
      {page.closing ? <Text size="s">{page.closing[locale]}</Text> : null}

      <Divider />
      <FlexBox
        direction="row"
        gap="var(--space-internal-16)"
        justify="space-between"
        align="center"
        wrap="wrap"
      >
        <Text size="s">
          {format(copy.pageOf, { page: pageIndex + 1, total: pages.length })}
        </Text>
        <Text as="span" size="s" role="status" aria-live="polite">
          {statusText}
        </Text>
      </FlexBox>
      <Pagination
        label={copy.pagesLabel}
        currentPage={pageIndex + 1}
        totalPages={pages.length}
        onPageChange={(next: number) => void goToPage(next - 1)}
      />
      {isLast ? (
        <FlexBox direction="column" gap="var(--space-internal-8)">
          <Text size="s">{copy.submitHint}</Text>
          <FlexBox direction="row" gap="var(--space-internal-8)" wrap="wrap">
            <Button onClick={submit} loading={submitting}>
              {copy.submit}
            </Button>
          </FlexBox>
        </FlexBox>
      ) : (
        <FlexBox direction="row" gap="var(--space-internal-8)" wrap="wrap">
          <Button onClick={() => void goToPage(pageIndex + 1)}>
            {copy.nextPage}
          </Button>
        </FlexBox>
      )}
    </FlexBox>
  );
}
