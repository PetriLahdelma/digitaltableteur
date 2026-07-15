import {
  DigitaltableteurElement,
  enumAttribute,
  hasNamedSlot,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";

const VARIANTS = ["primary", "secondary", "tertiary"] as const;
const TONES = ["neutral", "error", "warning", "success", "info"] as const;
const SIZES = ["sm", "md", "lg"] as const;
const SURFACES = ["default", "onDark", "onBrand"] as const;
export type DtIconButtonVariant = (typeof VARIANTS)[number];
export type DtIconButtonTone = (typeof TONES)[number];
export type DtIconButtonSize = (typeof SIZES)[number];
export type DtIconButtonSurface = (typeof SURFACES)[number];

const styles = `
  :host { display: inline-block; vertical-align: middle; }
  :host([hidden]) { display: none; }
  dt-button { display: block; }
`;

export class DtIconButtonElement extends DigitaltableteurElement {
  static formAssociated = true;
  static observedAttributes = [
    "icon",
    "label",
    "variant",
    "tone",
    "surface",
    "size",
    "tooltip",
    "disabled",
    "loading",
    "submits",
    "data-dt-group-position",
  ];
  private button: (HTMLElement & { click(): void }) | null = null;
  private formDisabled = false;
  private readonly internals =
    typeof this.attachInternals === "function" ? this.attachInternals() : null;

  connectedCallback(): void {
    this.render();
    this.observeLightDom(() => this.render());
  }
  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }
  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
    this.render();
  }
  get icon(): string {
    return stringAttribute(this, "icon");
  }
  set icon(value: string) {
    reflectAttribute(this, "icon", value || null);
  }
  get label(): string {
    return stringAttribute(this, "label");
  }
  set label(value: string) {
    reflectAttribute(this, "label", value || null);
  }
  get variant(): DtIconButtonVariant {
    return enumAttribute(this, "variant", VARIANTS, "tertiary");
  }
  set variant(value: DtIconButtonVariant) {
    reflectAttribute(this, "variant", value);
  }
  get tone(): DtIconButtonTone {
    return enumAttribute(this, "tone", TONES, "neutral");
  }
  set tone(value: DtIconButtonTone) {
    reflectAttribute(this, "tone", value);
  }
  get surface(): DtIconButtonSurface {
    return enumAttribute(this, "surface", SURFACES, "default");
  }
  set surface(value: DtIconButtonSurface) {
    reflectAttribute(this, "surface", value);
  }
  get size(): DtIconButtonSize {
    return enumAttribute(this, "size", SIZES, "md");
  }
  set size(value: DtIconButtonSize) {
    reflectAttribute(this, "size", value);
  }
  get tooltip(): string {
    return stringAttribute(this, "tooltip");
  }
  set tooltip(value: string) {
    reflectAttribute(this, "tooltip", value || null);
  }
  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }
  set disabled(value: boolean) {
    reflectBooleanAttribute(this, "disabled", value);
  }
  get loading(): boolean {
    return this.hasAttribute("loading");
  }
  set loading(value: boolean) {
    reflectBooleanAttribute(this, "loading", value);
  }
  get submits(): boolean {
    return this.hasAttribute("submits");
  }
  set submits(value: boolean) {
    reflectBooleanAttribute(this, "submits", value);
  }
  get form(): HTMLFormElement | null {
    return this.internals?.form ?? null;
  }
  click(): void {
    if (this.disabled || this.loading || this.formDisabled) return;
    this.button?.click();
  }
  private render(): void {
    const button = this.ownerDocument.createElement(
      "dt-button",
    ) as HTMLElement & {
      click(): void;
    };
    button.setAttribute("variant", this.variant);
    button.setAttribute("tone", this.tone);
    button.setAttribute("surface", this.surface);
    button.setAttribute("size", this.size);
    button.setAttribute("rounded", "");
    button.setAttribute("accessible-name", this.label);
    button.setAttribute("exportparts", "control,icon");
    if (this.icon) button.setAttribute("icon", this.icon);
    if (this.tooltip) button.setAttribute("tooltip", this.tooltip);
    if (this.disabled || this.formDisabled) button.setAttribute("disabled", "");
    if (this.loading) button.setAttribute("loading", "");
    if (this.submits) {
      button.setAttribute("submits", "");
      button.addEventListener("click", (event) => {
        queueMicrotask(() => {
          if (!event.defaultPrevented) this.form?.requestSubmit();
        });
      });
    }
    const groupPosition = this.getAttribute("data-dt-group-position");
    if (groupPosition) {
      button.setAttribute("data-dt-group-position", groupPosition);
    }
    if (hasNamedSlot(this, "icon")) {
      const iconSlot = this.ownerDocument.createElement("slot");
      iconSlot.name = "icon";
      iconSlot.slot = "icon";
      button.append(iconSlot);
    }
    this.button = button;
    this.replaceShadow(styles, button);
  }
}
