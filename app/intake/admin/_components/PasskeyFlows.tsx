"use client";

import { useEffect, useRef, useState } from "react";
import { AlertBanner, Button, FlexBox, Text, TextInput } from "@digitaltableteur/react";
import { browserSupportsWebAuthn, startAuthentication, startRegistration } from "@simplewebauthn/browser";

import { adminCopy } from "@/app/lib/intake/admin-copy";
import type { IntakeLocale } from "@/app/lib/intake/types";

import { postJson } from "../../_components/api";

/** The owner's sign-in: one button, the browser's passkey prompt, then admin. */
export function AdminSignIn({ locale, hasPasskeys }: { locale: IntakeLocale; hasPasskeys: boolean }) {
  const t = adminCopy(locale);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [supported, setSupported] = useState(true);
  useEffect(() => setSupported(browserSupportsWebAuthn()), []);

  async function signIn() {
    setBusy(true);
    setFailed(false);
    try {
      const start = await postJson("/api/intake/admin/auth/options", {});
      if (start.httpStatus !== 200) throw new Error("options");
      const response = await startAuthentication({ optionsJSON: start.data.options as never });
      const finish = await postJson("/api/intake/admin/auth/verify", { response });
      if (finish.httpStatus !== 200) throw new Error("verify");
      window.location.assign("/intake/admin");
    } catch {
      setFailed(true);
      setBusy(false);
    }
  }

  return (
    <FlexBox direction="column" gap="var(--space-internal-24)">
      {!supported ? <AlertBanner tone="warning" description={t("noWebAuthn")} /> : null}
      {failed ? <AlertBanner tone="error" description={t("signInFailed")} focusOnMount /> : null}
      {hasPasskeys ? null : <Text size="s">{t("noPasskey")}</Text>}
      <FlexBox direction="row">
        <Button size="lg" icon="seal-check" loading={busy} disabled={!supported} onClick={() => void signIn()}>
          {t("signInButton")}
        </Button>
      </FlexBox>
    </FlexBox>
  );
}

/** A guess at the device's name for the passkey label; the owner can change it. */
function deviceGuess(): string {
  const agent = navigator.userAgent;
  if (/iPhone/.test(agent)) return "iPhone";
  if (/iPad/.test(agent)) return "iPad";
  if (/Android/.test(agent)) return "Android";
  if (/Mac/.test(agent)) return "Mac";
  if (/Windows/.test(agent)) return "Windows";
  return "";
}

/**
 * Creates a passkey. With `via="link"` the one-time enrolment token comes from
 * the URL fragment (never sent to a server log) and signs the owner in; with
 * `via="session"` it adds another passkey from inside admin.
 */
export function AdminEnrol({ locale, via }: { locale: IntakeLocale; via: "link" | "session" }) {
  const t = adminCopy(locale);
  const [label, setLabel] = useState("");
  const [token, setToken] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<"expired" | "failed" | null>(null);

  const readToken = useRef(false);

  useEffect(() => {
    // Once only: the fragment is cleared right after, so a second run (Strict Mode) would find nothing.
    if (readToken.current) return;
    readToken.current = true;
    setLabel(deviceGuess());
    if (via !== "link") return;
    const fromHash = new URLSearchParams(window.location.hash.slice(1)).get("t") ?? undefined;
    setToken(fromHash);
    if (!fromHash) setProblem("expired");
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }, [via]);

  async function create() {
    setBusy(true);
    setProblem(null);
    try {
      const start = await postJson("/api/intake/admin/enrol/options", via === "link" ? { enrolmentToken: token } : {});
      if (start.httpStatus === 403) {
        setProblem("expired");
        setBusy(false);
        return;
      }
      if (start.httpStatus !== 200) throw new Error("options");
      const response = await startRegistration({ optionsJSON: start.data.options as never });
      const finish = await postJson("/api/intake/admin/enrol/verify", { response, label, ...(via === "link" ? { enrolmentToken: token } : {}) });
      if (finish.httpStatus === 403) {
        setProblem("expired");
        setBusy(false);
        return;
      }
      if (finish.httpStatus !== 200) throw new Error("verify");
      window.location.assign(via === "link" ? "/intake/admin" : "/intake/admin/passkeys");
    } catch {
      setProblem("failed");
      setBusy(false);
    }
  }

  return (
    <FlexBox direction="column" gap="var(--space-internal-24)">
      {problem ? <AlertBanner tone="error" description={problem === "expired" ? t("enrolExpired") : t("genericError")} focusOnMount /> : null}
      <TextInput size="lg" width="30ch" type="text" label={t("enrolLabel")} value={label} onValueChange={(value) => setLabel(String(value))} maxLength={60} />
      <FlexBox direction="row">
        <Button size="lg" icon="seal-check" loading={busy} disabled={via === "link" && !token} onClick={() => void create()}>
          {t("enrolButton")}
        </Button>
      </FlexBox>
    </FlexBox>
  );
}
