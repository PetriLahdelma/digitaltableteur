import {
  DigitaltableteurElement,
  reflectAttribute,
  stringAttribute,
} from "./base";

const styles = `
  :host { display: contents; }
  .skipLink { position: absolute; z-index: 100; padding-block: var(--space-internal-8, 0.5rem); padding-inline: var(--space-internal-16, 1rem); border-radius: var(--radius-md, 0.375rem); background: var(--color-primary); font-family: var(--font-body, system-ui, sans-serif); font-size: var(--font-size-text-m, 1rem); font-weight: 500; line-height: var(--line-height-snug, 1.3); text-decoration: none; white-space: nowrap; color: var(--color-white); transition: inset-block-start 0.2s ease; inset-block-start: -4rem; inset-inline-start: var(--space-internal-12, 0.75rem); }
  .skipLink:focus, .skipLink:focus-visible { outline: 2px solid var(--focus-ring-color, var(--color-primary)); outline-offset: 2px; inset-block-start: var(--space-internal-12, 0.75rem); }
  @media (prefers-reduced-motion: reduce) { .skipLink { transition: none; } }
`;

function fragmentHref(value: string): string {
  const href = value.trim();
  return href.startsWith("#") ? href : "#main-content";
}

export class DtSkipLinkElement extends DigitaltableteurElement {
  static observedAttributes = ["href", "label"];
  connectedCallback(): void {
    this.render();
    this.observeLightDom(() => this.render());
  }
  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }
  get href(): string {
    return stringAttribute(this, "href", "#main-content");
  }
  set href(value: string) {
    reflectAttribute(this, "href", value || null);
  }
  get label(): string {
    return stringAttribute(this, "label", "Skip to main content");
  }
  set label(value: string) {
    reflectAttribute(this, "label", value || null);
  }
  private render(): void {
    const anchor = this.ownerDocument.createElement("a");
    anchor.className = "skipLink";
    anchor.setAttribute("part", "link");
    anchor.href = fragmentHref(this.href);
    const slot = this.ownerDocument.createElement("slot");
    slot.textContent = this.label;
    anchor.append(slot);
    this.replaceShadow(styles, anchor);
  }
}
