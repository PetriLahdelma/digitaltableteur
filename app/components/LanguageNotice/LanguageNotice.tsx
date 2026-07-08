"use client";

import { useEffect, useId } from "react";
import { registerContentLanguageNotice } from "@/nextjs-app/shared/lib/contentLanguageNotice";

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
  const id = useId();

  useEffect(
    () => registerContentLanguageNotice({ id, contentLanguage }),
    [contentLanguage, id],
  );

  return null;
}
