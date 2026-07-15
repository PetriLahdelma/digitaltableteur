import { DtAlertBannerElement } from "./native/alert-banner";
import { DtAspectRatioElement } from "./native/aspect-ratio";
import { DtBadgeElement } from "./native/badge";
import { DtButtonElement } from "./native/button";
import { DtButtonGroupElement } from "./native/button-group";
import { DtCardElement } from "./native/card";
import { DtCenterElement } from "./native/center";
import { DtContainerElement } from "./native/container";
import { DtDividerElement } from "./native/divider";
import { DtEmptyStateElement } from "./native/empty-state";
import { DtFilterChipElement } from "./native/filter-chip";
import { DtIconElement } from "./native/icon";
import { DtIconButtonElement } from "./native/icon-button";
import { DtLinkElement } from "./native/link";
import { DtListElement } from "./native/list";
import { DtNavLinkElement } from "./native/nav-link";
import { DtProgressElement } from "./native/progress";
import { DtSkipLinkElement } from "./native/skip-link";
import { DtSpinnerElement } from "./native/spinner";
import { DtSpacerElement } from "./native/spacer";
import { DtStatusDotElement } from "./native/status-dot";
import { DtSectionElement } from "./native/section";
import { DtStackElement } from "./native/stack";
import { DtTextElement } from "./native/text";
import { DtTitleElement } from "./native/title";
import { DtTextInputElement } from "./native/text-input";
import { DtTextAreaElement } from "./native/text-area";
import { DtCheckboxElement } from "./native/checkbox";
import { DtSwitchElement } from "./native/switch";
import { defineElementSet, type ElementDefinition } from "./registry";

export { DtAlertBannerElement } from "./native/alert-banner";
export type {
  DtAlertBannerAriaLive,
  DtAlertBannerTone,
} from "./native/alert-banner";
export { DtAspectRatioElement } from "./native/aspect-ratio";
export type { DtAspectRatioRatio } from "./native/aspect-ratio";
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
export { DtCardElement } from "./native/card";
export type {
  DtCardDescriptionSettings,
  DtCardDescriptionSize,
  DtCardDescriptionTag,
  DtCardPadding,
  DtCardTag,
  DtCardTextSize,
  DtCardTitleLevel,
  DtCardTitleSettings,
  DtCardTitleSize,
  DtCardTitleTag,
  DtCardVariant,
} from "./native/card";
export { DtCenterElement } from "./native/center";
export type { DtCenterTag } from "./native/center";
export { DtContainerElement } from "./native/container";
export type {
  DtContainerCenterValue,
  DtContainerSize,
  DtContainerTag,
} from "./native/container";
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
export { DtListElement } from "./native/list";
export type {
  DtListLineHeight,
  DtListSize,
  DtListSpacing,
  DtListStyleType,
  DtListTag,
} from "./native/list";
export { DtNavLinkElement } from "./native/nav-link";
export { DtProgressElement } from "./native/progress";
export type { DtProgressSize, DtProgressState } from "./native/progress";
export { DtSpinnerElement } from "./native/spinner";
export type { DtSpinnerSize } from "./native/spinner";
export { DtSpacerElement } from "./native/spacer";
export type { DtSpacerAxis, DtSpacerSize } from "./native/spacer";
export { DtSkipLinkElement } from "./native/skip-link";
export { DtStatusDotElement } from "./native/status-dot";
export type { DtStatusDotSize, DtStatusDotTone } from "./native/status-dot";
export { DtSectionElement } from "./native/section";
export type { DtSectionBackground, DtSectionSpacing } from "./native/section";
export { DtStackElement } from "./native/stack";
export type {
  DtStackAlign,
  DtStackDirection,
  DtStackGap,
  DtStackJustify,
  DtStackTag,
} from "./native/stack";
export { DtTextElement } from "./native/text";
export type { DtTextLineHeight, DtTextSize, DtTextTag } from "./native/text";
export { DtTitleElement } from "./native/title";
export type {
  DtTitleLevel,
  DtTitleLineHeight,
  DtTitleSize,
  DtTitleTag,
} from "./native/title";
export { DtTextInputElement } from "./native/text-input";
export type { DtTextInputSize, DtTextInputType } from "./native/text-input";
export { DtTextAreaElement } from "./native/text-area";
export { DtCheckboxElement } from "./native/checkbox";
export type { DtCheckboxSize } from "./native/checkbox";
export { DtSwitchElement } from "./native/switch";
export type { DtSwitchLabelPlacement, DtSwitchSize } from "./native/switch";

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
  ["dt-text", DtTextElement],
  ["dt-title", DtTitleElement],
  ["dt-list", DtListElement],
  ["dt-section", DtSectionElement],
  ["dt-stack", DtStackElement],
  ["dt-card", DtCardElement],
  ["dt-center", DtCenterElement],
  ["dt-container", DtContainerElement],
  ["dt-spacer", DtSpacerElement],
  ["dt-aspect-ratio", DtAspectRatioElement],
  ["dt-empty-state", DtEmptyStateElement],
  ["dt-text-input", DtTextInputElement],
  ["dt-text-area", DtTextAreaElement],
  ["dt-checkbox", DtCheckboxElement],
  ["dt-switch", DtSwitchElement],
] as const satisfies readonly ElementDefinition[];

export function defineNativeElements(
  registry?: CustomElementRegistry,
): readonly string[] {
  return defineElementSet(nativeElementDefinitions, registry);
}
