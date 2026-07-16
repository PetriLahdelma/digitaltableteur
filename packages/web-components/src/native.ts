import { DtAlertBannerElement } from "./native/alert-banner";
import { DtAccordionElement } from "./native/accordion";
import { DtAspectRatioElement } from "./native/aspect-ratio";
import { DtAvatarElement } from "./native/avatar";
import { DtAvatarGroupElement } from "./native/avatar-group";
import { DtBadgeElement } from "./native/badge";
import { DtButtonElement } from "./native/button";
import { DtButtonGroupElement } from "./native/button-group";
import { DtCardElement } from "./native/card";
import { DtCenterElement } from "./native/center";
import { DtContainerElement } from "./native/container";
import { DtComboboxElement } from "./native/combobox";
import { DtCommandPaletteElement } from "./native/command-palette";
import { DtCookieConsentElement } from "./native/cookie-consent";
import { DtDividerElement } from "./native/divider";
import { DtDisplayElement } from "./native/display";
import { DtEmptyStateElement } from "./native/empty-state";
import { DtExpandableSectionElement } from "./native/expandable-section";
import { DtFilterChipElement } from "./native/filter-chip";
import { DtFlexBoxElement } from "./native/flex-box";
import { DtGridElement } from "./native/grid";
import { DtIconElement } from "./native/icon";
import { DtIconButtonElement } from "./native/icon-button";
import { DtKbdElement } from "./native/kbd";
import { DtLanguageSwitcherElement } from "./native/language-switcher";
import { DtLinkElement } from "./native/link";
import { DtListElement } from "./native/list";
import { DtMenuElement } from "./native/menu";
import { DtModalElement } from "./native/modal";
import { DtMultiComboboxElement } from "./native/multi-combobox";
import { DtLabelElement } from "./native/label";
import { DtHelperTextElement } from "./native/helper-text";
import { DtFormFieldElement } from "./native/form-field";
import { DtNavLinkElement } from "./native/nav-link";
import { DtNavMenuListElement } from "./native/nav-menu-list";
import { DtPhoneInputElement } from "./native/phone-input";
import { DtProgressElement } from "./native/progress";
import { DtSkipLinkElement } from "./native/skip-link";
import { DtSpinnerElement } from "./native/spinner";
import { DtSpacerElement } from "./native/spacer";
import { DtStatusDotElement } from "./native/status-dot";
import { DtSectionElement } from "./native/section";
import { DtSegmentedControlElement } from "./native/segmented-control";
import { DtSplitButtonElement } from "./native/split-button";
import { DtStackElement } from "./native/stack";
import { DtTextElement } from "./native/text";
import { DtTitleElement } from "./native/title";
import { DtTextInputElement } from "./native/text-input";
import { DtTextAreaElement } from "./native/text-area";
import { DtCheckboxElement } from "./native/checkbox";
import { DtCheckboxGroupElement } from "./native/checkbox-group";
import { DtRadioElement } from "./native/radio";
import { DtRadioGroupElement } from "./native/radio-group";
import { DtSelectElement } from "./native/select";
import { DtSelectOptionElement } from "./native/select-option";
import { DtSkeletonElement } from "./native/skeleton";
import { DtSwitchElement } from "./native/switch";
import { DtTabsElement } from "./native/tabs";
import { DtTooltipElement } from "./native/tooltip";
import { DtToastElement } from "./native/toast";
import { DtToastStackElement } from "./native/toast-stack";
import { DtVisuallyHiddenElement } from "./native/visually-hidden";
import { defineElementSet, type ElementDefinition } from "./registry";

