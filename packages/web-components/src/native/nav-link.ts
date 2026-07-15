import {
  DigitaltableteurElement,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";

const styles = `
  :host { display: inline; font-family: var(--font-body); font-size: var(--font-size-text-m); }
  .item { --link-color: var(--color-muted); border-radius: var(--radius-sm, 4px); color: var(--color-muted); transition: color var(--duration-fast) var(--ease-out-cubic); }
  .active { --link-color: var(--color-text); color: var(--color-text); }
  .current { cursor: default; }
  dt-link { font-size: inherit; }
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
      current.className = "item active current";
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
    link.setAttribute("size", this.getAttribute("size") ?? "inherit");
    link.setAttribute("underline", this.getAttribute("underline") ?? "none");
    if (active) link.setAttribute("aria-current", "page");
    link.append(this.contentSlot());
    this.replaceShadow(styles, link);
  }
}
