import { AlertBanner, Link } from "@digitaltableteur/react";

import type { IntakeCopyTable } from "@/app/lib/intake/copy";
import type { IntakeLocale } from "@/app/lib/intake/types";

/**
 * "Before you continue, read how we handle your answers." as an info banner
 * with the link inline. Standing guidance, not news: no live region.
 */
export function PrivacyNotice({ copy, locale }: { copy: IntakeCopyTable; locale: IntakeLocale }) {
  return (
    <AlertBanner
      tone="info"
      aria-live="off"
      description={
        <>
          {copy.privacyNoticeLead}
          <Link href={`/intake/privacy?lang=${locale}`} size="inherit">
            {copy.privacyNoticeLink}
          </Link>
          {copy.privacyNoticeEnd}
        </>
      }
    />
  );
}
