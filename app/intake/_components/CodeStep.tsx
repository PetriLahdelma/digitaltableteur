"use client";

import { useState, type FormEvent } from "react";
import {
  AlertBanner,
  Button,
  FlexBox,
  TextInput,
} from "@digitaltableteur/react";

import type { IntakeCopyTable } from "@/app/lib/intake/copy";

import { postJson } from "./api";
import { IntakeColumns } from "./IntakePage";

type Problem =
  "codeWrong" | "codeExpired" | "codeLocked" | "codeFormat" | "genericError";

/** Step 3: the 8-digit code. Success lands on the client home with a fresh session. */
export function CodeStep({
  copy,
  intro,
  onRestart,
}: {
  copy: IntakeCopyTable;
  intro: string;
  onRestart: () => void;
}) {
  const [code, setCode] = useState("");
  const [problem, setProblem] = useState<Problem | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const digits = code.replace(/\s+/g, "");
    if (!/^\d{8}$/.test(digits)) {
      setProblem("codeFormat");
      return;
    }
    setBusy(true);
    const { data } = await postJson("/api/intake/auth/code", { code: digits });
    if (data.status === "ok") {
      window.location.assign("/intake/forms");
      return;
    }
    setBusy(false);
    setProblem(
      data.status === "wrong"
        ? "codeWrong"
        : data.status === "expired"
          ? "codeExpired"
          : data.status === "locked"
            ? "codeLocked"
            : "genericError",
    );
  }

  const mustRestart = problem === "codeExpired" || problem === "codeLocked";
  return (
    <IntakeColumns title={copy.codeTitle} intro={intro}>
      <form onSubmit={submit} noValidate>
        <FlexBox direction="column" gap="var(--space-internal-24)">
          {mustRestart ? (
            <AlertBanner
              tone="warning"
              description={copy[problem]}
              focusOnMount
              action={
                <Button variant="secondary" onClick={onRestart}>
                  {copy.requestNewCode}
                </Button>
              }
            />
          ) : null}
          <TextInput
            size="lg"
            width="10ch"
            label={copy.codeLabel}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={9}
            value={code}
            onValueChange={(value) => {
              setCode(String(value));
              if (problem && !mustRestart) setProblem(null);
            }}
            error={problem && !mustRestart ? copy[problem] : undefined}
            disabled={mustRestart}
          />
          <FlexBox
            direction="row"
            gap="var(--space-internal-8)"
            align="center"
            wrap="wrap"
          >
            <Button submits loading={busy} disabled={mustRestart}>
              {copy.verifyCode}
            </Button>
            <Button variant="tertiary" onClick={onRestart}>
              {copy.requestNewCode}
            </Button>
          </FlexBox>
        </FlexBox>
      </form>
    </IntakeColumns>
  );
}
