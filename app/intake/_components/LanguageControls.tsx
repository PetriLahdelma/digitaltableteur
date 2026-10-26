"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { isEnabledLocale } from "@/app/lib/intake/copy";
import type { IntakeLocale } from "@/app/lib/intake/types";
import { useLocalization } from "@/nextjs-app/shared/lib/translation";

/**
 * Ties intake pages to the site's own language switcher in the header. The
 * page is rendered on the server in `locale`; on arrival the site language
 * follows it (an emailed link says ?lang=fi), and when the visitor switches
 * language in the header the page re-renders in that language, keeping the
 * URL fragment (the invite token) and any unsaved form state.
 */
export function IntakeLanguage({ locale }: { locale: IntakeLocale }) {
  const { language, changeLanguage } = useLocalization();
  const router = useRouter();
  const arrived = useRef(false);

  useEffect(() => {
    if (!arrived.current) {
      arrived.current = true;
      if (language !== locale) void changeLanguage(locale);
      return;
    }
    // Swedish is not offered for intake yet (ENABLED_INTAKE_LOCALES): it falls back to English.
    const target = isEnabledLocale(language) ? language : "en";
    if (target === locale) return;
    const url = new URL(window.location.href);
    url.searchParams.set("lang", target);
    router.replace(`${url.pathname}${url.search}${url.hash}`, {
      scroll: false,
    });
  }, [language, locale, changeLanguage, router]);

  return null;
}
