/**
 * Deprecation Warning Utility
 *
 * Provides a set of utilities for warning developers about deprecated component props
 * and guiding them toward migration paths.
 *
 * Features:
 * - Single warning per prop per session (deduplication via Set)
 * - Environment-aware (development only)
 * - Colored console output for better visibility
 * - Links to migration guides
 * - Clear, actionable messages
 *
 * @example
 * ```typescript
 * if (disabled !== undefined && isDisabled === undefined) {
 *   warnDeprecated('Button', 'disabled', 'isDisabled', 'Will be removed in v2.0.0');
 * }
 * ```
 */
/**
 * Main deprecation warning function
 *
 * Warns about a deprecated prop and suggests a replacement. Only warns once per
 * prop per session (in development mode).
 *
 * @param componentName - Name of the component (e.g., 'Button')
 * @param oldProp - The deprecated prop name
 * @param newProp - The new prop name to use instead
 * @param additionalContext - Optional additional context (e.g., removal timeline)
 *
 * @example
 * ```typescript
 * if (disabled !== undefined && isDisabled === undefined) {
 *   warnDeprecated('Button', 'disabled', 'isDisabled', 'Will be removed in v2.0.0');
 * }
 * ```
 */
export declare function warnDeprecated(componentName: string, oldProp: string, newProp: string, additionalContext?: string): void;
/**
 * Warns about a simple prop rename
 *
 * Shorthand for renaming a prop with a standard message. Automatically adds
 * "Will be removed in v2.0.0" context.
 *
 * @param componentName - Name of the component (e.g., 'Button')
 * @param oldProp - The deprecated prop name
 * @param newProp - The new prop name to use instead
 *
 * @example
 * ```typescript
 * if (disabled !== undefined && isDisabled === undefined) {
 *   warnPropRename('Button', 'disabled', 'isDisabled');
 * }
 * ```
 */
export declare function warnPropRename(componentName: string, oldProp: string, newProp: string): void;
/**
 * Warns about a removed prop with suggested workaround
 *
 * Used for props that have been removed entirely, with a suggested workaround
 * or alternative approach.
 *
 * @param componentName - Name of the component (e.g., 'Button')
 * @param oldProp - The removed prop name
 * @param replacement - Description of the replacement or workaround
 *
 * @example
 * ```typescript
 * if (colorScheme !== undefined) {
 *   warnPropRemoved('Button', 'colorScheme', 'Use the "variant" prop instead for color control');
 * }
 * ```
 */
export declare function warnPropRemoved(componentName: string, oldProp: string, replacement: string): void;
/**
 * Clears all tracked warnings (useful for testing)
 * @internal
 */
export declare function clearTrackedWarnings(): void;
/**
 * Gets the set of currently tracked warnings (useful for testing)
 * @internal
 */
export declare function getTrackedWarnings(): Set<string>;
//# sourceMappingURL=deprecationWarning.d.ts.map