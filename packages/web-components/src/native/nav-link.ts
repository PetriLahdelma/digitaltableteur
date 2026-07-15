import {
  DigitaltableteurElement,
  enumAttribute,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";

const SIZES = ["sm", "md", "lg", "inherit"] as const;
const UNDERLINES = ["always", "hover", "none"] as const;

const styles = `
  :host { display: inline; font-family: var(--font-body); font-size: var(--font-size-text-m); }
  .item { --link-color: var(--color-muted); border-radius: var(--radius-sm, 4px); color: var(--color-muted); transition: color var(--duration-fast) var(--ease-out-cubic); }
  .active { --link-color: var(--color-text); color: var(--color-text); }
  .current { display: inline-flex; align-items: center; gap: 0.5rem; cursor: default; text-decoration: none; }
  .current.sm { gap: 0.3rem; font-size: 1rem; }
  .current.md { font-size: 1.125rem; }
  .current.lg { font-size: 1.5rem; }
  .current.inherit { gap: 0.3rem; font-size: inherit; }
  .current.always, .current.hover { position: relative; padding-bottom: 6px; }
  .current.always::after, .current.hover::after { position: absolute; right: 0; bottom: 0; left: 0; height: 6px; background-color: var(--underline-accent-color, currentcolor); opacity: 0.9; content: ""; mask-image: var(--wavy-underline-mask); mask-repeat: repeat-x; mask-size: 16px 6px; }
  .current.hover::after { opacity: 0; transition: opacity var(--duration-fast) var(--ease-out-cubic); }
  dt-link { font-size: inherit; }
  @media (hover: hover) and (pointer: fine) { .current.hover:hover::after { opacity: 0.9; } }
  @media (prefers-reduced-motion: reduce) { .item { transition: none; } }
`;

export class DtNavLinkElement extends DigitaltableteurElement {
  static observedAttributes = [
    "href",
    "label",
    "current-path",
    "exact",
    "size",
    "underline",
  ];

  connectedCallback(): void {
    this.render();
    this.observeLightDom(() => this.render());
  }
  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  get href(): string {
    return stringAttribute(this, "href", "#");
  }
  set href(value: string) {
    reflectAttribute(this, "href", value || null);
  }
  get label(): string {
    return stringAttribute(this, "label");
  }
  set label(value: string) {
    reflectAttribute(this, "label", value || null);
  }
  get currentPath(): string {
    return stringAttribute(this, "current-path");
  }
  set currentPath(value: string) {
    reflectAttribute(this, "current-path", value || null);
  }
  get exact(): boolean {
    return this.hasAttribute("exact");
  }
  set exact(value: boolean) {
    reflectBooleanAttribute(this, "exact", value);
  }
  get size(): string {
    return enumAttribute(this, "size", SIZES, "inherit");
  }
  set size(value: (typeof SIZES)[number]) {
    reflectAttribute(this, "size", value);
  }
  get underline(): string {
    return enumAttribute(this, "underline", UNDERLINES, "none");
  }
  set underline(value: (typeof UNDERLINES)[number]) {
    reflectAttribute(this, "underline", value);
  }

  private contentSlot(): HTMLSlotElement {
    const slot = this.ownerDocument.createElement("slot");
    if (this.label) slot.textContent = this.label;
    return slot;
  }

  private render(): void {
    const currentPath = this.currentPath;
    const samePath = Boolean(currentPath) && currentPath === this.href;
    const active = this.exact
      ? samePath
      : samePath ||
        (Boolean(currentPath) && currentPath.startsWith(`${this.href}/`));

    if (samePath) {
      const current = this.ownerDocument.createElement("span");
      current.className = `item active current ${this.size} ${this.underline}`;
      current.setAttribute("part", "current");
      current.setAttribute("aria-current", "page");
      current.append(this.contentSlot());
      this.replaceShadow(styles, current);
      return;
    }

    const link = this.ownerDocument.createElement("dt-link");
    link.className = `item ${active ? "active" : ""}`.trim();
    link.setAttribute("part", "link");
    link.setAttribute("href", this.href);
    link.setAttribute("size", this.size);
    link.setAttribute("underline", this.underline);
    if (active) link.setAttribute("aria-current", "page");
    link.append(this.contentSlot());
    this.replaceShadow(styles, link);
  }
}
