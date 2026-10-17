/**
 * English fallback strings for the @digitaltableteur/react build.
 *
 * nextjs-app/shared/lib/translation.tsx imports the site's full English
 * locale as its fallback. Bundled as is, every page's copy (engagement pages,
 * policies, case studies) ships inside the package and grows each entry
 * point's graph. The package build swaps that import for this subset: only
 * keys the package's own source files reference.
 *
 * Walks relative and @dt/ imports from packages/react/src, then keeps a key
 * when a walked file names it in any string literal (t("key"), labelKey:
 * "key") or a template literal starts with its prefix (t(`languageName.${x}`)).
 */

import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const EXTENSIONS = [".tsx", ".ts", ".jsx", ".js", "/index.tsx", "/index.ts"];
const IMPORT = /(?:import|export)\s[^'"]*?from\s*["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;
const LITERAL = /["'`]([A-Za-z][\w.-]*)["'`]/g;
const TEMPLATE_PREFIX = /`([A-Za-z][\w.-]*\.)\$\{/g;

function resolveImport(specifier, fromFile, componentsRoot) {
  let base;
  if (specifier.startsWith("@dt/")) base = join(componentsRoot, specifier.slice(4));
  else if (specifier === "@dt") base = componentsRoot;
  else if (specifier.startsWith(".")) base = resolve(dirname(fromFile), specifier);
  else return null;
  if (/\.(json|css)$/.test(base)) return null;
  if (existsSync(base) && statSync(base).isFile()) return base;
  for (const ext of EXTENSIONS) {
    if (existsSync(base + ext)) return base + ext;
  }
  return null;
}

/** Source files reachable from the package entry points. */
export function collectPackageSources({ entryFiles, componentsRoot }) {
  const seen = new Set();
  const stack = [...entryFiles];
  while (stack.length) {
    const file = stack.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    const code = readFileSync(file, "utf8");
    for (const match of code.matchAll(IMPORT)) {
      const next = resolveImport(match[1] ?? match[2], file, componentsRoot);
      if (next && !seen.has(next) && !/\.(test|stories)\.[jt]sx?$/.test(next)) {
        stack.push(next);
      }
    }
  }
  return [...seen];
}

/** Subset of `locale` holding only the keys `sources` reference. */
export function subsetLocale(locale, sources) {
  const names = new Set();
  const prefixes = new Set();
  for (const file of sources) {
    const code = readFileSync(file, "utf8");
    for (const match of code.matchAll(LITERAL)) names.add(match[1]);
    for (const match of code.matchAll(TEMPLATE_PREFIX)) prefixes.add(match[1]);
  }
  const keep = (key) =>
    names.has(key) || [...prefixes].some((prefix) => key.startsWith(prefix));

  const out = {};
  for (const [key, value] of Object.entries(locale)) {
    if (keep(key)) {
      out[key] = value;
      continue;
    }
    // Nested namespaces: keep the dotted paths that are referenced.
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const nested = subsetLocale.nested(value, `${key}.`, keep);
      if (nested) out[key] = nested;
    }
  }
  return out;
}

subsetLocale.nested = function nested(value, path, keep) {
  let out = null;
  for (const [key, child] of Object.entries(value)) {
    const full = `${path}${key}`;
    if (keep(full)) {
      out ??= Array.isArray(value) ? [] : {};
      out[key] = child;
    } else if (child && typeof child === "object") {
      const inner = nested(child, `${full}.`, keep);
      if (inner) {
        out ??= Array.isArray(value) ? [] : {};
        out[key] = inner;
      }
    }
  }
  return out;
};

/** Vite plugin: serve the subset in place of the full English locale. */
export function packageLocaleSubset({ localeFile, entryFiles, componentsRoot }) {
  let subset = null;
  return {
    name: "dt-package-locale-subset",
    enforce: "pre",
    load(id) {
      if (id.split("?")[0] !== localeFile) return null;
      subset ??= subsetLocale(
        JSON.parse(readFileSync(localeFile, "utf8")),
        collectPackageSources({ entryFiles, componentsRoot }),
      );
      return JSON.stringify(subset);
    },
  };
}
