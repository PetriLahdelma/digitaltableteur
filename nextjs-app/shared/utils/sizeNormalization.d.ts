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
 * Title typography size, lowercase single-letter scale (what Title/Text accept).
 */
export type TitleSizeTypography = "xxs" | "xs" | "s" | "m" | "l" | "xl" | "xxl";
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
export declare function normalizeSizeProp(size?: SizeUnified): SizeModern;
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
 * normalizeTitleSize("sm")   // → "s"
 * normalizeTitleSize("M")    // → "m"
 * normalizeTitleSize("xl")   // → "xl"
 * normalizeTitleSize()       // → "m" (default)
 * ```
 */
export declare function normalizeTitleSize(size?: TitleSizeUnified): TitleSizeTypography;
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
export declare function modernToLegacy(size: SizeModern): SizeLegacy;
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
export declare function legacyToModern(size: SizeLegacy): SizeModern;
/**
 * Type guard to check if a size is in legacy format
 *
 * @param size - Size to check
 * @returns True if size is uppercase legacy format
 */
export declare function isLegacySize(size: string): size is SizeLegacy;
/**
 * Type guard to check if a size is in modern format
 *
 * @param size - Size to check
 * @returns True if size is lowercase modern format
 */
export declare function isModernSize(size: string): size is SizeModern;
//# sourceMappingURL=sizeNormalization.d.ts.map