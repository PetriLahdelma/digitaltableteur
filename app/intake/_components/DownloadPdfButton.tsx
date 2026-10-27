"use client";

import { useState } from "react";
import { AlertBanner, Button, FlexBox } from "@digitaltableteur/react";

/**
 * Downloads the submission's PDF. The first download renders it, which takes
 * a few seconds, so the button shows that it is working instead of a bare link.
 */
export function DownloadPdfButton({
  href,
  label,
  errorText,
}: {
  /** The PDF route: the client's own, or the owner's in admin. */
  href: string;
  label: string;
  errorText: string;
}) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function download() {
    setBusy(true);
    setFailed(false);
    try {
      const response = await fetch(href, { credentials: "same-origin" });
      if (!response.ok) throw new Error(String(response.status));
      const name = /filename="([^"]+)"/.exec(response.headers.get("content-disposition") ?? "")?.[1] ?? "intake.pdf";
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = name;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <FlexBox direction="column" gap="var(--space-internal-12)">
      {failed ? <AlertBanner tone="error" description={errorText} focusOnMount /> : null}
      <FlexBox direction="row">
        <Button variant="secondary" icon="download" loading={busy} onClick={() => void download()}>
          {label}
        </Button>
      </FlexBox>
    </FlexBox>
  );
}
