"use client";

import { useState } from "react";
import { AlertBanner, Button, FlexBox } from "@digitaltableteur/react";
import ConfirmPopover from "@dt/ConfirmPopover";

import { adminCopy } from "@/app/lib/intake/admin-copy";
import type { AdminIntakeStatus } from "@/app/lib/intake/service/admin";
import type { IntakeLocale } from "@/app/lib/intake/types";

import { postJson } from "../../_components/api";

type Action = "resend" | "revoke" | "reopen" | "delete";

/** What the owner can do with an intake in its current status. */
function actionsFor(status: AdminIntakeStatus): Action[] {
  if (status === "invited" || status === "expired") return ["resend", "revoke", "delete"];
  if (status === "started" || status === "reopened") return ["revoke", "delete"];
  if (status === "submitted") return ["reopen", "delete"];
  return ["delete"];
}

export function IntakeActions({ inviteId, status, locale }: { inviteId: string; status: AdminIntakeStatus; locale: IntakeLocale }) {
  const t = adminCopy(locale);
  const [busy, setBusy] = useState<Action | null>(null);
  const [failed, setFailed] = useState(false);

  async function run(action: Action) {
    setBusy(action);
    setFailed(false);
    const { httpStatus } = await postJson(`/api/intake/admin/intakes/${inviteId}/${action}`, {});
    if (httpStatus === 200) {
      window.location.assign(action === "delete" ? "/intake/admin" : `/intake/admin/intakes/${inviteId}?done=${action}`);
      return;
    }
    setBusy(null);
    setFailed(true);
  }

  const confirm = {
    revoke: { title: t("revokeTitle"), description: t("revokeDescription"), tone: "error" as const },
    reopen: { title: t("reopenTitle"), description: t("reopenDescription"), tone: "neutral" as const },
    delete: { title: t("deleteTitle"), description: t("deleteDescription"), tone: "error" as const },
  };

  return (
    <FlexBox direction="column" gap="var(--space-internal-16)">
      {failed ? <AlertBanner tone="error" description={t("genericError")} focusOnMount /> : null}
      <FlexBox direction="row" gap="var(--space-internal-16)" wrap="wrap">
        {actionsFor(status).map((action) =>
          action === "resend" ? (
            <Button key={action} variant="secondary" icon="paper-plane-tilt" loading={busy === action} onClick={() => void run(action)}>
              {t("resend")}
            </Button>
          ) : (
            <ConfirmPopover
              key={action}
              title={confirm[action].title}
              description={confirm[action].description}
              confirmLabel={t(action)}
              cancelLabel={t("cancel")}
              tone={confirm[action].tone}
              onConfirm={() => void run(action)}
            >
              <Button variant={action === "delete" ? "tertiary" : "secondary"} tone={action === "delete" ? "error" : "neutral"} loading={busy === action}>
                {t(action)}
              </Button>
            </ConfirmPopover>
          ),
        )}
      </FlexBox>
    </FlexBox>
  );
}
