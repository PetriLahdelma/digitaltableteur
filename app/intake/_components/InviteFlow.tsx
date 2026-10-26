"use client";

import { useEffect, useState } from "react";
import { AlertBanner, Button, Link, Text, Title } from "@digitaltableteur/react";

import type { IntakeCopyTable } from "@/app/lib/intake/copy";
import type { IntakeLocale } from "@/app/lib/intake/types";

import { postJson } from "./api";
import { CodeStep } from "./CodeStep";
import styles from "./intake.module.css";

const TOKEN = /^[A-Za-z0-9_-]{43}$/;

/**
 * The invite link's landing page. The token sits in the URL fragment, which
 * browsers never send to a server; nothing happens until the client presses
 * Continue, so link scanners that open the page change nothing.
 */
export function InviteFlow({ copy, locale }: { copy: IntakeCopyTable; locale: IntakeLocale }) {
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

  if (step === "code") return <CodeStep copy={copy} intro={copy.codeSentTo} onRestart={() => setStep("landing")} />;

  const signInLink = (
    <Button href={`/intake?lang=${locale}`} variant="secondary">
      {copy.signInWithEmail}
    </Button>
  );

  return (
    <div className={styles.narrow}>
      <Title level={1} size="l">
        {copy.inviteTitle}
      </Title>
      {step === "invalid" ? (
        <>
          <AlertBanner tone="warning" description={copy.inviteInvalid} focusOnMount />
          <span className={styles.actions}>{signInLink}</span>
        </>
      ) : token === null ? (
        <>
          <AlertBanner tone="info" description={copy.inviteMissing} />
          <span className={styles.actions}>{signInLink}</span>
        </>
      ) : (
        <>
          <Text>{copy.inviteIntro}</Text>
          {problem ? <AlertBanner tone="error" description={problem} focusOnMount /> : null}
          <Text size="s">
            <Link href={`/intake/privacy?lang=${locale}`}>{copy.privacyBeforeCode}</Link>
          </Text>
          <span className={styles.actions}>
            <Button onClick={proceed} loading={busy} disabled={!token}>
              {copy.continue}
            </Button>
          </span>
        </>
      )}
    </div>
  );
}
