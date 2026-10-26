"use client";

import { useHideChatWidget, useLimitedLanguages } from "@dt/NextLayout";

import { ENABLED_INTAKE_LOCALES } from "@/app/lib/intake/data-policy";

/**
 * Intake pages keep the site header and footer, minus the chat assistant,
 * and the header offers only the languages the intake is available in.
 */
export function IntakeChrome() {
  useHideChatWidget();
  useLimitedLanguages(ENABLED_INTAKE_LOCALES);
  return null;
}
