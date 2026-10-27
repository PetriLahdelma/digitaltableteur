"use client";

import { useEffect, useState } from "react";
import {
  AlertBanner,
  Button,
  FlexBox,
  Link,
  Text,
} from "@digitaltableteur/react";

import type { IntakeCopyTable } from "@/app/lib/intake/copy";
import type { IntakeLocale } from "@/app/lib/intake/types";

import { postJson } from "./api";
import { IntakeColumns } from "./IntakePage";
import { PrivacyNotice } from "./PrivacyNotice";
import { CodeStep } from "./CodeStep";

const TOKEN = /^[A-Za-z0-9_-]{43}$/;

/**
 * The invite link's landing page. The token sits in the URL fragment, which
 * browsers never send to a server; nothing happens until the client presses
 * Continue, so link scanners that open the page change nothing.
 */
export function InviteFlow({
  copy,
  locale,
}: {
  copy: IntakeCopyTable;
  locale: IntakeLocale;
}) {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [step, setStep] = useState<"landing" | "code" | "invalid">("landing");
  const [problem, setProblem] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const value = new URLSearchParams(window.location.hash.slice(1)).get("t");
    setToken(value && TOKEN.test(value) ? value : null);
  }, []);

  async function proceed() {
    if (!token) return;
    setBusy(true);
    const { httpStatus } = await postJson("/api/intake/auth/invite", { token });
    setBusy(false);
    if (httpStatus === 200) setStep("code");
    else if (httpStatus === 410 || httpStatus === 400) setStep("invalid");
    else setProblem(httpStatus === 429 ? copy.rateLimited : copy.genericError);
  }

  if (step === "code")
    return (
      <CodeStep
        copy={copy}
        intro={copy.codeSentTo}
        onRestart={() => setStep("landing")}
      />
    );

  const signInLink = (
    <Button href={`/intake?lang=${locale}`} variant="secondary">
      {copy.signInWithEmail}
    </Button>
  );

  if (step === "invalid" || token === null) {
    return (
      <IntakeColumns title={copy.inviteTitle}>
        <AlertBanner
          tone={step === "invalid" ? "warning" : "info"}
          description={
            step === "invalid" ? copy.inviteInvalid : copy.inviteMissing
          }
          focusOnMount={step === "invalid"}
        />
        <FlexBox direction="row">{signInLink}</FlexBox>
      </IntakeColumns>
    );
  }

  return (
    <IntakeColumns title={copy.inviteTitle} intro={copy.inviteIntro}>
      <PrivacyNotice copy={copy} locale={locale} />
      {problem ? (
        <AlertBanner tone="error" description={problem} focusOnMount />
      ) : null}
      <FlexBox direction="row">
        <Button onClick={proceed} loading={busy} disabled={!token}>
          {copy.continue}
        </Button>
      </FlexBox>
    </IntakeColumns>
  );
}
