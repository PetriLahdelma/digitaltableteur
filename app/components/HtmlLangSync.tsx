"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/**
 * Synchronizes the HTML lang attribute with the current i18n language
 * This ensures screen readers use the correct language for content
 */
export function HtmlLangSync() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Update HTML lang attribute when language changes
    if (i18n.language) {
      document.documentElement.lang = i18n.language;
    }
  }, [i18n.language]);

  return null;
}
