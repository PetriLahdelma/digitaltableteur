/**
 * Size normalization utilities for design system components
 *
 * Supports both legacy uppercase ("S", "M", "L") and modern lowercase ("sm", "md", "lg")
 * formats for consistent prop APIs across all components.
 *
 * @module sizeNormalization
 * @since 1.1.0
 */

/**
 * Legacy size format (uppercase single letters)
 */
export type SizeLegacy = "S" | "M" | "L";

/**
 * Modern size format (lowercase two letters)
 */
export type SizeModern = "sm" | "md" | "lg";

/**
 * Unified size type supporting both formats
 */
export type SizeUnified = SizeLegacy | SizeModern;

/**
 * Extended legacy title sizes (used by Title, Modal, Card components)
 */
export type TitleSizeLegacy = "XXS" | "XS" | "S" | "M" | "L" | "XL" | "XXL";

/**
 * Extended modern title sizes
 */
export type TitleSizeModern = "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";

/**
 * Unified title size type
 */
export type TitleSizeUnified = TitleSizeLegacy | TitleSizeModern;

/**
 * Size mapping from any format to modern lowercase
 */
const SIZE_MAP: Record<string, SizeModern> = {
  // Legacy uppercase
  S: "sm",
  M: "md",
  L: "lg",
  // Legacy lowercase single-letter
  s: "sm",
  m: "md",
  l: "lg",
  // Modern format (passthrough)
  sm: "sm",
  md: "md",
  lg: "lg",
};

/**
 * Title size mapping from any format to legacy uppercase
 * (Title component currently uses uppercase internally)
 */
const TITLE_SIZE_MAP: Record<string, TitleSizeLegacy> = {
  // Modern lowercase
  xxs: "XXS",
  xs: "XS",
  sm: "S",
  md: "M",
  lg: "L",
  xl: "XL",
  xxl: "XXL",
  // Legacy uppercase (passthrough)
  XXS: "XXS",
  XS: "XS",
  S: "S",
  M: "M",
  L: "L",
  XL: "XL",
  XXL: "XXL",
};

/**
 * Normalizes size props to modern lowercase format
 *
 * @param size - Size in any supported format
 * @returns Normalized size in modern format ("sm" | "md" | "lg")
 * @default "md"
 *
 * @example
 * ```typescript
 * normalizeSizeProp("S")   // → "sm"
 * normalizeSizeProp("m")   // → "md"
 * normalizeSizeProp("lg")  // → "lg"
 * normalizeSizeProp()      // → "md" (default)
 * ```
 */
export function normalizeSizeProp(size?: SizeUnified): SizeModern {
  if (!size) return "md";
  return SIZE_MAP[size] || "md";
}

/**
 * Normalizes title size props to legacy uppercase format
 * (Used by Title, Modal titleSize, Card titleProps)
 *
 * @param size - Title size in any supported format
 * @returns Normalized size in legacy format ("XXS" | "XS" | "S" | "M" | "L" | "XL" | "XXL")
 * @default "M"
 *
 * @example
 * ```typescript
 * normalizeTitleSize("sm")   // → "S"
 * normalizeTitleSize("M")    // → "M"
 * normalizeTitleSize("xl")   // → "XL"
 * normalizeTitleSize()       // → "M" (default)
 * ```
 */
export function normalizeTitleSize(size?: TitleSizeUnified): TitleSizeLegacy {
  if (!size) return "M";
  return TITLE_SIZE_MAP[size] || "M";
}

/**
 * Converts modern size to legacy format (for backward compatibility)
 *
 * @param size - Modern size format
 * @returns Legacy uppercase format
 *
 * @example
 * ```typescript
 * modernToLegacy("sm")  // → "S"
 * modernToLegacy("md")  // → "M"
 * modernToLegacy("lg")  // → "L"
 * ```
 */
export function modernToLegacy(size: SizeModern): SizeLegacy {
  const map: Record<SizeModern, SizeLegacy> = {
    sm: "S",
    md: "M",
    lg: "L",
  };
  return map[size];
}

/**
 * Converts legacy size to modern format
 *
 * @param size - Legacy uppercase format
 * @returns Modern lowercase format
 *
 * @example
 * ```typescript
 * legacyToModern("S")  // → "sm"
 * legacyToModern("M")  // → "md"
 * legacyToModern("L")  // → "lg"
 * ```
 */
export function legacyToModern(size: SizeLegacy): SizeModern {
  const map: Record<SizeLegacy, SizeModern> = {
    S: "sm",
    M: "md",
    L: "lg",
  };
  return map[size];
}

/**
 * Type guard to check if a size is in legacy format
 *
 * @param size - Size to check
 * @returns True if size is uppercase legacy format
 */
export function isLegacySize(size: string): size is SizeLegacy {
  return size === "S" || size === "M" || size === "L";
}

/**
 * Type guard to check if a size is in modern format
 *
 * @param size - Size to check
 * @returns True if size is lowercase modern format
 */
export function isModernSize(size: string): size is SizeModern {
  return size === "sm" || size === "md" || size === "lg";
}
