import { headers } from "next/headers";

import { resolveIntakeLocale } from "@/app/lib/intake/copy";
import type { IntakeLocale } from "@/app/lib/intake/types";

/** Locale for pages that are not tied to an invite: ?lang= first, then the browser's languages. */
export async function requestLocale(searchParams: Promise<Record<string, string | string[] | undefined>>): Promise<IntakeLocale> {
  const lang = (await searchParams).lang;
  return resolveIntakeLocale(typeof lang === "string" ? lang : null, (await headers()).get("accept-language"));
}
