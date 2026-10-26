import { cookies, headers } from "next/headers";

import { isEnabledLocale, resolveIntakeLocale } from "@/app/lib/intake/copy";
import type { IntakeLocale } from "@/app/lib/intake/types";

/** The site's language preference cookie, written by the header's language switcher (providers/I18nProvider.tsx). */
const SITE_LANGUAGE_COOKIE = "i18next";

/**
 * Interface locale for an intake page: an explicit ?lang= (emailed links),
 * then the language chosen in the site header, then the invite's language,
 * then the browser's.
 */
export async function requestLocale(
  searchParams: Promise<Record<string, string | string[] | undefined>>,
  fallback?: IntakeLocale,
): Promise<IntakeLocale> {
  const lang = (await searchParams).lang;
  if (isEnabledLocale(lang)) return lang;
  const site = (await cookies()).get(SITE_LANGUAGE_COOKIE)?.value;
  if (isEnabledLocale(site)) return site;
  if (fallback) return fallback;
  return resolveIntakeLocale(null, (await headers()).get("accept-language"));
}
