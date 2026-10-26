"use client";

import { useEffect, useState } from "react";
import { Link } from "@digitaltableteur/react";

import { useLocalization } from "@/nextjs-app/shared/lib/translation";
import type { IntakeLocale } from "@/app/lib/intake/types";

const LANGUAGE_NAMES: Record<IntakeLocale, string> = { en: "English", fi: "Suomi", sv: "Svenska" };

/**
 * Keeps the design-system components' own strings (validation messages,
 * clear buttons) in the language of the intake page they sit on.
 */
export function LanguageSync({ locale }: { locale: IntakeLocale }) {
  const { language, changeLanguage } = useLocalization();
  useEffect(() => {
    if (language !== locale) void changeLanguage(locale);
  }, [language, locale, changeLanguage]);
  return null;
}

/**
 * Language links that keep the current path and fragment, so switching
 * language on the invite page does not drop the invitation token.
 */
export function LanguageSwitch({ locale, locales, label }: { locale: IntakeLocale; locales: readonly IntakeLocale[]; label: string }) {
  const [hash, setHash] = useState("");
  useEffect(() => setHash(window.location.hash), []);
  return (
    <nav aria-label={label}>
      {locales.map((option, index) => (
        <span key={option}>
          {index > 0 ? " / " : null}
          {option === locale ? (
            <Link href={`?lang=${option}${hash}`} aria-current="true" underline="none" lang={option}>
              {LANGUAGE_NAMES[option]}
            </Link>
          ) : (
            <Link href={`?lang=${option}${hash}`} lang={option} hrefLang={option}>
              {LANGUAGE_NAMES[option]}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