export { DtAlertBannerElement } from "./native/alert-banner";
export type {
  DtAlertBannerAriaLive,
  DtAlertBannerTone,
} from "./native/alert-banner";
export { DtAccordionElement } from "./native/accordion";
export type {
  DtAccordionItem,
  DtAccordionType,
  DtAccordionVariant,
} from "./native/accordion";
export { DtAspectRatioElement } from "./native/aspect-ratio";
export type { DtAspectRatioRatio } from "./native/aspect-ratio";
export { DtAvatarElement } from "./native/avatar";
export type {
  DtAvatarDecoding,
  DtAvatarLoading,
  DtAvatarMenuItem,
  DtAvatarVariant,
} from "./native/avatar";
export { DtAvatarGroupElement } from "./native/avatar-group";
export type { DtAvatarGroupSize } from "./native/avatar-group";
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
export { DtComboboxElement } from "./native/combobox";
export type { DtComboboxOption } from "./native/combobox";
export { DtCommandPaletteElement } from "./native/command-palette";
export type {
  DtCommandPaletteDismissReason,
  DtCommandPaletteItem,
} from "./native/command-palette";
export { DtCookieConsentElement } from "./native/cookie-consent";
export type {
  DtCookieConsentCategory,
  DtCookieConsentChangeDetail,
  DtCookieConsentChangeType,
  DtCookieConsentPersistence,
  DtCookieConsentStoredState,
  DtCookieConsentValue,
} from "./native/cookie-consent";
export { DtEmptyStateElement } from "./native/empty-state";
export type {
  DtEmptyStateHeadingLevel,
  DtEmptyStateSize,
} from "./native/empty-state";
export { DtExpandableSectionElement } from "./native/expandable-section";
export { DtFilterChipElement } from "./native/filter-chip";
export type {
  DtFilterChipSize,
  DtFilterChipVariant,
} from "./native/filter-chip";
export { DtDividerElement } from "./native/divider";
export type { DtDividerOrientation } from "./native/divider";
export { DtDisplayElement } from "./native/display";
export type { DtDisplayTag } from "./native/display";
export { DtFlexBoxElement } from "./native/flex-box";
export type {
  DtFlexBoxAlign,
  DtFlexBoxAlignContent,
  DtFlexBoxDirection,
  DtFlexBoxJustify,
  DtFlexBoxWrap,
} from "./native/flex-box";
export { DtGridElement } from "./native/grid";
export { DtIconElement } from "./native/icon";
export type { DtIconFlip, DtIconSize, DtIconWeight } from "./native/icon";
export { DtIconButtonElement } from "./native/icon-button";
export type {
  DtIconButtonSize,
  DtIconButtonSurface,
  DtIconButtonTone,
  DtIconButtonVariant,
} from "./native/icon-button";
export { DtKbdElement } from "./native/kbd";
export type { DtKbdSize } from "./native/kbd";
export { DtLanguageSwitcherElement } from "./native/language-switcher";
export type { DtLanguageSwitcherOption } from "./native/language-switcher";
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
export { DtMenuElement } from "./native/menu";
export type { DtMenuAlign, DtMenuItem, DtMenuSide } from "./native/menu";
export { DtModalElement } from "./native/modal";
export type {
  DtModalAnimation,
  DtModalDismissReason,
  DtModalIconSize,
  DtModalSeverity,
} from "./native/modal";
export { DtMultiComboboxElement } from "./native/multi-combobox";
export type {
  DtMultiComboboxOption,
  DtMultiComboboxValue,
} from "./native/multi-combobox";
export { DtLabelElement } from "./native/label";
export { DtHelperTextElement } from "./native/helper-text";
export type { DtHelperTextState } from "./native/helper-text";
export { DtFormFieldElement } from "./native/form-field";
export { DtNavLinkElement } from "./native/nav-link";
export { DtNavMenuListElement } from "./native/nav-menu-list";
export type { DtNavMenuItem } from "./native/nav-menu-list";
export { DtPhoneInputElement } from "./native/phone-input";
export type {
  DtPhoneInputCountry,
  DtPhoneInputValue,
} from "./native/phone-input";
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
export { DtSegmentedControlElement } from "./native/segmented-control";
export type {
  DtSegmentedControlItem,
  DtSegmentedControlOrientation,
  DtSegmentedControlSize,
} from "./native/segmented-control";
export { DtSplitButtonElement } from "./native/split-button";
export type {
  DtSplitButtonMenuAlign,
  DtSplitButtonOption,
  DtSplitButtonSize,
  DtSplitButtonSurface,
  DtSplitButtonVariant,
} from "./native/split-button";
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
export { DtCheckboxGroupElement } from "./native/checkbox-group";
export { DtRadioElement } from "./native/radio";
export type { DtRadioSize } from "./native/radio";
export { DtRadioGroupElement } from "./native/radio-group";
export type { DtRadioGroupOrientation } from "./native/radio-group";
export { DtSelectElement } from "./native/select";
export type { DtSelectOptionItem, DtSelectSize } from "./native/select";
export { DtSelectOptionElement } from "./native/select-option";
export { DtSkeletonElement } from "./native/skeleton";
export type { DtSkeletonVariant } from "./native/skeleton";
export { DtSwitchElement } from "./native/switch";
export type { DtSwitchLabelPlacement, DtSwitchSize } from "./native/switch";
export { DtTabsElement } from "./native/tabs";
export type {
  DtTabItem,
  DtTabsActivation,
  DtTabsOrientation,
  DtTabsSize,
  DtTabsVariant,
} from "./native/tabs";
export { DtTooltipElement } from "./native/tooltip";
export type { DtTooltipPlacement } from "./native/tooltip";
export { DtToastElement } from "./native/toast";
export type {
  DtToastPosition,
  DtToastSize,
  DtToastTone,
} from "./native/toast";
export { DtToastStackElement } from "./native/toast-stack";
export type {
  DtToastStackItem,
  DtToastStackPosition,
  DtToastStackSize,
  DtToastStackTone,
} from "./native/toast-stack";
export { DtVisuallyHiddenElement } from "./native/visually-hidden";
export type { DtVisuallyHiddenTag } from "./native/visually-hidden";

