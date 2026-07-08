"use client";

import {
  createContext,
  useEffect,
  useContext,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type TranslationOptions = Record<string, unknown> & {
  defaultValue?: unknown;
};

export type Translate = (
  key: string,
  fallbackOrOptions?: string | TranslationOptions,
  options?: TranslationOptions,
) => string;

export type TranslationResourceBundle = Record<string, unknown>;

export interface TranslationRuntime {
  translate: Translate;
  language: string;
  resolvedLanguage: string;
  changeLanguage: (language: string) => void | Promise<unknown>;
  getResourceBundle: (
    language: string,
    namespace?: string,
  ) => TranslationResourceBundle | undefined;
}

const defaultTranslations: Record<string, unknown> = {
  "alertBanner.close": "Close",
  "alertBanner.dismissLabel": "Dismiss alert",
  "avatar.altTextGeneric": "Avatar",
  "avatar.menuLabel": "Open profile menu for {{name}}",
  "avatar.menuLabelGeneric": "Open profile menu",
  badgeRemove: "Remove",
  blogNextPage: "Next page",
  blogPage: "Page",
  blogPageNavigation: "Page navigation",
  blogPrevPage: "Previous page",
  codeBlockWindow: {
    copied: "Copied",
    copy: "Copy",
    copyAriaLabel: "Copy code to clipboard",
    copyFailed: "Copy failed",
    languageFallback: "Code",
    regionLabel: "{{language}} code block",
  },
  contactAll: "All",
  contactValidationEmailSuggestion: "Did you mean {{suggestion}}?",
  cookieConsent: {
    acceptAllButton: "Accept all",
    acceptEssentialButton: "Only essential",
    bannerLabel: "Cookie preferences",
    bannerSummary: "We use cookies to improve your experience.",
    categories: {
      analytics: {
        description: "Helps us understand how people use the experience.",
        title: "Analytics",
        toggleLabel: "Toggle analytics cookies",
      },
      essential: {
        description: "Required for core functionality.",
        title: "Essential",
        toggleLabel: "Essential cookies are required",
      },
      functional: {
        description: "Remembers preferences that improve the experience.",
        title: "Functional",
        toggleLabel: "Toggle functional cookies",
      },
      marketing: {
        description: "Supports measurement and personalized outreach.",
        title: "Marketing",
        toggleLabel: "Toggle marketing cookies",
      },
    },
    customizeButton: "Customize settings",
    detailedDescription: "Choose which optional cookies can be stored.",
    policyLinkText: "cookie policy",
    readOur: "Read our",
    required: "Required",
    saveButton: "Save preferences",
    title: "Cookie preferences",
    viewFullPolicy: "View full policy",
  },
  fileUploadSizeError: "File is too large. Max {{maxSize}} MB. File removed.",
  inputValidationEmailInvalid: "Enter a valid email address.",
  inputValidationPhoneInvalid: "Enter a valid phone number.",
  languageSwitcherCollapse: "Hide language options",
  languageSwitcherExpand: "Show language options",
  macWindowFrame: {
    action: "Replay",
    bodyLabel: "Window content",
    title: "Preview",
  },
  multiComboboxNoResults: "No matching options",
  multiComboboxToggleOptions: "Toggle options",
  navMenuLanguages: "Language",
  "tabs.navigation": "Navigate between tabs",
};

function lookupDefaultTranslation(key: string): unknown {
  if (Object.prototype.hasOwnProperty.call(defaultTranslations, key)) {
    return defaultTranslations[key];
  }

  return key.split(".").reduce<unknown>((current, part) => {
    if (
      current &&
      typeof current === "object" &&
      Object.prototype.hasOwnProperty.call(current, part)
    ) {
      return (current as Record<string, unknown>)[part];
    }
    return undefined;
  }, defaultTranslations);
}

function interpolate(value: string, options?: TranslationOptions): string {
  if (!options) return value;

  return value.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (match, name) => {
    const replacement = options[name];
    return replacement == null ? match : String(replacement);
  });
}

function fallbackTranslate(
  key: string,
  fallbackOrOptions?: string | TranslationOptions,
  options?: TranslationOptions,
): string {
  const optionBag =
    typeof fallbackOrOptions === "string" ? options : fallbackOrOptions;
  const defaultValue =
    typeof fallbackOrOptions === "string"
      ? fallbackOrOptions
      : fallbackOrOptions?.defaultValue;
  const translated = lookupDefaultTranslation(key);
  const value = translated ?? defaultValue ?? key;

  if (typeof value === "string") {
    return interpolate(value, optionBag);
  }

  return value as string;
}

