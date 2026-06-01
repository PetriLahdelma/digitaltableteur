"use client";

import { useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";

function normalizeHtmlLang(language: string | undefined): string {
  if (!language) return "en";
  return language.split("-")[0] || "en";
}

/**
 * Synchronizes the HTML lang attribute with the current i18n language
 * This ensures screen readers use the correct language for content
 */
export function HtmlLangSync() {
  const { i18n } = useTranslation();

  useLayoutEffect(() => {
    document.documentElement.lang = normalizeHtmlLang(i18n.language);
  }, [i18n.language]);

  return null;
}
