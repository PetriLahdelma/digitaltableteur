"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Accordion,
  AlertBanner,
  Button,
  ConfirmPopover,
  Divider,
  FlexBox,
  Grid,
  Link,
  List,
  Section,
  Text,
  Title,
} from "@digitaltableteur/react";
import TaskList, { type TaskListStatus, type TaskListTask } from "@dt/TaskList";

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
  IntakePage,
  IntakeSection,
  Questionnaire,
} from "@/app/lib/intake/types";
import { useMediaQuery } from "@/nextjs-app/shared/hooks/useMediaQuery";

import { AnswerSummary, answerLabel, sentenceCase } from "./AnswerSummary";
import { postJson } from "./api";
import { IntakeField, fieldAnchor } from "./IntakeField";

const AUTOSAVE_DELAY_MS = 1500;
const REVIEW = "check-and-submit";

type SaveState =
  "idle" | "saving" | "saved" | "failed" | "conflict" | "signed_out";

type Step = Readonly<{
  page: IntakePage;
  section: IntakeSection;
  indexInPage: number;
  sectionsInPage: number;
}>;

function isEmpty(value: AnswerValue | undefined): boolean {
  return (
    value === undefined ||
    value === false ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0)
  );
}

/** Every section the client can currently see, in order: one screen each. */
function visibleSteps(questionnaire: Questionnaire, answers: Answers): Step[] {
  return questionnaire.pages
    .filter((page) => isVisible(page, answers))
    .flatMap((page) => {
      const sections = page.sections.filter((section) =>
        isVisible(section, answers),
      );
      return sections.map((section, indexInPage) => ({
        page,
        section,
        indexInPage,
        sectionsInPage: sections.length,
      }));
    });
}

/** Consecutive half-width fields share a responsive row; wide fields take a row each. */
function fieldRows(section: IntakeSection): Field[][] {
  const rows: Field[][] = [];
  for (const field of section.fields) {
    const last = rows.at(-1);
    if (field.width === "half" && last && last[0].width === "half")
      last.push(field);
    else rows.push([field]);
  }
  return rows;
}

/**
 * The questionnaire as a task list (GOV.UK "complete multiple tasks"): a
 * rail of parts with their status beside one short screen per section.
 * Answers autosave 1.5 s after the last change and on every step change;
 * each save carries the revision it was based on, so a second tab cannot
 * silently overwrite newer answers.
 */
