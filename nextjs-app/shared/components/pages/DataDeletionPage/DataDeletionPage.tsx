"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  AlertBanner,
  Button,
  Container,
  FlexBox,
  Link,
  Section,
  Text,
  TextInput,
  Title,
} from "@digitaltableteur/react";
import styles from "../AiUsagePage/AiUsagePage.module.css";

type RequestState = "idle" | "sending" | "sent" | "error";
type ConfirmState = "idle" | "deleting" | "deleted" | "invalid" | "error";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

/** Reads the one-time token from `#t=` and clears it from the address bar. */
function readTokenFromHash(): string | null {
  const params = new URLSearchParams(window.location.hash.slice(1));
  const token = params.get("t");
  if (!token || !TOKEN_PATTERN.test(token)) return null;
  window.history.replaceState(null, "", window.location.pathname);
  return token;
}

/**
 * Self-service erasure. Without a token: ask for the address and mail a
 * confirmation link. With the token from that link: one button deletes.
 * The token travels in the URL fragment, so link scanners that prefetch
 * the page never see it and nothing is deleted without a click.
 */
export function DataDeletionPage() {
  const { t, i18n } = useTranslation();
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [requestState, setRequestState] = useState<RequestState>("idle");
  const [confirmState, setConfirmState] = useState<ConfirmState>("idle");

  useEffect(() => {
    setToken(readTokenFromHash());
  }, []);

  const locale = ["en", "fi", "sv"].includes(i18n.language?.slice(0, 2))
    ? i18n.language.slice(0, 2)
    : "en";

  const requestLink = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setEmailError(t("dataDeletionEmailError"));
      return;
    }
    setEmailError(undefined);
    setRequestState("sending");
    try {
      const response = await fetch("/api/gdpr/delete-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), locale }),
      });
      setRequestState(response.ok ? "sent" : "error");
    } catch {
      setRequestState("error");
    }
  };

  const confirm = async () => {
    if (!token) return;
    setConfirmState("deleting");
    try {
      const response = await fetch("/api/gdpr/delete-data/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (response.ok) setConfirmState("deleted");
      else setConfirmState(response.status === 400 ? "invalid" : "error");
    } catch {
      setConfirmState("error");
    }
  };

  const showConfirm = token !== null && confirmState !== "invalid";

  return (
    <Container size="sm" className={styles.prosePage}>
      <Title level={1} size="xs">
        {t(showConfirm ? "dataDeletionConfirmHeading" : "dataDeletionHeading")}
      </Title>

      {showConfirm ? (
        <Section spacing="none">
          {confirmState === "deleted" ? (
            <AlertBanner tone="success" focusOnMount description={t("dataDeletionDeleted")} />
          ) : (
            <FlexBox direction="column" gap="var(--space-internal-16)" align="flex-start">
              <Text as="p" size="xs">
                {t("dataDeletionConfirmBody")}
              </Text>
              {confirmState === "error" && (
                <AlertBanner tone="error" focusOnMount description={t("dataDeletionServerError")} />
              )}
              <Button
                tone="error"
                consequence="irreversible"
                loading={confirmState === "deleting"}
                onClick={confirm}
              >
                {t("dataDeletionConfirmButton")}
              </Button>
            </FlexBox>
          )}
        </Section>
      ) : (
        <Section spacing="none">
          <FlexBox direction="column" gap="var(--space-internal-16)" align="flex-start">
            {confirmState === "invalid" && (
              <AlertBanner tone="warning" focusOnMount description={t("dataDeletionInvalidLink")} />
            )}
            <Text as="p" size="xs">
              {t("dataDeletionIntro")}
            </Text>
            {requestState === "sent" ? (
              <AlertBanner tone="success" focusOnMount description={t("dataDeletionLinkSent")} />
            ) : (
              <form onSubmit={requestLink} noValidate className={styles.fullWidthForm}>
                <FlexBox direction="column" gap="var(--space-internal-16)" align="stretch">
                  <TextInput
                    label={t("dataDeletionEmailLabel")}
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(value) => setEmail(String(value))}
                    error={emailError}
                    width="full"
                  />
                  {requestState === "error" && (
                    <AlertBanner tone="error" focusOnMount description={t("dataDeletionServerError")} />
                  )}
                  <FlexBox>
                    <Button submits loading={requestState === "sending"}>
                      {t("dataDeletionSendButton")}
                    </Button>
                  </FlexBox>
                </FlexBox>
              </form>
            )}
          </FlexBox>
        </Section>
      )}

      <Text as="p" size="xs">
        <Link href="/privacy-policy" size="inherit">
          {t("dataDeletionBackToPolicy")}
        </Link>
      </Text>
    </Container>
  );
}
