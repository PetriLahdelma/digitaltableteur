import { DtAlertBannerElement } from "./native/alert-banner";
import { DtBadgeElement } from "./native/badge";
import { DtButtonElement } from "./native/button";
import { DtDividerElement } from "./native/divider";
import { DtIconElement } from "./native/icon";
import { DtProgressElement } from "./native/progress";
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
export { DtDividerElement } from "./native/divider";
export type { DtDividerOrientation } from "./native/divider";
export { DtIconElement } from "./native/icon";
export type { DtIconFlip, DtIconSize, DtIconWeight } from "./native/icon";
export { DtProgressElement } from "./native/progress";
export type { DtProgressSize, DtProgressState } from "./native/progress";
export { DtSpinnerElement } from "./native/spinner";
export type { DtSpinnerSize } from "./native/spinner";
export { DtStatusDotElement } from "./native/status-dot";
export type { DtStatusDotSize, DtStatusDotTone } from "./native/status-dot";

export const nativeElementDefinitions = [
  ["dt-icon", DtIconElement],
  ["dt-button", DtButtonElement],
  ["dt-badge", DtBadgeElement],
  ["dt-status-dot", DtStatusDotElement],
  ["dt-divider", DtDividerElement],
  ["dt-spinner", DtSpinnerElement],
  ["dt-progress", DtProgressElement],
  ["dt-alert-banner", DtAlertBannerElement],
] as const satisfies readonly ElementDefinition[];

export function defineNativeElements(
  registry?: CustomElementRegistry,
): readonly string[] {
  return defineElementSet(nativeElementDefinitions, registry);
}
