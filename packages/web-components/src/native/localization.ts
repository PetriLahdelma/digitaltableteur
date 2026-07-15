type SupportedLocale = "en" | "fi" | "sv";

function normalizeLocale(value: string | null | undefined): SupportedLocale {
  const locale = value?.trim().toLowerCase();
  if (locale?.startsWith("fi")) return "fi";
  if (locale?.startsWith("sv")) return "sv";
  return "en";
}

export function resolveElementLocale(element: Element): SupportedLocale {
  const hostLocale = element.closest("[lang]")?.getAttribute("lang");
  const documentLocale =
    element.ownerDocument.documentElement?.getAttribute("lang");
  return normalizeLocale(hostLocale ?? documentLocale);
}

export function localizedText<T extends Record<SupportedLocale, string>>(
  element: Element,
  variants: T,
): T[SupportedLocale] {
  return variants[resolveElementLocale(element)];
}
