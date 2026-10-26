"use client";

import { useMemo } from "react";
import {
  useHeaderAccount,
  useHideChatWidget,
  useLimitedLanguages,
} from "@dt/NextLayout";

import { format, intakeCopy, isEnabledLocale } from "@/app/lib/intake/copy";
import { ENABLED_INTAKE_LOCALES } from "@/app/lib/intake/data-policy";
import { useLocalization } from "@/nextjs-app/shared/lib/translation";

async function signOut() {
  await fetch("/api/intake/auth/logout", {
    method: "POST",
    credentials: "same-origin",
  }).catch(() => undefined);
  window.location.assign("/intake?signedOut=1");
}

/**
 * Intake pages keep the site header and footer, minus the chat assistant;
 * the header offers only the intake's languages and, once a client is
 * signed in, their account menu (their intakes, sign out).
 */
export function IntakeChrome({ accountName }: { accountName: string | null }) {
  useHideChatWidget();
  useLimitedLanguages(ENABLED_INTAKE_LOCALES);
  const { language } = useLocalization();
  const locale = isEnabledLocale(language) ? language : "en";
  const account = useMemo(() => {
    if (!accountName) return undefined;
    const t = intakeCopy(locale);
    return {
      name: accountName,
      menuLabel: format(t("accountMenu"), { name: accountName }),
      items: [
        { id: "intakes", label: t("homeTitle"), href: "/intake/forms" },
        { id: "sign-out", label: t("signOut"), onSelect: () => void signOut() },
      ],
    };
  }, [accountName, locale]);
  useHeaderAccount(account);
  return null;
}
