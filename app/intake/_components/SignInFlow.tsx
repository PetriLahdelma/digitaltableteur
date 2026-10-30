"use client";

import { useState, type FormEvent } from "react";
import {
  AlertBanner,
  Button,
  FlexBox,
  Link,
  Text,
  TextInput,
} from "@digitaltableteur/react";

import type { IntakeCopyTable } from "@/app/lib/intake/copy";
import type { IntakeLocale } from "@/app/lib/intake/types";

import { postJson } from "./api";
import { CodeStep } from "./CodeStep";
import { IntakeColumns } from "./IntakePage";
import { PrivacyNotice } from "./PrivacyNotice";

/** Returning clients: email address, then the emailed code. No password anywhere. */
export function SignInFlow({
  copy,
  locale,
}: {
  copy: IntakeCopyTable;
  locale: IntakeLocale;
}) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [problem, setProblem] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(copy.invalidError);
      return;
    }
    setBusy(true);
    const { httpStatus } = await postJson("/api/intake/auth/email", {
      email: email.trim(),
      locale,
    });
    setBusy(false);
    if (httpStatus === 200) setStep("code");
    else if (httpStatus === 400) setError(copy.invalidError);
    else setProblem(httpStatus === 429 ? copy.rateLimited : copy.genericError);
  }

  if (step === "code")
    return (
      <CodeStep
        copy={copy}
        intro={copy.codeSentGeneric}
        onRestart={() => setStep("email")}
      />
    );

  return (
    <IntakeColumns title={copy.signInTitle} intro={copy.signInIntro}>
      <form onSubmit={submit} noValidate>
        <FlexBox direction="column" gap="var(--space-internal-24)">
          <PrivacyNotice copy={copy} locale={locale} />
          {problem ? (
            <AlertBanner tone="error" description={problem} focusOnMount />
          ) : null}
          <TextInput
            width="30ch"
            label={copy.emailLabel}
            type="email"
            autoComplete="email"
            value={email}
            onValueChange={(value) => {
              setEmail(String(value));
              setError(undefined);
            }}
            error={error}
          />
          <FlexBox direction="row">
            <Button submits loading={busy}>
              {copy.sendCode}
            </Button>
          </FlexBox>
        </FlexBox>
      </form>
    </IntakeColumns>
  );
}
