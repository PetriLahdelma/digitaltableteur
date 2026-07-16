import {
  DigitaltableteurElement,
  enumAttribute,
  hasDefaultSlotContent,
  hasNamedSlot,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";

const VARIANTS = ["primary", "secondary", "tertiary"] as const;
const TONES = ["neutral", "error", "warning", "success", "info"] as const;
const SIZES = ["sm", "md", "lg"] as const;
const SURFACES = ["default", "onDark", "onBrand"] as const;

export type DtButtonVariant = (typeof VARIANTS)[number];
export type DtButtonTone = (typeof TONES)[number];
export type DtButtonSize = (typeof SIZES)[number];
export type DtButtonSurface = (typeof SURFACES)[number];

const toneIcons: Partial<Record<DtButtonTone, string>> = {
  error: "x-circle",
  warning: "warning-circle",
  success: "check-circle",
  info: "info",
};

const styles = `
  :host { display: inline-block; vertical-align: middle; }
  :host([hidden]) { display: none; }
  .control {
    --btn-accent: var(--color-primary);
    --btn-on-accent: var(--color-white);
    box-sizing: border-box;
    display: inline-flex;
    inline-size: 100%;
    justify-content: center;
    align-items: center;
    gap: var(--space-internal-8);
    border-radius: var(--radius-lg);
    font: inherit;
    font-family: var(--primary-body-font);
    text-decoration: none;
    white-space: nowrap;
    color: inherit;
    cursor: pointer;
    transition: background-color var(--duration-fast) var(--ease-out-cubic), border-color var(--duration-fast) var(--ease-out-cubic), color var(--duration-fast) var(--ease-out-cubic), filter var(--duration-fast) var(--ease-out-cubic), transform var(--duration-instant) var(--ease-out-cubic);
  }
  .control:focus-visible { outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--color-primary)); outline-offset: var(--focus-ring-offset, 2px); }
  :host([data-dt-group-position="first"]) .control { border-start-end-radius: 0; border-end-end-radius: 0; }
  :host([data-dt-group-position="middle"]) .control { border-radius: 0; }
  :host([data-dt-group-position="last"]) .control { border-start-start-radius: 0; border-end-start-radius: 0; }
  .control:active:not(:disabled, [aria-disabled="true"]) { transform: scale(0.97); }
  .error { --btn-accent: var(--color-error); }
  .warning { --btn-accent: var(--color-warning-contrast); }
  .success { --btn-accent: var(--color-success); }
  .info { --btn-accent: var(--color-info); }
  .primary { border: 0; background: var(--btn-accent); color: var(--btn-on-accent); }
  .secondary { border: 0.125rem solid var(--btn-accent); background: transparent; color: var(--btn-accent); }
  .tertiary { border: 0; background: transparent; color: var(--btn-accent); }
  .sm { min-block-size: 2rem; padding: var(--space-internal-4) var(--space-internal-12); gap: var(--space-internal-4); font-size: var(--font-size-button-s); --btn-icon-size: 1.125rem; }
  .md { min-block-size: 2.5rem; padding: var(--space-internal-8) var(--space-internal-16); font-size: var(--font-size-button-m); --btn-icon-size: 1.25rem; }
  .lg { min-block-size: 3rem; padding: var(--space-internal-12) var(--space-internal-24); font-size: var(--font-size-button-l); --btn-icon-size: 1.5rem; }
  .rounded { border-radius: 9999px; }
  .iconOnly { padding: 0; gap: 0; aspect-ratio: 1; }
  .iconOnly.sm { inline-size: 2rem; --btn-icon-size: 1.25rem; }
  .iconOnly.md { inline-size: 2.5rem; --btn-icon-size: 1.5rem; }
  .iconOnly.lg { inline-size: 3rem; --btn-icon-size: 1.75rem; }
  .icon { display: inline-flex; flex: none; align-items: center; justify-content: center; line-height: 0; }
  .icon ::slotted(svg), .icon dt-icon { inline-size: var(--btn-icon-size); block-size: var(--btn-icon-size); }
  .text { display: inline-flex; align-items: center; line-height: 1; }
  .srOnly { position: absolute; margin: -1px; padding: 0; inline-size: 1px; block-size: 1px; border: 0; clip-path: inset(50%); white-space: nowrap; overflow: hidden; }
  .loading { pointer-events: none; cursor: wait; animation: dt-button-loading var(--duration-slower) var(--ease-in-out-quart) infinite; }
  .control:disabled, .control[aria-disabled="true"] { cursor: not-allowed; }
  .primary:disabled, .primary[aria-disabled="true"] { background: var(--color-disabled-bg); color: var(--color-muted); filter: none; }
  .secondary:disabled, .secondary[aria-disabled="true"], .tertiary:disabled, .tertiary[aria-disabled="true"] { border-color: var(--color-primary-disabled); color: var(--color-muted); }
  .onDark.primary { background: var(--color-white); color: var(--color-primary); }
  .onDark.secondary { border-color: var(--color-white); color: var(--color-white); }
  .onDark.tertiary { color: var(--color-white); }
  .onBrand.primary { background: var(--logo-color); color: var(--logo-background); }
  .onBrand.secondary { border-color: var(--logo-color); color: var(--logo-color); }
  .onBrand.tertiary { color: var(--logo-color); }
  @media (hover: hover) and (pointer: fine) {
    .primary:hover { filter: brightness(0.94); }
    .secondary:hover, .tertiary:hover { background: color-mix(in srgb, var(--btn-accent) 10%, transparent); }
  }
  @keyframes dt-button-loading { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
  @media (prefers-reduced-motion: reduce) { .control:active { transform: none; } .loading { animation: none; } }
  @media (forced-colors: active) { .control:focus-visible { outline: 3px solid Highlight; forced-color-adjust: none; } }
  @media (width <= 768px) { .sm, .md { min-block-size: 2.75rem; } .iconOnly.sm, .iconOnly.md { inline-size: 2.75rem; } }
`;

export class DtButtonElement extends DigitaltableteurElement {
  static formAssociated = true;
  static observedAttributes = [
    "label",
    "variant",
    "tone",
    "size",
    "surface",
    "disabled",
    "loading",
    "rounded",
    "icon",
    "end-icon",
    "accessible-name",
    "accessible-name-ref",
    "accessible-description",
    "tooltip",
    "href",
    "target",
    "rel",
    "submits",
    "name",
    "value",
  ];

  private control: HTMLButtonElement | HTMLAnchorElement | null = null;
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

  get label(): string {
    return stringAttribute(this, "label");
  }
  set label(value: string) {
    reflectAttribute(this, "label", value || null);
  }
  get variant(): DtButtonVariant {
    return enumAttribute(this, "variant", VARIANTS, "primary");
  }
  set variant(value: DtButtonVariant) {
    reflectAttribute(this, "variant", value);
  }
  get tone(): DtButtonTone {
    return enumAttribute(this, "tone", TONES, "neutral");
  }
  set tone(value: DtButtonTone) {
    reflectAttribute(this, "tone", value);
  }
  get size(): DtButtonSize {
    return enumAttribute(this, "size", SIZES, "md");
  }
  set size(value: DtButtonSize) {
    reflectAttribute(this, "size", value);
  }
  get surface(): DtButtonSurface {
    return enumAttribute(this, "surface", SURFACES, "default");
  }
  set surface(value: DtButtonSurface) {
    reflectAttribute(this, "surface", value);
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
  get rounded(): boolean {
    return this.hasAttribute("rounded");
  }
  set rounded(value: boolean) {
    reflectBooleanAttribute(this, "rounded", value);
  }
  get submits(): boolean {
    return this.hasAttribute("submits");
  }
  set submits(value: boolean) {
    reflectBooleanAttribute(this, "submits", value);
  }
  get icon(): string {
    return stringAttribute(this, "icon");
  }
  set icon(value: string) {
    reflectAttribute(this, "icon", value || null);
  }
  get endIcon(): string {
    return stringAttribute(this, "end-icon");
  }
  set endIcon(value: string) {
    reflectAttribute(this, "end-icon", value || null);
  }
  get href(): string {
    return stringAttribute(this, "href");
  }
  set href(value: string) {
    reflectAttribute(this, "href", value || null);
  }
  get target(): string {
    return stringAttribute(this, "target");
  }
  set target(value: string) {
    reflectAttribute(this, "target", value || null);
  }
  get rel(): string {
    return stringAttribute(this, "rel");
  }
  set rel(value: string) {
    reflectAttribute(this, "rel", value || null);
  }
  get accessibleName(): string {
    return stringAttribute(this, "accessible-name");
  }
  set accessibleName(value: string) {
    reflectAttribute(this, "accessible-name", value || null);
  }
  get accessibleNameRef(): string {
    return stringAttribute(this, "accessible-name-ref");
  }
  set accessibleNameRef(value: string) {
    reflectAttribute(this, "accessible-name-ref", value || null);
  }
  get accessibleDescription(): string {
    return stringAttribute(this, "accessible-description");
  }
  set accessibleDescription(value: string) {
    reflectAttribute(this, "accessible-description", value || null);
  }
  get tooltip(): string {
    return stringAttribute(this, "tooltip");
  }
  set tooltip(value: string) {
    reflectAttribute(this, "tooltip", value || null);
  }

  get form(): HTMLFormElement | null {
    return this.internals?.form ?? null;
  }
  get name(): string {
    return stringAttribute(this, "name");
  }
  set name(value: string) {
    reflectAttribute(this, "name", value || null);
  }
  get value(): string {
    return stringAttribute(this, "value");
  }
  set value(value: string) {
    reflectAttribute(this, "value", value);
  }

  click(): void {
    if (this.disabled || this.loading || this.formDisabled) return;
    this.control?.click();
  }

  focus(options?: FocusOptions): void {
    this.control?.focus(options);
  }

  private iconSlot(
    name: "icon" | "end-icon",
    iconName: string,
  ): HTMLElement | null {
    if (!iconName && !hasNamedSlot(this, name)) return null;
    const wrapper = this.ownerDocument.createElement("span");
    wrapper.className = "icon";
    wrapper.setAttribute("part", name);
    const slot = this.ownerDocument.createElement("slot");
    slot.name = name;
    if (iconName) {
      const icon = this.ownerDocument.createElement("dt-icon");
      icon.setAttribute("name", iconName);
      icon.setAttribute("decorative", "");
      icon.setAttribute("part", name);
      slot.append(icon);
    }
    wrapper.append(slot);
    return wrapper;
  }

  private referencedText(reference: string): string {
    if (!reference) return "";
    const root = this.getRootNode() as Document | ShadowRoot;
    const target = root.getElementById?.(reference);
    return target?.textContent?.trim() ?? "";
  }

  private accessibleReference(id: string, text: string): HTMLSpanElement {
    const reference = this.ownerDocument.createElement("span");
    reference.id = id;
    reference.className = "srOnly";
    reference.textContent = text;
    return reference;
  }

  private render(): void {
    const blocked = this.disabled || this.loading || this.formDisabled;
    const hasLabel = Boolean(this.label) || hasDefaultSlotContent(this);
    const leadingIcon = this.icon || toneIcons[this.tone] || "";
    const leading = this.iconSlot("icon", leadingIcon);
    const trailing = this.iconSlot("end-icon", this.endIcon);
    const className = [
      "control",
      this.variant,
      this.tone !== "neutral" ? this.tone : "",
      this.size,
      this.surface !== "default" ? this.surface : "",
      this.rounded ? "rounded" : "",
      this.loading ? "loading" : "",
      !hasLabel && leading ? "iconOnly" : "",
    ]
      .filter(Boolean)
      .join(" ");

    const control = this.href
      ? this.ownerDocument.createElement("a")
      : this.ownerDocument.createElement("button");
    control.className = className;
    control.setAttribute("part", "control");
    const ariaLabel =
      this.accessibleName ||
      (!hasLabel ? this.tooltip : "") ||
      this.getAttribute("aria-label") ||
      "";
    if (ariaLabel) control.setAttribute("aria-label", ariaLabel);
    const referencedName = this.referencedText(this.accessibleNameRef);
    if (referencedName) {
      control.setAttribute("aria-labelledby", "accessible-name-ref");
      control.append(
        this.accessibleReference("accessible-name-ref", referencedName),
      );
    }
    if (this.accessibleDescription) {
      const referencedDescription = this.referencedText(
        this.accessibleDescription,
      );
      if (referencedDescription) {
        control.setAttribute("aria-describedby", "accessible-description-ref");
        control.append(
          this.accessibleReference(
            "accessible-description-ref",
            referencedDescription,
          ),
        );
      } else {
        control.setAttribute("aria-description", this.accessibleDescription);
      }
    }
    if (this.tooltip) control.title = this.tooltip;
    if (this.loading) control.setAttribute("aria-busy", "true");

    if (control instanceof HTMLAnchorElement) {
      if (blocked) {
        control.setAttribute("role", "link");
        control.setAttribute("aria-disabled", "true");
        control.tabIndex = -1;
      } else {
        control.href = this.href;
        if (this.target) control.target = this.target;
        const rel =
          this.rel || (this.target === "_blank" ? "noopener noreferrer" : "");
        if (rel) control.rel = rel;
      }
    } else {
      control.type = this.submits ? "submit" : "button";
      control.disabled = blocked;
      if (this.submits) {
        control.addEventListener("click", (event) => {
          queueMicrotask(() => {
            if (!event.defaultPrevented) this.form?.requestSubmit();
          });
        });
      }
    }

    if (leading) control.append(leading);
    if (hasLabel) {
      const text = this.ownerDocument.createElement("span");
      text.className = "text";
      text.setAttribute("part", "label");
      const slot = this.ownerDocument.createElement("slot");
      if (this.label) slot.textContent = this.label;
      text.append(slot);
      control.append(text);
    }
    if (trailing) control.append(trailing);

    this.control = control;
    this.replaceShadow(styles, control);
  }
}
