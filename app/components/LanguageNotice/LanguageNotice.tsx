"use client";

import { useEffect, useId, useRef } from "react";
import {
  getContentLanguageNoticeMessage,
  registerContentLanguageNotice,
} from "@/nextjs-app/shared/lib/contentLanguageNotice";
import { useToast } from "@/nextjs-app/shared/lib/toast";
import { useLocalization } from "@/nextjs-app/shared/lib/translation";

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
  const announcedKeyRef = useRef<string | null>(null);
  const { resolvedLanguage, getResourceBundle } = useLocalization();
  const { showToast } = useToast();

  useEffect(
    () => registerContentLanguageNotice({ id, contentLanguage }),
    [contentLanguage, id],
  );

  useEffect(() => {
    const targetLanguage = resolvedLanguage.split("-")[0] || "en";
    const message = getContentLanguageNoticeMessage({
      targetLanguage,
      getResourceBundle,
    });

    if (!message) {
      // Language matches the content again; clear the marker so a later
      // switch back to a mismatching language re-announces (fi -> en -> fi).
      announcedKeyRef.current = null;
      return;
    }

    const announcementKey = `${contentLanguage}:${targetLanguage}`;
    if (announcedKeyRef.current === announcementKey) return;

    announcedKeyRef.current = announcementKey;
    showToast(message, { tone: "neutral", duration: 5000 });
  }, [contentLanguage, getResourceBundle, resolvedLanguage, showToast]);

  return null;
}
