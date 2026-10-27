"use client";

import { useState } from "react";
import { AlertBanner, Button, FlexBox, Timestamp, Title } from "@digitaltableteur/react";
import ConfirmPopover from "@dt/ConfirmPopover";
import SummaryList from "@dt/SummaryList";

import { adminCopy } from "@/app/lib/intake/admin-copy";
import type { IntakeLocale } from "@/app/lib/intake/types";

import { postJson } from "../../_components/api";
import { AdminEnrol } from "./PasskeyFlows";

/** Dates as ISO strings, so the row crosses the server/client boundary. */
export type PasskeyRow = Readonly<{ id: string; label: string; created: string; used: string | null }>;

/** The owner's passkeys: add one on another device, remove any but the last. */
export function PasskeyList({ locale, passkeys }: { locale: IntakeLocale; passkeys: PasskeyRow[] }) {
  const t = adminCopy(locale);
  const [adding, setAdding] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const only = passkeys.length <= 1;

  async function remove(id: string) {
    setProblem(null);
    const { httpStatus } = await postJson(`/api/intake/admin/passkeys/${encodeURIComponent(id)}/remove`, {});
    if (httpStatus === 200) window.location.reload();
    else setProblem(httpStatus === 409 ? t("lastPasskey") : t("genericError"));
  }

  return (
    <FlexBox direction="column" gap="var(--space-internal-24)">
      {problem ? <AlertBanner tone="error" description={problem} focusOnMount /> : null}
      <SummaryList
        rows={passkeys.map((passkey) => ({
          id: passkey.id,
          label: passkey.label,
          value: (
            <>
              {t("passkeyAdded")} <Timestamp value={passkey.created} format="date_time" locale={locale} />
              <br />
              {passkey.used ? (
                <>
                  {t("passkeyUsed")} <Timestamp value={passkey.used} format="date_time" locale={locale} />
                </>
              ) : (
                t("passkeyUnused")
              )}
            </>
          ),
          action: only ? undefined : (
            <ConfirmPopover
              title={t("removeTitle")}
              description={t("removeDescription")}
              confirmLabel={t("remove")}
              cancelLabel={t("cancel")}
              tone="error"
              onConfirm={() => void remove(passkey.id)}
            >
              <Button variant="tertiary" tone="error">
                {t("remove")}
              </Button>
            </ConfirmPopover>
          ),
        }))}
      />
      {adding ? (
        <FlexBox direction="column" gap="var(--space-internal-16)">
          <Title level={2} size="s">
            {t("addPasskey")}
          </Title>
          <AdminEnrol locale={locale} via="session" />
        </FlexBox>
      ) : (
        <FlexBox direction="row">
          <Button size="lg" variant="secondary" icon="plus" onClick={() => setAdding(true)}>
            {t("addPasskey")}
          </Button>
        </FlexBox>
      )}
    </FlexBox>
  );
}
