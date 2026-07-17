import {
  DigitaltableteurElement,
  enumAttribute,
  hasDefaultSlotContent,
  hasNamedSlot,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";

const TONES = ["neutral", "destructive"] as const;
export type DtListItemTone = (typeof TONES)[number];

/**
 * Shadow styles mirror ListItem.module.css 1:1 (class-based tone/highlighted/
 * disabled selectors on .root, same as the React `cx(...)` composition), with
 * two additions the shadow tree needs that the light-DOM module doesn't:
 * box-sizing (no global reset reaches into shadow DOM) and icon glyph sizing.
 * The React module clamps a nested `<svg>` directly (`.icon svg { ... }`),
 * leaving Icon's own 24px `.base` wrapper span untouched — React's `.icon`/
 * `.trailingIcon` flex-basis (1.25rem/auto) loses to that wrapper's larger
 * min-content size, so the *rendered* icon box is 24px with the clamped svg
 * centered inside it, not the 20px the authored CSS implies. The synthesized
 * `dt-icon` glyph is itself a shadow host whose `.root` (part="root") is the
 * same-purpose 24px centering wrapper as Icon's `.base`; clamping `::part(svg)`
 * (dt-icon's inner `<svg>`, not `.root`) reproduces the identical two-box
 * geometry instead of shrinking the whole wrapper and losing the centering
 * inset. Slotted consumer icons (real light-DOM children) clamp directly via
 * `::slotted(*)`, matching how a bare consumer-supplied `<svg>` would clamp
 * in the React module.
 */
const styles = `
  :host { display: block; }
  :host([hidden]) { display: none; }
  .root {
    box-sizing: border-box;
    display: flex;
    min-block-size: 2.5rem;
    padding-block: var(--space-internal-8, 0.5rem);
    padding-inline: var(--space-internal-12, 0.75rem);
    align-items: center;
    gap: var(--space-internal-8, 0.5rem);
    border-radius: var(--radius-md, 0.375rem);
    font-family: var(--font-text, system-ui, sans-serif);
    font-size: var(--font-size-text-s, 0.875rem);
    line-height: var(--line-height-normal, 1.5);
    text-align: left;
    color: var(--color-dark, CanvasText);
    user-select: none;
  }
  .root:hover,
  .root:active,
  .root.highlighted {
    background-color: var(--color-neutral-bg, #f0f0f0);
  }
  .icon {
    display: inline-flex;
    flex: 0 0 1.25rem;
    justify-content: center;
    align-items: center;
    font-size: 1rem;
    line-height: 1;
    color: var(--color-primary, LinkText);
  }
  .icon dt-icon::part(svg),
  .icon ::slotted(*) {
    inline-size: 1rem;
    block-size: 1rem;
  }
  .label {
    min-inline-size: 0;
    flex: 1;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  .meta {
    display: inline-flex;
    margin-inline-start: auto;
    align-items: center;
    gap: var(--space-internal-4, 0.25rem);
    font-size: var(--font-size-text-xs, 0.75rem);
    line-height: 1;
    color: var(--color-muted, GrayText);
  }
  .trailingIcon {
    display: inline-flex;
    margin-inline-start: auto;
    align-items: center;
    color: var(--color-muted, GrayText);
  }
  .meta ~ .trailingIcon {
    margin-inline-start: 0;
  }
  .trailingIcon dt-icon::part(svg),
  .trailingIcon ::slotted(*) {
    inline-size: 0.875rem;
    block-size: 0.875rem;
  }
  .destructive,
  .destructive .icon,
  .destructive .trailingIcon {
    color: var(--color-error, #b3261e);
  }
  /* On the error-tinted hover/active/highlighted surface only the root's own
     color flips to --color-error-text (the label inherits it); .icon and
     .trailingIcon keep --color-error from the rule above since they carry
     their own explicit color declaration. Mirrors ListItem.module.css. */
  .destructive:hover,
  .destructive:active,
  .destructive.highlighted {
    background-color: color-mix(in srgb, var(--color-error, #b3261e) 10%, transparent);
    color: var(--color-error-text, #7a1f1f);
  }
  .disabled,
  .disabled .icon,
  .disabled .meta,
  .disabled .trailingIcon {
    color: var(--color-disabled-placeholder, GrayText);
  }
  .disabled:hover,
  .disabled:active {
    background-color: transparent;
  }
  @media (forced-colors: active) {
    .root {
      color: CanvasText;
    }
    .disabled,
    .disabled .icon,
    .disabled .meta,
    .disabled .trailingIcon {
      color: GrayText;
    }
    .root.highlighted {
      background-color: Highlight;
      color: HighlightText;
    }
    .root.highlighted .icon,
    .root.highlighted .meta,
    .root.highlighted .trailingIcon {
      color: HighlightText;
    }
  }
`;

export class DtListItemElement extends DigitaltableteurElement {
  static observedAttributes = [
    "label",
    "icon",
    "meta",
    "trailing-icon",
    "selected",
    "tone",
    "disabled",
    "highlighted",
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
  get icon(): string {
    return stringAttribute(this, "icon");
  }
  set icon(value: string) {
    reflectAttribute(this, "icon", value || null);
  }
  get meta(): string {
    return stringAttribute(this, "meta");
  }
  set meta(value: string) {
    reflectAttribute(this, "meta", value || null);
  }
  get trailingIcon(): string {
    return stringAttribute(this, "trailing-icon");
  }
  set trailingIcon(value: string) {
    reflectAttribute(this, "trailing-icon", value || null);
  }
  get selected(): boolean {
    return this.hasAttribute("selected");
  }
  set selected(value: boolean) {
    reflectBooleanAttribute(this, "selected", value);
  }
  /**
   * Tri-state like the React ListItem's `tone` prop: an absent attribute
   * resolves to "neutral" but never round-trips back onto the DOM, so
   * `list-item.tone = "neutral"` clears the attribute rather than writing it.
   */
  get tone(): DtListItemTone {
    return enumAttribute(this, "tone", TONES, "neutral");
  }
  set tone(value: DtListItemTone) {
    reflectAttribute(this, "tone", value === "neutral" ? null : value);
  }
  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }
  set disabled(value: boolean) {
    reflectBooleanAttribute(this, "disabled", value);
  }
  get highlighted(): boolean {
    return this.hasAttribute("highlighted");
  }
  set highlighted(value: boolean) {
    reflectBooleanAttribute(this, "highlighted", value);
  }

  private render(): void {
    const rootClasses = ["root"];
    if (this.tone === "destructive") rootClasses.push("destructive");
    if (this.highlighted) rootClasses.push("highlighted");
    if (this.disabled) rootClasses.push("disabled");

    const root = this.ownerDocument.createElement("span");
    root.className = rootClasses.join(" ");
    root.setAttribute("part", "root");

    const iconName = this.icon;
    if (hasNamedSlot(this, "icon") || iconName) {
      const icon = this.ownerDocument.createElement("span");
      icon.className = "icon";
      icon.setAttribute("part", "icon");
      icon.setAttribute("aria-hidden", "true");
      const slot = this.ownerDocument.createElement("slot");
      slot.name = "icon";
      if (!hasNamedSlot(this, "icon") && iconName) {
        const glyph = this.ownerDocument.createElement("dt-icon");
        glyph.setAttribute("name", iconName);
        glyph.setAttribute("aria-hidden", "true");
        slot.append(glyph);
      }
      icon.append(slot);
      root.append(icon);
    }

    const label = this.ownerDocument.createElement("span");
    label.className = "label";
    label.setAttribute("part", "label");
    const labelSlot = this.ownerDocument.createElement("slot");
    if (!hasDefaultSlotContent(this) && this.label) {
      labelSlot.textContent = this.label;
    }
    label.append(labelSlot);
    root.append(label);

    if (hasNamedSlot(this, "meta") || this.meta) {
      const meta = this.ownerDocument.createElement("span");
      meta.className = "meta";
      meta.setAttribute("part", "meta");
      const slot = this.ownerDocument.createElement("slot");
      slot.name = "meta";
      if (!hasNamedSlot(this, "meta") && this.meta) {
        slot.textContent = this.meta;
      }
      meta.append(slot);
      root.append(meta);
    }

    if (hasNamedSlot(this, "trailing-icon") || this.trailingIcon) {
      const trailing = this.ownerDocument.createElement("span");
      trailing.className = "trailingIcon";
      trailing.setAttribute("part", "trailing-icon");
      trailing.setAttribute("aria-hidden", "true");
      const slot = this.ownerDocument.createElement("slot");
      slot.name = "trailing-icon";
      if (!hasNamedSlot(this, "trailing-icon") && this.trailingIcon) {
        const glyph = this.ownerDocument.createElement("dt-icon");
        glyph.setAttribute("name", this.trailingIcon);
        glyph.setAttribute("aria-hidden", "true");
        slot.append(glyph);
      }
      trailing.append(slot);
      root.append(trailing);
    }

    if (this.selected) {
      const check = this.ownerDocument.createElement("span");
      check.className = "trailingIcon";
      check.setAttribute("part", "check");
      check.setAttribute("aria-hidden", "true");
      const glyph = this.ownerDocument.createElement("dt-icon");
      glyph.setAttribute("name", "check");
      glyph.setAttribute("aria-hidden", "true");
      check.append(glyph);
      root.append(check);
    }

    this.replaceShadow(styles, root);
  }
}
