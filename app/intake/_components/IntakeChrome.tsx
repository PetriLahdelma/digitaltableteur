"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useLocalization } from "@digitaltableteur/react";
import {
  useHeaderAccount,
  useHideChatWidget,
  useLimitedLanguages,
} from "@dt/NextLayout";

import { adminCopy } from "@/app/lib/intake/admin-copy";
import { format, intakeCopy, isEnabledLocale } from "@/app/lib/intake/copy";
import { ENABLED_INTAKE_LOCALES } from "@/app/lib/intake/data-policy";

async function signOutAdmin() {
  await fetch("/api/intake/admin/auth/logout", {
    method: "POST",
    credentials: "same-origin",
  }).catch(() => undefined);
  window.location.assign("/intake/admin");
}

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
export function IntakeChrome({
  accountName,
  adminSignedIn,
}: {
  accountName: string | null;
  /** The owner's admin session; on /intake/admin the header shows the admin menu instead. */
  adminSignedIn: boolean;
}) {
  useHideChatWidget();
  useLimitedLanguages(ENABLED_INTAKE_LOCALES);
  const { language } = useLocalization();
  const locale = isEnabledLocale(language) ? language : "en";
  const inAdmin = (usePathname() ?? "").startsWith("/intake/admin");
  const account = useMemo(() => {
    if (inAdmin) {
      if (!adminSignedIn) return undefined;
      const a = adminCopy(locale);
      const name = a("accountName");
      return {
        name,
        menuLabel: format(intakeCopy(locale)("accountMenu"), { name }),
        items: [
          { id: "intakes", label: a("intakesTitle"), href: "/intake/admin" },
          { id: "passkeys", label: a("passkeys"), href: "/intake/admin/passkeys" },
          { id: "sign-out", label: a("signOut"), onSelect: () => void signOutAdmin() },
        ],
      };
    }
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
  }, [accountName, adminSignedIn, inAdmin, locale]);
  useHeaderAccount(account);
  return null;
}
