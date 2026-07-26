import {
  DigitaltableteurElement,
  enumAttribute,
  reflectAttribute,
  stringAttribute,
} from "./base";

const SIZES = ["sm", "md", "lg"] as const;
const VARIANTS = ["primary", "secondary"] as const;

export type DtKbdSize = (typeof SIZES)[number];
export type DtKbdVariant = (typeof VARIANTS)[number];

const styles = `
  :host {
    display: inline-block;
    vertical-align: middle;
  }
  :host([hidden]) {
    display: none;
  }
  .kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding-block: var(--space-internal-2);
    padding-inline: var(--space-internal-6);
    border-radius: var(--radius-md);
    color: var(--color-text);
    font-family: var(--font-mono);
    line-height: 1.2;

    /* Keycaps read like physical keys: ESC / ENTER / SPACE, not Esc / Enter.
       Visual only — the light-DOM text (and screen-reader name) is unchanged. */
    text-transform: uppercase;
    white-space: nowrap;
    box-sizing: border-box;
  }

  /* Primary: a filled light-gray keycap with a darker bottom edge, so it reads
     like a physical key (Astryx-style). Only a bottom border — no full outline. */
  .primary {
    border-block-end: 2px solid var(--color-border);
    background-color: var(--color-neutral-bg);
    color: var(--color-neutral-text);
  }

  /* Secondary: the flatter outlined chip (the original Kbd look). */
  .secondary {
    border: 1px solid var(--color-border);
    border-block-end-width: 2px;
    background-color: var(--color-surface);
  }

  /* Invert the primary keycap under the high-contrast themes so it contrasts
     with the page instead of blending in — a dark keycap on HCW's white page,
     a light keycap on HCB's black page. */
  :host-context(.themeHCW) .primary,
  :host-context(.themeHCB) .primary {
    background-color: var(--color-neutral-text);
    color: var(--color-neutral-bg);
  }

  /* min-inline-size == block-size so a single-key cap is at least square
     (width >= height), like a physical keycap; multi-char keys grow wider. */
  .sm {
    padding-inline: var(--space-internal-6);
    block-size: var(--space-layout-24);
    min-inline-size: var(--space-layout-24);
    font-size: 0.75rem;
  }
  .md {
    padding-inline: var(--space-internal-8);
    block-size: var(--space-layout-32);
    min-inline-size: var(--space-layout-32);
    font-size: 0.875rem;
  }
  .lg {
    padding-inline: var(--space-internal-12);
    block-size: var(--space-layout-40);
    min-inline-size: var(--space-layout-40);
    border-radius: var(--radius-lg);
    font-size: 1rem;
  }

  @media (forced-colors: active) {
    .kbd {
      /* Both variants get a full outline so the keycap stays visible when the
         system palette overrides author colors. */
      border: 1px solid ButtonText;
    }
  }
`;

export class DtKbdElement extends DigitaltableteurElement {
  static observedAttributes = ["size", "variant", "content"];

  connectedCallback(): void {
    this.render();
    this.observeLightDom(() => this.render());
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  get size(): DtKbdSize {
    return enumAttribute(this, "size", SIZES, "md");
  }

  set size(value: DtKbdSize) {
    reflectAttribute(this, "size", value);
  }

  get variant(): DtKbdVariant {
    return enumAttribute(this, "variant", VARIANTS, "primary");
  }

  set variant(value: DtKbdVariant) {
    reflectAttribute(this, "variant", value);
  }

  get content(): string {
    return stringAttribute(this, "content");
  }

  set content(value: string) {
    reflectAttribute(this, "content", value || null);
  }

  private render(): void {
    const root = this.ownerDocument.createElement("kbd");
    root.className = ["kbd", this.variant, this.size].join(" ");
    root.setAttribute("part", "root kbd");

    const slot = this.ownerDocument.createElement("slot");
    slot.setAttribute("part", "content");
    if (this.content) slot.textContent = this.content;
    root.append(slot);

    this.replaceShadow(styles, root);
  }
}
