"use client";

import { useEffect, useRef, useState } from "react";
import { AlertBanner, Button, FlexBox, RadioGroup, Select, Text, TextArea, TextInput, Title } from "@digitaltableteur/react";
import SummaryList from "@dt/SummaryList";

import { adminCopy } from "@/app/lib/intake/admin-copy";
import type { IntakeLocale } from "@/app/lib/intake/types";

import { postJson } from "../../_components/api";
import { EmailPreview } from "./EmailPreview";

type Form = { name: string; email: string; questionnaireId: string; locale: IntakeLocale; note: string };
type Preview = { subject: string; html: string };

const LANGUAGE_NAMES: Record<IntakeLocale, string> = { en: "English", fi: "Suomi", sv: "Svenska" };

/** New invite: fill in, check the email exactly as the client will get it, send. */
export function InviteForm({
  locale,
  questionnaires,
  languages,
}: {
  locale: IntakeLocale;
  questionnaires: { id: string; title: string }[];
  languages: readonly IntakeLocale[];
}) {
  const t = adminCopy(locale);
  const [form, setForm] = useState<Form>({ name: "", email: "", questionnaireId: questionnaires[0]?.id ?? "", locale: "fi", note: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [preview, setPreview] = useState<Preview | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const previewHeading = useRef<HTMLHeadingElement>(null);
  const formTop = useRef<HTMLFormElement>(null);
  const shown = useRef(false);

  // Each view replaces the other, taking the pressed button with it: focus
  // goes to the preview's heading, and back to the first field on Edit.
  useEffect(() => {
    if (preview) previewHeading.current?.focus();
    else if (shown.current) formTop.current?.querySelector("input")?.focus();
    shown.current = true;
  }, [preview]);

  const set = (key: keyof Form) => (value: string) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  };

  function payload() {
    return { ...form, name: form.name.trim(), email: form.email.trim(), note: form.note.trim() || undefined };
  }

  function invalid(fields: unknown) {
    const list = Array.isArray(fields) ? (fields as string[]) : [];
    // A filled email that was refused is malformed, not missing.
    setErrors(Object.fromEntries(list.map((field) => [field, field === "email" && form.email.trim() ? t("invalidEmail") : t("required")])));
    setProblem(t("invalid"));
  }

  async function showPreview() {
    setBusy(true);
    setProblem(null);
    const { httpStatus, data } = await postJson("/api/intake/admin/invites/preview", payload());
    setBusy(false);
    if (httpStatus === 200) setPreview({ subject: String(data.subject), html: String(data.html) });
    else if (httpStatus === 422) invalid(data.fields);
    else setProblem(t("genericError"));
  }

  async function send() {
    setBusy(true);
    setProblem(null);
    const { httpStatus, data } = await postJson("/api/intake/admin/invites", payload());
    if (httpStatus === 200 && typeof data.inviteId === "string") {
      window.location.assign(`/intake/admin/intakes/${data.inviteId}?sent=1${data.status === "mail_failed" ? "&mail=failed" : ""}`);
      return;
    }
    setBusy(false);
    if (httpStatus === 409) setProblem(t("exists", { email: form.email.trim() }));
    else if (httpStatus === 422) {
      setPreview(null);
      invalid(data.fields);
    } else setProblem(t("genericError"));
  }

  if (preview) {
    return (
      <FlexBox direction="column" gap="var(--space-internal-24)">
        <Title level={2} size="s" ref={previewHeading} tabIndex={-1}>
          {t("previewTitle")}
        </Title>
        {problem ? <AlertBanner tone="error" description={problem} focusOnMount /> : null}
        <SummaryList
          rows={[
            { id: "to", label: t("previewTo"), value: `${form.name.trim()} <${form.email.trim()}>` },
            { id: "subject", label: t("previewSubject"), value: preview.subject },
          ]}
        />
        <EmailPreview html={preview.html} title={preview.subject} />
        <Text size="s">{t("previewLinkNote")}</Text>
        <FlexBox direction="row" justify="flex-end" gap="var(--space-internal-16)" wrap="wrap">
          <Button size="lg" variant="secondary" icon="pencil" onClick={() => setPreview(null)}>
            {t("edit")}
          </Button>
          <Button size="lg" icon="paper-plane-tilt" loading={busy} onClick={() => void send()}>
            {t("send")}
          </Button>
        </FlexBox>
      </FlexBox>
    );
  }

  return (
    <form
      ref={formTop}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void showPreview();
      }}
    >
      <FlexBox direction="column" gap="var(--space-internal-24)">
        {problem ? <AlertBanner tone="error" description={problem} focusOnMount /> : null}
        <TextInput size="lg" type="text" label={t("fieldName")} value={form.name} onValueChange={(value) => set("name")(String(value))} error={errors.name} required autoComplete="off" />
        <TextInput size="lg" width="30ch" type="email" label={t("fieldEmail")} value={form.email} onValueChange={(value) => set("email")(String(value))} error={errors.email} required autoComplete="off" />
        <Select
          size="lg"
          label={t("fieldForm")}
          value={form.questionnaireId}
          onValueChange={set("questionnaireId")}
          options={questionnaires.map((questionnaire) => ({ value: questionnaire.id, label: questionnaire.title }))}
          error={errors.questionnaireId}
        />
        <RadioGroup
          legend={t("fieldLanguage")}
          orientation="horizontal"
          value={form.locale}
          onValueChange={set("locale")}
          options={languages.map((code) => ({ value: code, label: LANGUAGE_NAMES[code] }))}
          error={errors.locale}
        />
        <TextArea label={t("fieldNote")} helperText={t("fieldNoteHelp")} value={form.note} onChange={set("note")} minRows={3} maxLength={600} />
        <FlexBox direction="row" justify="flex-end">
          <Button size="lg" icon="eye" submits loading={busy}>
            {t("preview")}
          </Button>
        </FlexBox>
      </FlexBox>
    </form>
  );
}
