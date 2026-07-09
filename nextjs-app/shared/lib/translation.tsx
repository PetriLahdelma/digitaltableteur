"use client";

import {
  useCallback,
  createContext,
  useEffect,
  useContext,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import englishTranslations from "../locales/en/translation.json";

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

const defaultTranslations = englishTranslations as Record<string, unknown>;

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
  const runtimeTranslate = useCallback<Translate>(
    (key, fallbackOrOptions, options) =>
      translate(key, fallbackOrOptions, options),
    [language, resolvedLanguage, translate],
  );
  const runtime = useMemo<TranslationRuntime>(
    () => ({
      translate: runtimeTranslate,
      language,
      resolvedLanguage,
      changeLanguage: changeLanguage ?? (() => undefined),
      getResourceBundle: getResourceBundle ?? (() => undefined),
    }),
    [
      changeLanguage,
      getResourceBundle,
      language,
      resolvedLanguage,
      runtimeTranslate,
    ],
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
      <TranslationContext.Provider value={runtimeTranslate}>
        {children}
      </TranslationContext.Provider>
    </TranslationRuntimeContext.Provider>
  );
}

export function useTranslate(): Translate {
  return useLocalization().translate;
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
