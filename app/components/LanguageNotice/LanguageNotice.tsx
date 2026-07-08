"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/providers/ToastProvider";

interface LanguageNoticeProps {
  /** The language code of the content (e.g., "en") */
  contentLanguage: string;
  /** Optional additional CSS class */
  className?: string;
}

/**
 * Displays a notice when content language differs from UI language
 * WCAG 3.1.2: Language of Parts - inform users about language differences
 */
export function LanguageNotice({
  contentLanguage,
}: LanguageNoticeProps) {
  const { i18n, t } = useTranslation();
  const { showToast } = useToast();
  const lastNoticeRef = useRef<string | null>(null);

  // Normalize to 2-letter code
  const currentLang = (i18n.language?.split("-")[0] || "en").toLowerCase();
  const contentLang = contentLanguage.toLowerCase();

  const languageName = t(`languageName.${contentLang}`, {
    defaultValue: "English",
  });
  const notice = t("contentLanguageNotice", { language: languageName });

  useEffect(() => {
    if (currentLang === contentLang) return;
    const noticeKey = `${currentLang}:${contentLang}:${notice}`;
    if (lastNoticeRef.current === noticeKey) return;
    lastNoticeRef.current = noticeKey;
    showToast(notice, {
      duration: 5000,
      tone: "info",
      position: "bottom-center",
    });
  }, [contentLang, currentLang, notice, showToast]);

  return null;
}
