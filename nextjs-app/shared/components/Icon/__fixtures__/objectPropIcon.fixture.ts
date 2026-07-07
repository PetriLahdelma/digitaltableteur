/**
 * Fixture for build-icon-registry object-property scanning.
 *
 * `archive` is a real Phosphor icon that is NOT referenced by any JSX
 * `icon=`/`name=` literal and is NOT in CURATED_ICONS — so the only way it can
 * end up in iconRegistry.discovered.ts is via the scanner picking up the
 * object-property `icon: "…"` literal below (the config-driven shape used by
 * e.g. Tabs' TabItem.icon). The object-props test asserts it resolves; if the
 * object-property scanning regresses, the next `build:icons` drops `archive`
 * and that test fails.
 */
export const OBJECT_PROP_ICON_FIXTURE = [
  { id: "archive-fixture", icon: "archive" },
] as const;
