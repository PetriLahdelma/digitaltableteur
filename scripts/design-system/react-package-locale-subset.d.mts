import type { Plugin } from "vite";

export function collectPackageSources(options: {
  entryFiles: string[];
  componentsRoot: string;
}): string[];

export function subsetLocale(
  locale: Record<string, unknown>,
  sources: string[],
): Record<string, unknown>;

export function packageLocaleSubset(options: {
  localeFile: string;
  entryFiles: string[];
  componentsRoot: string;
}): Plugin;
