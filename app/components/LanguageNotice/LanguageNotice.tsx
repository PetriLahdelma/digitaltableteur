"use client";

import { useTranslation } from "react-i18next";
import styles from "./LanguageNotice.module.css";

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
  className,
}: LanguageNoticeProps) {
  const { i18n, t } = useTranslation();

  // Normalize to 2-letter code
  const currentLang = (i18n.language?.split("-")[0] || "en").toLowerCase();
  const contentLang = contentLanguage.toLowerCase();

  // Don't show if current UI language matches content language
  if (currentLang === contentLang) {
    return null;
  }

  // Get the language name in the current UI language
  const languageName = t(`languageName.${contentLang}`, {
    defaultValue: "English",
  });

  return (
    <p
      className={`${styles.notice} ${className || ""}`.trim()}
      lang={currentLang} // Notice text is in UI language
    >
      {t("contentLanguageNotice", { language: languageName })}
    </p>
  );
}
