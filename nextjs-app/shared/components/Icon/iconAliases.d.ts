/**
 * Icon-name resolution data, shared by the runtime registry (iconRegistry.ts)
 * and the build-time codegen (scripts/design-system/build-icon-registry.mjs).
 * No React / component imports here so both sides can consume it without a
 * circular dependency on the generated icon set.
 */
/** Legacy FontAwesome-style slugs and kebab names → Phosphor PascalCase names. */
export declare const ICON_ALIASES: Record<string, string>;
/** kebab / snake / space separated → PascalCase (e.g. "caret-left" → "CaretLeft"). */
export declare const toPascalCase: (value: string) => string;
/**
 * Resolve a raw icon name to a Phosphor PascalCase export name, or null.
 * `isKnown` decides whether a candidate is a real Phosphor icon — at runtime
 * that's "present in the bundled set", at build time it's "present in the full
 * Phosphor package". Alias hits are trusted without an isKnown check so the
 * curated alias map stays authoritative.
 */
export declare function resolveIconName(rawName: string, isKnown: (name: string) => boolean): string | null;
//# sourceMappingURL=iconAliases.d.ts.map