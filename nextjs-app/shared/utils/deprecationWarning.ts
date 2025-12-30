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

/** Set to track which deprecation warnings have already been shown */
const shownWarnings = new Set<string>();

/** GitHub repository URL for migration guides */
const MIGRATION_GUIDE_BASE_URL =
  "https://github.com/petrilahdelma/digitaltableteur/tree/main/docs";

/**
 * Generates a unique key for a deprecation warning
 * @internal
 */
function getWarningKey(
  componentName: string,
  oldProp: string,
  newProp?: string
): string {
  return `${componentName}::${oldProp}${newProp ? `::${newProp}` : ""}`;
}

/**
 * Checks if we're in a development environment
 * @internal
 */
function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Formats a console warning message with styling
 * @internal
 */
function createWarningMessage(
  componentName: string,
  oldProp: string,
  newProp?: string,
  additionalContext?: string
): string[] {
  const messages: string[] = [];

  // Main deprecation notice
  messages.push(
    `%c⚠️  [${componentName}] Prop "${oldProp}" is deprecated${newProp ? ` and will be removed in v2.0.0` : ""}`
  );

  // Replacement prop suggestion
  if (newProp) {
    messages.push(`%c   → Use "${newProp}" instead`);
  }

  // Additional context (e.g., removal timeline)
  if (additionalContext) {
    messages.push(`%c   ℹ️  ${additionalContext}`);
  }

  // Migration guide link
  messages.push(
    `%c   📖 Migration guide: ${MIGRATION_GUIDE_BASE_URL}/MIGRATION_GUIDE.md#${componentName.toLowerCase()}-props`
  );

  return messages;
}

/**
 * Logs a deprecation warning with styling
 * @internal
 */
function logDeprecationWarning(message: string[]): void {
  const baseStyle =
    "color: #ff6b00; font-weight: bold; font-size: 14px; padding: 2px 4px;";
  const suggestStyle =
    "color: #ff8c00; font-size: 13px; font-family: monospace; padding: 0 4px;";
  const infoStyle =
    "color: #ff9900; font-size: 13px; padding: 0 4px; margin-top: 4px;";
  const linkStyle =
    "color: #0066cc; font-size: 13px; text-decoration: underline; padding: 0 4px;";

  const styles = [baseStyle, suggestStyle, infoStyle, linkStyle];

  // Log with styles
  console.warn(message[0], styles[0]);
  for (let i = 1; i < message.length; i++) {
    console.warn(message[i], styles[Math.min(i, styles.length - 1)]);
  }
}

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
export function warnDeprecated(
  componentName: string,
  oldProp: string,
  newProp: string,
  additionalContext?: string
): void {
  if (!isDevelopment()) {
    return;
  }

  const warningKey = getWarningKey(componentName, oldProp, newProp);

  // Only warn once per prop per session
  if (shownWarnings.has(warningKey)) {
    return;
  }

  shownWarnings.add(warningKey);

  const message = createWarningMessage(
    componentName,
    oldProp,
    newProp,
    additionalContext
  );
  logDeprecationWarning(message);
}

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
export function warnPropRename(
  componentName: string,
  oldProp: string,
  newProp: string
): void {
  warnDeprecated(
    componentName,
    oldProp,
    newProp,
    "Will be removed in v2.0.0"
  );
}

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
export function warnPropRemoved(
  componentName: string,
  oldProp: string,
  replacement: string
): void {
  if (!isDevelopment()) {
    return;
  }

  const warningKey = getWarningKey(componentName, oldProp);

  // Only warn once per prop per session
  if (shownWarnings.has(warningKey)) {
    return;
  }

  shownWarnings.add(warningKey);

  const messages: string[] = [];
  messages.push(
    `%c⚠️  [${componentName}] Prop "${oldProp}" has been removed`
  );
  messages.push(`%c   → ${replacement}`);
  messages.push(
    `%c   📖 Migration guide: ${MIGRATION_GUIDE_BASE_URL}/MIGRATION_GUIDE.md#${componentName.toLowerCase()}-props`
  );

  logDeprecationWarning(messages);
}

/**
 * Clears all tracked warnings (useful for testing)
 * @internal
 */
export function clearTrackedWarnings(): void {
  shownWarnings.clear();
}

/**
 * Gets the set of currently tracked warnings (useful for testing)
 * @internal
 */
export function getTrackedWarnings(): Set<string> {
  return new Set(shownWarnings);
}