export const nativeElementDefinitions = [
  ["dt-icon", DtIconElement],
  ["dt-button", DtButtonElement],
  ["dt-icon-button", DtIconButtonElement],
  ["dt-button-group", DtButtonGroupElement],
  ["dt-filter-chip", DtFilterChipElement],
  ["dt-command-palette", DtCommandPaletteElement],
  ["dt-link", DtLinkElement],
  ["dt-nav-link", DtNavLinkElement],
  ["dt-nav-menu-list", DtNavMenuListElement],
  ["dt-language-switcher", DtLanguageSwitcherElement],
  ["dt-skip-link", DtSkipLinkElement],
  ["dt-badge", DtBadgeElement],
  ["dt-avatar", DtAvatarElement],
  ["dt-avatar-group", DtAvatarGroupElement],
  ["dt-status-dot", DtStatusDotElement],
  ["dt-toast", DtToastElement],
  ["dt-toast-stack", DtToastStackElement],
  ["dt-divider", DtDividerElement],
  ["dt-display", DtDisplayElement],
  ["dt-spinner", DtSpinnerElement],
  ["dt-progress", DtProgressElement],
  ["dt-alert-banner", DtAlertBannerElement],
  ["dt-text", DtTextElement],
  ["dt-title", DtTitleElement],
  ["dt-list", DtListElement],
  ["dt-kbd", DtKbdElement],
  ["dt-section", DtSectionElement],
  ["dt-stack", DtStackElement],
  ["dt-flex-box", DtFlexBoxElement],
  ["dt-grid", DtGridElement],
  ["dt-card", DtCardElement],
  ["dt-center", DtCenterElement],
  ["dt-container", DtContainerElement],
  ["dt-spacer", DtSpacerElement],
  ["dt-aspect-ratio", DtAspectRatioElement],
  ["dt-empty-state", DtEmptyStateElement],
  ["dt-label", DtLabelElement],
  ["dt-helper-text", DtHelperTextElement],
  ["dt-form-field", DtFormFieldElement],
  ["dt-text-input", DtTextInputElement],
  ["dt-text-area", DtTextAreaElement],
  ["dt-phone-input", DtPhoneInputElement],
  ["dt-checkbox", DtCheckboxElement],
  ["dt-checkbox-group", DtCheckboxGroupElement],
  ["dt-radio", DtRadioElement],
  ["dt-radio-group", DtRadioGroupElement],
  ["dt-select", DtSelectElement],
  ["dt-select-option", DtSelectOptionElement],
  ["dt-combobox", DtComboboxElement],
  ["dt-multi-combobox", DtMultiComboboxElement],
  ["dt-switch", DtSwitchElement],
  ["dt-modal", DtModalElement],
  ["dt-cookie-consent", DtCookieConsentElement],
  ["dt-tooltip", DtTooltipElement],
  ["dt-menu", DtMenuElement],
  ["dt-split-button", DtSplitButtonElement],
  ["dt-tabs", DtTabsElement],
  ["dt-segmented-control", DtSegmentedControlElement],
  ["dt-accordion", DtAccordionElement],
  ["dt-expandable-section", DtExpandableSectionElement],
  ["dt-skeleton", DtSkeletonElement],
  ["dt-visually-hidden", DtVisuallyHiddenElement],
] as const satisfies readonly ElementDefinition[];

export function defineNativeElements(
  registry?: CustomElementRegistry,
): readonly string[] {
  return defineElementSet(nativeElementDefinitions, registry);
}
