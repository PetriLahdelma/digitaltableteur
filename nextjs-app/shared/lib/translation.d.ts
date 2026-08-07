import { type ReactNode } from "react";
export type TranslationOptions = Record<string, unknown> & {
    defaultValue?: unknown;
};
export type Translate = (key: string, fallbackOrOptions?: string | TranslationOptions, options?: TranslationOptions) => string;
export type TranslationResourceBundle = Record<string, unknown>;
export interface TranslationRuntime {
    translate: Translate;
    language: string;
    resolvedLanguage: string;
    changeLanguage: (language: string) => void | Promise<unknown>;
    getResourceBundle: (language: string, namespace?: string) => TranslationResourceBundle | undefined;
}
export declare function TranslationProvider({ children, translate, language, resolvedLanguage, changeLanguage, getResourceBundle, }: {
    children: ReactNode;
    translate?: Translate;
    language?: string;
    resolvedLanguage?: string;
    changeLanguage?: TranslationRuntime["changeLanguage"];
    getResourceBundle?: TranslationRuntime["getResourceBundle"];
}): import("react").JSX.Element;
export declare function useTranslate(): Translate;
export declare function useLocalization(): TranslationRuntime;
//# sourceMappingURL=translation.d.ts.map