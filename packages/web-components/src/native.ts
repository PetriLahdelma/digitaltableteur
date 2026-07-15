import { DtAlertBannerElement } from "./native/alert-banner";
import { DtBadgeElement } from "./native/badge";
import { DtButtonElement } from "./native/button";
import { DtButtonGroupElement } from "./native/button-group";
import { DtDividerElement } from "./native/divider";
import { DtEmptyStateElement } from "./native/empty-state";
import { DtFilterChipElement } from "./native/filter-chip";
import { DtIconElement } from "./native/icon";
import { DtIconButtonElement } from "./native/icon-button";
import { DtLinkElement } from "./native/link";
import { DtNavLinkElement } from "./native/nav-link";
import { DtProgressElement } from "./native/progress";
import { DtSkipLinkElement } from "./native/skip-link";
import { DtSpinnerElement } from "./native/spinner";
import { DtStatusDotElement } from "./native/status-dot";
import { defineElementSet, type ElementDefinition } from "./registry";

export { DtAlertBannerElement } from "./native/alert-banner";
export type {
  DtAlertBannerAriaLive,
  DtAlertBannerTone,
} from "./native/alert-banner";
export { DtBadgeElement } from "./native/badge";
export type { DtBadgeSize, DtBadgeTone, DtBadgeVariant } from "./native/badge";
export { DtButtonElement } from "./native/button";
export type {
  DtButtonSize,
  DtButtonSurface,
  DtButtonTone,
  DtButtonVariant,
} from "./native/button";
export { DtButtonGroupElement } from "./native/button-group";
export { DtEmptyStateElement } from "./native/empty-state";
export type {
  DtEmptyStateHeadingLevel,
  DtEmptyStateSize,
} from "./native/empty-state";
export { DtFilterChipElement } from "./native/filter-chip";
export type {
  DtFilterChipSize,
  DtFilterChipVariant,
} from "./native/filter-chip";
export { DtDividerElement } from "./native/divider";
export type { DtDividerOrientation } from "./native/divider";
export { DtIconElement } from "./native/icon";
export type { DtIconFlip, DtIconSize, DtIconWeight } from "./native/icon";
export { DtIconButtonElement } from "./native/icon-button";
export type {
  DtIconButtonSize,
  DtIconButtonSurface,
  DtIconButtonTone,
  DtIconButtonVariant,
} from "./native/icon-button";
export { DtLinkElement } from "./native/link";
export type { DtLinkSize, DtLinkUnderline } from "./native/link";
export { DtNavLinkElement } from "./native/nav-link";
export { DtProgressElement } from "./native/progress";
export type { DtProgressSize, DtProgressState } from "./native/progress";
export { DtSpinnerElement } from "./native/spinner";
export type { DtSpinnerSize } from "./native/spinner";
export { DtSkipLinkElement } from "./native/skip-link";
export { DtStatusDotElement } from "./native/status-dot";
export type { DtStatusDotSize, DtStatusDotTone } from "./native/status-dot";

export const nativeElementDefinitions = [
  ["dt-icon", DtIconElement],
  ["dt-button", DtButtonElement],
  ["dt-icon-button", DtIconButtonElement],
  ["dt-button-group", DtButtonGroupElement],
  ["dt-filter-chip", DtFilterChipElement],
  ["dt-link", DtLinkElement],
  ["dt-nav-link", DtNavLinkElement],
  ["dt-skip-link", DtSkipLinkElement],
  ["dt-badge", DtBadgeElement],
  ["dt-status-dot", DtStatusDotElement],
  ["dt-divider", DtDividerElement],
  ["dt-spinner", DtSpinnerElement],
  ["dt-progress", DtProgressElement],
  ["dt-alert-banner", DtAlertBannerElement],
  ["dt-empty-state", DtEmptyStateElement],
] as const satisfies readonly ElementDefinition[];

export function defineNativeElements(
  registry?: CustomElementRegistry,
): readonly string[] {
  return defineElementSet(nativeElementDefinitions, registry);
}
