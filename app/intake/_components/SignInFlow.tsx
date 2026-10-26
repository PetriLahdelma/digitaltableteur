"use client";

import { useState, type FormEvent } from "react";
import {
  AlertBanner,
  Button,
  Link,
  FlexBox,
  Text,
  TextInput,
  Title,
} from "@digitaltableteur/react";

import type { IntakeCopyTable } from "@/app/lib/intake/copy";
import type { IntakeLocale } from "@/app/lib/intake/types";

import { postJson } from "./api";
import { CodeStep } from "./CodeStep";

/** Returning clients: email address, then the emailed code. No password anywhere. */
export function SignInFlow({
  copy,
  locale,
  notice,
}: {
  copy: IntakeCopyTable;
  locale: IntakeLocale;
  notice?: string;
}) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
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
    else
      setError(
        httpStatus === 429
          ? copy.rateLimited
          : httpStatus === 400
            ? copy.invalidError
            : copy.genericError,
      );
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
    <form onSubmit={submit} noValidate>
      <FlexBox direction="column" gap="var(--space-internal-16)">
        <Title level={1} size="l">
          {copy.signInTitle}
        </Title>
        {notice ? <AlertBanner tone="info" description={notice} /> : null}
        <Text>{copy.signInIntro}</Text>
        <Text size="s">
          <Link href={`/intake/privacy?lang=${locale}`}>
            {copy.privacyBeforeCode}
          </Link>
        </Text>
        <TextInput
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
        <FlexBox
          direction="row"
          gap="var(--space-internal-8)"
          align="center"
          wrap="wrap"
        >
          <Button submits loading={busy}>
            {copy.sendCode}
          </Button>
        </FlexBox>
      </FlexBox>
    </form>
  );
}