const defaultRuntime: TranslationRuntime = {
  translate: fallbackTranslate,
  language: "en",
  resolvedLanguage: "en",
  changeLanguage: () => undefined,
  getResourceBundle: () => undefined,
};

const TranslationContext = createContext<Translate | null>(null);
const TranslationRuntimeContext = createContext<TranslationRuntime | null>(null);

const BRIDGE_KEY = "__digitaltableteurTranslationRuntime";

type TranslationBridge = {
  runtime: TranslationRuntime | null;
  version: number;
  listeners: Set<() => void>;
};

function getTranslationBridge(): TranslationBridge | null {
  if (typeof globalThis === "undefined") return null;

  const globalStore = globalThis as typeof globalThis & {
    [BRIDGE_KEY]?: Partial<TranslationBridge>;
  };

  globalStore[BRIDGE_KEY] ??= {};
  const bridge = globalStore[BRIDGE_KEY];
  bridge.runtime ??= null;
  bridge.version ??= 0;
  bridge.listeners ??= new Set<() => void>();

  return bridge as TranslationBridge;
}

function getBridgedRuntime(): TranslationRuntime {
  return getTranslationBridge()?.runtime ?? defaultRuntime;
}

function notifyTranslationBridge(bridge: TranslationBridge): void {
  bridge.version += 1;
  bridge.listeners.forEach((listener) => listener());
}

function subscribeTranslationBridge(listener: () => void): () => void {
  const bridge = getTranslationBridge();
  if (!bridge) return () => undefined;

  bridge.listeners.add(listener);
  return () => {
    bridge.listeners.delete(listener);
  };
}

function getTranslationBridgeSnapshot(): TranslationRuntime {
  return getBridgedRuntime();
}

export function TranslationProvider({
  children,
  translate = fallbackTranslate,
  language = "en",
  resolvedLanguage = language,
  changeLanguage,
  getResourceBundle,
}: {
  children: ReactNode;
  translate?: Translate;
  language?: string;
  resolvedLanguage?: string;
  changeLanguage?: TranslationRuntime["changeLanguage"];
  getResourceBundle?: TranslationRuntime["getResourceBundle"];
}) {
  const runtime = useMemo<TranslationRuntime>(
    () => ({
      translate,
      language,
      resolvedLanguage,
      changeLanguage: changeLanguage ?? (() => undefined),
      getResourceBundle: getResourceBundle ?? (() => undefined),
    }),
    [changeLanguage, getResourceBundle, language, resolvedLanguage, translate],
  );
  const previousBridgeRuntimeRef = useRef<TranslationRuntime | null | undefined>(
    undefined,
  );

  const bridge = getTranslationBridge();
  if (bridge) {
    if (previousBridgeRuntimeRef.current === undefined) {
      previousBridgeRuntimeRef.current = bridge.runtime;
    }
    bridge.runtime = runtime;
  }

  useEffect(() => {
    const activeBridge = getTranslationBridge();
    if (activeBridge) {
      activeBridge.runtime = runtime;
      notifyTranslationBridge(activeBridge);
    }

    return () => {
      if (activeBridge?.runtime === runtime) {
        activeBridge.runtime = previousBridgeRuntimeRef.current ?? null;
        notifyTranslationBridge(activeBridge);
      }
    };
  }, [runtime]);

  return (
    <TranslationRuntimeContext.Provider value={runtime}>
      <TranslationContext.Provider value={translate}>
        {children}
      </TranslationContext.Provider>
    </TranslationRuntimeContext.Provider>
  );
}

export function useTranslate(): Translate {
  const translate = useContext(TranslationContext);
  const bridgedRuntime = useSyncExternalStore(
    subscribeTranslationBridge,
    getTranslationBridgeSnapshot,
    getTranslationBridgeSnapshot,
  );

  return translate ?? bridgedRuntime.translate;
}

export function useLocalization(): TranslationRuntime {
  const runtime = useContext(TranslationRuntimeContext);
  const bridgedRuntime = useSyncExternalStore(
    subscribeTranslationBridge,
    getTranslationBridgeSnapshot,
    getTranslationBridgeSnapshot,
  );

  return runtime ?? bridgedRuntime;
}