export function IntakeForm({
  inviteId,
  questionnaire,
  locale,
  copy,
  initialAnswers,
  initialRevision,
  initialCompleted,
}: {
  inviteId: string;
  questionnaire: Questionnaire;
  locale: IntakeLocale;
  copy: IntakeCopyTable;
  initialAnswers: Answers;
  initialRevision: number;
  initialCompleted: string[];
}) {
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({
    ...initialAnswers,
  });
  const [completed, setCompleted] = useState<string[]>(initialCompleted);
  const steps = useMemo(
    () => visibleSteps(questionnaire, answers),
    [questionnaire, answers],
  );
  const [current, setCurrent] = useState<string>(() => {
    const firstOpen = steps.find(
      (step) => !initialCompleted.includes(step.page.id),
    );
    return (firstOpen ?? steps[0]).section.id;
  });
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [summaryAttempt, setSummaryAttempt] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const narrow = useMediaQuery("(width < 64rem)");

  const revision = useRef(initialRevision);
  const latest = useRef({ answers, completed });
  // Pre-filled answers (name and email from the invite) exist only here until saved.
  const dirty = useRef(
    initialRevision === 0 && Object.keys(initialAnswers).length > 0,
  );
  const inFlight = useRef<Promise<boolean> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusAfterRender = useRef<string | null>(null);

  // Resume on the step in the URL, so a reload lands where the client was.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("step");
    if (
      fromUrl &&
      (fromUrl === REVIEW || steps.some((step) => step.section.id === fromUrl))
    )
      setCurrent(fromUrl);
    // Only on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = useCallback(async (): Promise<boolean> => {
    if (inFlight.current) await inFlight.current;
    if (!dirty.current) return true;
    dirty.current = false;
    setSaveState("saving");
    const run = (async () => {
      const { httpStatus, data } = await postJson(
        `/api/intake/forms/${inviteId}/draft`,
        {
          revision: revision.current,
          answers: latest.current.answers,
          completedParts: latest.current.completed,
        },
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

  /** Applies answer changes and schedules a save; undefined removes an answer. */
  const updateMany = useCallback(
    (changes: Record<string, AnswerValue | undefined>) => {
      setAnswers((previous) => {
        const next = { ...previous };
        for (const [fieldId, value] of Object.entries(changes)) {
          if (value === undefined) delete next[fieldId];
          else next[fieldId] = value;
        }
        latest.current = { ...latest.current, answers: next };
        return next;
      });
      setErrors((previous) => {
        if (!Object.keys(changes).some((fieldId) => previous[fieldId]))
          return previous;
        const rest = { ...previous };
        for (const fieldId of Object.keys(changes)) delete rest[fieldId];
        return rest;
      });
      dirty.current = true;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void save(), AUTOSAVE_DELAY_MS);
    },
    [save],
  );
  const update = useCallback(
    (fieldId: string, value: AnswerValue) => updateMany({ [fieldId]: value }),
    [updateMany],
  );

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

  // After a step change, focus the new heading (or the field an error link points at).
  useEffect(() => {
    const target = focusAfterRender.current;
    if (!target) return;
    focusAfterRender.current = null;
    const element = document.getElementById(target);
    const focusable = element?.matches("h1")
      ? element
      : element?.querySelector<HTMLElement>(
          "input, textarea, select, button, [tabindex]",
        );
    focusable?.focus();
    if (element?.matches("h1")) window.scrollTo({ top: 0 });
  }, [current]);

  function goTo(stepId: string, focusId = "intake-step-title") {
    void flush();
    focusAfterRender.current = focusId;
    setCurrent(stepId);
    const url = new URL(window.location.href);
    url.searchParams.set("step", stepId);
    window.history.replaceState(
      null,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }

  function markCompleted(pageId: string) {
    if (latest.current.completed.includes(pageId)) return;
    const next = [...latest.current.completed, pageId];
    latest.current = { ...latest.current, completed: next };
    setCompleted(next);
    dirty.current = true;
  }

  const stepIndex = steps.findIndex(
    (candidate) => candidate.section.id === current,
  );
  const step = stepIndex >= 0 ? steps[stepIndex] : null;
  const nextStep = stepIndex >= 0 ? steps[stepIndex + 1] : undefined;
  const firstPageId = steps[0]?.page.id;
  const canReview = firstPageId ? completed.includes(firstPageId) : false;

  function continueFrom(from: Step) {
    if (from.indexInPage === from.sectionsInPage - 1)
      markCompleted(from.page.id);
    const next = steps[steps.indexOf(from) + 1];
    goTo(next ? next.section.id : REVIEW);
  }

  /** Empties the answers on this screen, after the person confirms. */
  function clearStep(from: Step) {
    updateMany(
      Object.fromEntries(
        from.section.fields
          .filter(isInputField)
          .map((field) => [field.id, undefined]),
      ),
    );
  }

  function goBack() {
    if (current === REVIEW) goTo(steps[steps.length - 1].section.id);
    else if (stepIndex > 0) goTo(steps[stepIndex - 1].section.id);
  }

  function goToField(fieldId: string) {
    const target = steps.find((candidate) =>
      candidate.section.fields.some((field) => field.id === fieldId),
    );
    if (target) goTo(target.section.id, fieldAnchor(fieldId));
  }

  function showProblems(fieldIds: string[]) {
    setErrors(
      Object.fromEntries(fieldIds.map((id) => [id, copy.requiredError])),
    );
    setSummaryAttempt((attempt) => attempt + 1);
  }

  async function submit() {
    const missing = visibleFields(questionnaire, answers)
      .filter(
        (field) => field.required === "submit" && isEmpty(answers[field.id]),
      )
      .map((field) => field.id);
    if (missing.length > 0) {
      showProblems(missing);
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
      { revision: revision.current, locale },
    );
    if (httpStatus === 200 && typeof data.submissionId === "string") {
      window.location.assign(`/intake/submissions/${data.submissionId}`);
      return;
    }
    setSubmitting(false);
    if (httpStatus === 422 && Array.isArray(data.fields))
      showProblems(data.fields as string[]);
    else if (httpStatus === 409) setSaveState("conflict");
    else if (httpStatus === 401) setSaveState("signed_out");
    else setSaveState("failed");
  }

  // The rail: one task per visible part, then check and submit.
  const pages = questionnaire.pages.filter((page) => isVisible(page, answers));
  const partStatus = (page: IntakePage): TaskListStatus => {
    if (completed.includes(page.id)) return "completed";
    const answered = page.sections.some((section) =>
      section.fields.some(
        (field) => isInputField(field) && !isEmpty(answers[field.id]),
      ),
    );
    return answered ? "inProgress" : "notStarted";
  };
  const tasks: TaskListTask[] = [
    ...pages.map((page, index) => {
      const pageSteps = steps.filter(
        (candidate) => candidate.page.id === page.id,
      );
      const currentIndex = pageSteps.findIndex(
        (candidate) => candidate.section.id === current,
      );
      return {
        id: page.id,
        label: page.title[locale],
        hint: index === 0 ? copy.neededBeforeCall : undefined,
        status: partStatus(page),
        steps: pageSteps.map((candidate, sectionIndex) => ({
          id: candidate.section.id,
          label: sentenceCase(candidate.section.title[locale]),
          done:
            completed.includes(page.id) ||
            (currentIndex >= 0 && sectionIndex < currentIndex),
        })),
      };
    }),
    {
      id: REVIEW,
      label: copy.checkAndSubmit,
      status: canReview ? "notStarted" : "cannotStart",
    },
  ];
  const rail = (
    <TaskList
      label={copy.partsLabel}
      tasks={tasks}
      currentTaskId={current === REVIEW ? REVIEW : step?.page.id}
      currentStepId={current === REVIEW ? undefined : current}
      statusLabels={{
        notStarted: copy.statusNotStarted,
        inProgress: copy.statusInProgress,
        completed: copy.statusCompleted,
        cannotStart: copy.statusAfterFirstPart,
      }}
      onSelect={(taskId, sectionId) => {
        if (taskId === REVIEW) return goTo(REVIEW);
        const first = steps.find((candidate) => candidate.page.id === taskId);
        goTo(sectionId ?? first?.section.id ?? current);
      }}
    />
  );

  const fieldsById = useMemo(
    () =>
      new Map(
        questionnaire.pages
          .flatMap((page) => page.sections.flatMap((section) => section.fields))
          .map((field) => [field.id, field]),
      ),
    [questionnaire],
  );
  const errorIds = Object.keys(errors);
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

  const alerts = (
    <>
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
                      {field ? answerLabel(field, locale) : id}
                    </Link>
                  );
                })}
              />
            </>
          }
        />
      ) : null}
    </>
  );

  const backButton =
    current !== REVIEW && stepIndex <= 0 ? null : (
      <Button variant="secondary" size="lg" icon="arrow-left" onClick={goBack}>
        {copy.back}
      </Button>
    );

  const saveStatus = (
    <Text as="span" size="s" role="status" aria-live="polite">
      {statusText}
    </Text>
  );

  const content =
    current === REVIEW || !step ? (
      <FlexBox direction="column" gap="var(--space-internal-24)">
        {alerts}
        <Title level={1} size="m" id="intake-step-title" tabIndex={-1}>
          {copy.checkAndSubmit}
        </Title>
        <Text>{copy.checkIntro}</Text>
        <AnswerSummary
          questionnaire={questionnaire}
          answers={answers}
          locale={locale}
          onChange={(sectionId) => goTo(sectionId)}
        />
        <Divider />
        <FlexBox
          direction="row"
          justify="space-between"
          align="baseline"
          gap="var(--space-internal-16)"
          wrap="wrap"
        >
          <Text size="s">{copy.submitHint}</Text>
          {saveStatus}
        </FlexBox>
        <FlexBox
          direction="row"
          align="center"
          justify="flex-end"
          gap="var(--space-internal-16)"
          wrap="wrap"
        >
          {backButton}
          <Button size="lg" onClick={submit} loading={submitting}>
            {copy.submit}
          </Button>
        </FlexBox>
      </FlexBox>
    ) : (
      <FlexBox direction="column" gap="var(--space-internal-24)">
        {alerts}
        <FlexBox direction="column" gap="var(--space-internal-8)">
          <FlexBox
            direction="row"
            justify="space-between"
            align="baseline"
            gap="var(--space-internal-16)"
            wrap="wrap"
          >
            <Text size="s">
              {format(copy.sectionCaption, {
                part: step.page.title[locale],
                n: step.indexInPage + 1,
                total: step.sectionsInPage,
              })}
            </Text>
            {saveStatus}
          </FlexBox>
          <Title level={1} size="m" id="intake-step-title" tabIndex={-1}>
            {sentenceCase(step.section.title[locale])}
          </Title>
        </FlexBox>
        {step.indexInPage === 0 ? <Text>{step.page.intro[locale]}</Text> : null}
        {step.section.description ? (
          <Text size="s">{step.section.description[locale]}</Text>
        ) : null}
        {/* Fields carry about 24px of space below themselves (label, margins,
            room for a helper line), so rows only add a small gap. */}
        <FlexBox direction="column" gap="var(--space-internal-8)">
          {fieldRows(step.section).map((row) =>
            row[0].width === "half" ? (
              <Grid
                key={row[0].id}
                columns={1}
                tabletColumns={2}
                rowGap="var(--space-internal-8)"
                colGap="var(--space-internal-24)"
              >
                {row.map(renderField)}
              </Grid>
            ) : (
              renderField(row[0])
            ),
          )}
        </FlexBox>
        {step.section.closing ? (
          <Text size="s">{step.section.closing[locale]}</Text>
        ) : null}
        {step.indexInPage === step.sectionsInPage - 1 && step.page.closing ? (
          <Text size="s">{step.page.closing[locale]}</Text>
        ) : null}
        <FlexBox
          direction="row"
          align="center"
          justify="space-between"
          gap="var(--space-internal-16)"
          wrap="wrap"
        >
          <ConfirmPopover
            title={copy.clearSectionTitle}
            description={copy.clearSectionDescription}
            confirmLabel={copy.clearSection}
            cancelLabel={copy.cancel}
            tone="error"
            onConfirm={() => clearStep(step)}
          >
            <Button
              variant="tertiary"
              size="lg"
              disabled={step.section.fields.every(
                (field) => !isInputField(field) || isEmpty(answers[field.id]),
              )}
            >
              {copy.clearSection}
            </Button>
          </ConfirmPopover>
          <FlexBox
            direction="row"
            align="center"
            justify="flex-end"
            gap="var(--space-internal-16)"
            wrap="wrap"
          >
            {backButton}
            <Button size="lg" onClick={() => continueFrom(step)}>
              {format(copy.continueTo, {
                next: nextStep
                  ? sentenceCase(nextStep.section.title[locale])
                  : copy.checkAndSubmit,
              })}
            </Button>
          </FlexBox>
        </FlexBox>
      </FlexBox>
    );

  if (narrow) {
    return (
      <FlexBox direction="column" gap="var(--space-internal-24)">
        <Accordion
          items={[
            {
              id: "parts",
              title: `${copy.partsLabel}: ${questionnaire.title[locale]}`,
              content: rail,
            },
          ]}
          variant="divided"
        />
        {content}
      </FlexBox>
    );
  }

  // Check and submit takes the full width, as GOV.UK's "Check your answers"
  // does: every section has its own Change link, so the rail adds nothing.
  if (current === REVIEW) return content;

  return (
    <Grid
      columns="minmax(14rem, 15rem) minmax(0, 1fr)"
      gap="var(--space-layout-48)"
      align="start"
    >
      <FlexBox direction="column" gap="var(--space-internal-16)">
        <Text size="s">{questionnaire.title[locale]}</Text>
        {rail}
      </FlexBox>
      {content}
    </Grid>
  );
}
