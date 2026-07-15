import {
  DigitaltableteurElement,
  enumAttribute,
  numberAttribute,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";

const VARIANTS = ["pill", "underline", "minimal"] as const;
const SIZES = ["sm", "md", "lg"] as const;
export type DtFilterChipVariant = (typeof VARIANTS)[number];
export type DtFilterChipSize = (typeof SIZES)[number];

const styles = `
  :host { display: inline-block; }
  :host([hidden]) { display: none; }
  .chip { display: inline-flex; align-items: center; border: 0; background: transparent; font-family: var(--font-body); white-space: nowrap; color: var(--color-muted); cursor: pointer; transition: color var(--duration-fast, 0.2s) var(--ease-out-cubic, ease), background-color var(--duration-fast, 0.2s) var(--ease-out-cubic, ease), border-color var(--duration-fast, 0.2s) var(--ease-out-cubic, ease); }
  .chip:hover { color: var(--color-text); }
  .chip:focus-visible { outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--color-primary)); outline-offset: 2px; }
  .chip:disabled { cursor: not-allowed; opacity: 0.55; }
  .sm { padding-block: var(--space-internal-6); padding-inline: var(--space-internal-12); font-size: var(--font-size-text-xs, 0.75rem); }
  .md { padding-block: var(--space-internal-8); padding-inline: var(--space-internal-16); font-size: var(--font-size-text-s, 0.875rem); }
  .lg { padding-block: var(--space-internal-8); padding-inline: var(--space-internal-24); font-size: var(--font-size-text-m, 1rem); }
  .pill { border: 1px solid var(--color-border); border-radius: var(--radius-full, 9999px); }
  .pill:hover { border-color: var(--color-text); }
  .pill[aria-pressed="true"] { border-color: var(--color-text); background-color: var(--color-text); color: var(--main-body-background-color, var(--color-white)); }
  .underline { margin-block-end: -1px; padding-inline: 0; border-block-end: 2px solid transparent; border-radius: 0; }
  .underline[aria-pressed="true"] { border-block-end-color: var(--color-text); color: var(--color-text); }
  .minimal { padding-inline: 0; border-radius: var(--radius-sm, 4px); }
  .minimal[aria-pressed="true"] { font-weight: 500; color: var(--color-text); }
  .count { margin-inline-start: var(--space-internal-2); }
  @media (forced-colors: active) { .chip { color: ButtonText; } .pill { border-color: ButtonText; } .chip[aria-pressed="true"] { background-color: Highlight; color: HighlightText; } }
  @media (prefers-reduced-motion: reduce) { .chip { transition: none; } }
`;

export class DtFilterChipElement extends DigitaltableteurElement {
  static observedAttributes = [
    "label",
    "pressed",
    "variant",
    "size",
    "count",
    "disabled",
  ];
  connectedCallback(): void {
    this.render();
    this.observeLightDom(() => this.render());
  }
  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }
  get label(): string {
    return stringAttribute(this, "label");
  }
  set label(value: string) {
    reflectAttribute(this, "label", value || null);
  }
  get pressed(): boolean {
    return this.hasAttribute("pressed");
  }
  set pressed(value: boolean) {
    reflectBooleanAttribute(this, "pressed", value);
  }
  get variant(): DtFilterChipVariant {
    return enumAttribute(this, "variant", VARIANTS, "pill");
  }
  set variant(value: DtFilterChipVariant) {
    reflectAttribute(this, "variant", value);
  }
  get size(): DtFilterChipSize {
    return enumAttribute(this, "size", SIZES, "md");
  }
  set size(value: DtFilterChipSize) {
    reflectAttribute(this, "size", value);
  }
  get count(): number | undefined {
    return this.hasAttribute("count")
      ? numberAttribute(this, "count", 0)
      : undefined;
  }
  set count(value: number | undefined) {
    reflectAttribute(this, "count", value ?? null);
  }
  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }
  set disabled(value: boolean) {
    reflectBooleanAttribute(this, "disabled", value);
  }
  private render(): void {
    const button = this.ownerDocument.createElement("button");
    button.type = "button";
    button.className = `chip ${this.variant} ${this.size}`;
    button.setAttribute("part", "button");
    button.setAttribute("aria-pressed", String(this.pressed));
    button.disabled = this.disabled;
    const slot = this.ownerDocument.createElement("slot");
    if (this.label) slot.textContent = this.label;
    button.append(slot);
    if (this.count !== undefined) {
      button.append(" ");
      const count = this.ownerDocument.createElement("span");
      count.className = "count";
      count.setAttribute("part", "count");
      count.textContent = `(${this.count})`;
      button.append(count);
    }
    this.replaceShadow(styles, button);
  }
}
