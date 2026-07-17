import {
  DigitaltableteurElement,
  enumAttribute,
  hasNamedSlot,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";

const VARIANTS = ["primary", "secondary"] as const;
const TONES = ["neutral", "error", "warning", "success", "info"] as const;
const SIZES = ["sm", "md", "lg"] as const;
export type DtBadgeVariant = (typeof VARIANTS)[number];
export type DtBadgeTone = (typeof TONES)[number];
export type DtBadgeSize = (typeof SIZES)[number];

const toneIcons: Partial<Record<DtBadgeTone, string>> = {
  error: "x-circle",
  warning: "warning",
  success: "check-circle",
  info: "info",
};

const styles = `
  /* inline-flex like the React badge root: inline-block wraps the badge in a
     line box whose leading adds a half pixel around icon content. */
  :host { display: inline-flex; vertical-align: middle; }
  :host([hidden]) { display: none; }
  .badge { box-sizing: border-box; display: inline-flex; width: fit-content; height: 40px; padding: 0 var(--space-internal-16); align-items: center; gap: 0.25em; border: 2px solid transparent; border-radius: 999px; font-family: var(--primary-body-font); font-size: 1rem; font-weight: 600; letter-spacing: 0.02em; white-space: nowrap; overflow: hidden; }
  .sm { height: 32px; padding-inline: var(--space-internal-12); font-size: 0.75rem; }
  .lg { height: 56px; font-size: 1.25rem; }
  .square { border-radius: 0; }
  .primary { background: var(--color-primary); color: var(--color-white); }
  .secondary { border-color: var(--color-primary); background: transparent; color: var(--color-primary); }
  .success.primary { background: var(--color-success); } .success.secondary { border-color: var(--color-success); color: var(--color-success); }
  .info.primary { background: var(--color-info); } .info.secondary { border-color: var(--color-info); color: var(--color-info); }
  .error.primary { background: var(--color-error); } .error.secondary { border-color: var(--color-error); color: var(--color-error); }
  .warning.primary { background: var(--color-warning-contrast); } .warning.secondary { border-color: var(--color-warning-contrast); color: var(--color-warning-contrast); }
  .neutral.primary { background: var(--color-neutral-bg); color: var(--color-neutral-text); } .neutral.secondary { border-color: var(--color-neutral-text); color: var(--color-neutral-text); }
  .icon { display: inline-flex; flex: none; align-items: center; justify-content: center; line-height: 0; }
  .dot { inline-size: 0.5em; block-size: 0.5em; border-radius: 50%; background: currentcolor; }
  .label { padding-inline: var(--space-internal-4); }
  .close { display: inline-flex; margin-inline-start: 0.125rem; padding: 0; inline-size: 1.125rem; block-size: 1.125rem; align-items: center; justify-content: center; border: 0; border-radius: 999px; background: transparent; color: inherit; cursor: pointer; }
  .close:focus-visible { outline: var(--focus-ring-width, 2px) solid currentcolor; outline-offset: 1px; }
  .removable { padding-inline-end: var(--space-internal-6); }
  @media (hover: hover) and (pointer: fine) { .close:hover { background: color-mix(in srgb, currentcolor 16%, transparent); } }
`;

export class DtBadgeElement extends DigitaltableteurElement {
  static observedAttributes = [
    "label",
    "variant",
    "tone",
    "size",
    "removable",
    "dot",
    "square",
    "role",
    "icon",
    "remove-label",
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
  get variant(): DtBadgeVariant {
    return enumAttribute(this, "variant", VARIANTS, "primary");
  }
  set variant(value: DtBadgeVariant) {
    reflectAttribute(this, "variant", value);
  }
  /**
   * Tri-state like the React Badge's optional tone: an absent attribute means
   * NO tone (the plain variant treatment), which is distinct from "neutral".
   */
  get tone(): DtBadgeTone | "" {
    return enumAttribute<DtBadgeTone | "">(this, "tone", TONES, "");
  }
  set tone(value: DtBadgeTone | "") {
    reflectAttribute(this, "tone", value || null);
  }
  get size(): DtBadgeSize {
    return enumAttribute(this, "size", SIZES, "md");
  }
  set size(value: DtBadgeSize) {
    reflectAttribute(this, "size", value);
  }
  get removable(): boolean {
    return this.hasAttribute("removable");
  }
  set removable(value: boolean) {
    reflectBooleanAttribute(this, "removable", value);
  }
  get dot(): boolean {
    return this.hasAttribute("dot");
  }
  set dot(value: boolean) {
    reflectBooleanAttribute(this, "dot", value);
  }
  get square(): boolean {
    return this.hasAttribute("square");
  }
  set square(value: boolean) {
    reflectBooleanAttribute(this, "square", value);
  }

  private render(): void {
    const root = this.ownerDocument.createElement("span");
    root.className = [
      "badge",
      this.variant,
      this.tone,
      this.size,
      this.square ? "square" : "",
      this.removable ? "removable" : "",
    ]
      .filter(Boolean)
      .join(" ");
    root.setAttribute("part", "badge");
    if (this.getAttribute("role") === "status") {
      root.setAttribute("role", "status");
      root.setAttribute("aria-live", "polite");
    }

    const explicitIcon = stringAttribute(this, "icon");
    const slottedIcon = hasNamedSlot(this, "icon");
    const iconName =
      explicitIcon ||
      (!this.dot && this.tone ? toneIcons[this.tone] || "" : "");
    if (slottedIcon || iconName || this.dot) {
      const iconWrapper = this.ownerDocument.createElement("span");
      iconWrapper.className = "icon";
      iconWrapper.setAttribute("part", "icon");
      const slot = this.ownerDocument.createElement("slot");
      slot.name = "icon";
      if (this.dot) {
        const dot = this.ownerDocument.createElement("span");
        dot.className = "dot";
        dot.setAttribute("aria-hidden", "true");
        slot.append(dot);
      } else if (iconName) {
        const icon = this.ownerDocument.createElement("dt-icon");
        icon.setAttribute("name", iconName);
        icon.setAttribute("decorative", "");
        slot.append(icon);
      }
      iconWrapper.append(slot);
      root.append(iconWrapper);
    }

    const label = this.ownerDocument.createElement("span");
    label.className = "label";
    label.setAttribute("part", "label");
    const labelSlot = this.ownerDocument.createElement("slot");
    if (this.label) labelSlot.textContent = this.label;
    label.append(labelSlot);
    root.append(label);

    if (this.removable) {
      const button = this.ownerDocument.createElement("button");
      button.type = "button";
      button.className = "close";
      button.setAttribute("part", "remove-button");
      button.setAttribute(
        "aria-label",
        stringAttribute(this, "remove-label", "Remove badge"),
      );
      button.textContent = "×";
      button.addEventListener("click", () => {
        if (this.hidden) return;
        this.hidden = true;
        this.dispatchEvent(
          new CustomEvent("remove", { bubbles: true, composed: true }),
        );
      });
      root.append(button);
    }
    this.replaceShadow(styles, root);
  }
}
