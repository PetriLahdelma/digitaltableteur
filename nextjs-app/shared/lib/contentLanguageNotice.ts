"use client";

export interface ContentLanguageNoticeEntry {
  id: string;
  contentLanguage: string;
}

export type TranslationBundleReader = (
  language: string,
  namespace?: string,
) => Record<string, unknown> | undefined;

const BRIDGE_KEY = "__digitaltableteurContentLanguageNotices";

type ContentLanguageNoticeBridge = {
  entries: Map<string, string>;
};

function normalizeLanguageCode(language: string | null | undefined): string {
  return (language || "en").split("-")[0]?.toLowerCase() || "en";
}

function getBridge(): ContentLanguageNoticeBridge | null {
  if (typeof globalThis === "undefined") return null;

  const globalStore = globalThis as typeof globalThis & {
    [BRIDGE_KEY]?: ContentLanguageNoticeBridge;
  };

  globalStore[BRIDGE_KEY] ??= { entries: new Map() };
  return globalStore[BRIDGE_KEY];
}

export function registerContentLanguageNotice({
  id,
  contentLanguage,
}: ContentLanguageNoticeEntry): () => void {
  const bridge = getBridge();
  if (!bridge) return () => undefined;

  bridge.entries.set(id, normalizeLanguageCode(contentLanguage));
  return () => {
    bridge.entries.delete(id);
  };
}

export function getActiveContentLanguageNotice(): string | null {
  const entries = getBridge()?.entries;
  if (!entries?.size) return null;

  return Array.from(entries.values()).at(-1) ?? null;
}

export function getContentLanguageNoticeMessage({
  targetLanguage,
  getResourceBundle,
}: {
  targetLanguage: string;
  getResourceBundle: TranslationBundleReader;
}): string | null {
  const contentLanguage = getActiveContentLanguageNotice();
  const normalizedTargetLanguage = normalizeLanguageCode(targetLanguage);

  if (!contentLanguage || contentLanguage === normalizedTargetLanguage) {
    return null;
  }

  const bundle = getResourceBundle(normalizedTargetLanguage, "translation");
  const languageNameKey = `languageName.${contentLanguage}`;
  const languageName =
    typeof bundle?.[languageNameKey] === "string"
      ? bundle[languageNameKey]
      : contentLanguage;
  const template =
    typeof bundle?.contentLanguageNotice === "string"
      ? bundle.contentLanguageNotice
      : "This content is available in {{language}} only.";

  return template.replace(/\{\{\s*language\s*\}\}/g, String(languageName));
}
