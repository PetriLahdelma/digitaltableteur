import {
  DigitaltableteurElement,
  enumAttribute,
  hasNamedSlot,
  reflectAttribute,
  stringAttribute,
} from "./base";

const SIZES = ["sm", "md", "lg"] as const;
const HEADINGS = ["h2", "h3", "h4"] as const;
export type DtEmptyStateSize = (typeof SIZES)[number];
export type DtEmptyStateHeadingLevel = (typeof HEADINGS)[number];

const styles = `
  :host { display: block; inline-size: 100%; }
  :host([hidden]) { display: none; }
  .root { display: flex; inline-size: 100%; box-sizing: border-box; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
  .sm { padding-block: var(--space-internal-16); padding-inline: var(--space-internal-16); gap: var(--space-internal-4); --dt-empty-icon-size: 2rem; --dt-empty-title-size: var(--font-size-title-xxs, 1.25rem); --dt-empty-text-size: var(--font-size-text-xs, 0.75rem); }
  .md { padding-block: var(--space-internal-32); padding-inline: var(--space-internal-16); gap: var(--space-internal-8); --dt-empty-icon-size: 3rem; --dt-empty-title-size: var(--font-size-title-xs, 1.5rem); --dt-empty-text-size: var(--font-size-text-s, 0.875rem); }
  .lg { padding-block: var(--space-layout-48); padding-inline: var(--space-internal-16); gap: var(--space-internal-12); --dt-empty-icon-size: 4rem; --dt-empty-title-size: var(--font-size-title-s, 2rem); --dt-empty-text-size: var(--font-size-text-m, 1rem); }
  .icon { display: inline-flex; color: var(--color-muted); }
  .icon dt-icon { inline-size: var(--dt-empty-icon-size); block-size: var(--dt-empty-icon-size); }
  .title { margin: 0; font-family: var(--font-heading, var(--font-body)); font-size: var(--dt-empty-title-size); line-height: var(--line-height-tight, 1.2); color: var(--color-text); }
  .description { margin: 0; max-inline-size: 40ch; font-family: var(--font-text); font-size: var(--dt-empty-text-size); line-height: var(--line-height-normal, 1.5); color: var(--color-muted); }
  .actions { display: flex; margin-block-start: var(--space-internal-8); flex-wrap: wrap; justify-content: center; align-items: center; gap: var(--space-internal-8); }
`;

export class DtEmptyStateElement extends DigitaltableteurElement {
  static observedAttributes = [
    "icon",
    "title-text",
    "description",
    "heading-level",
    "size",
  ];
  connectedCallback(): void {
    this.render();
    this.observeLightDom(() => this.render());
  }
  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }
  get icon(): string {
    return stringAttribute(this, "icon");
  }
  set icon(value: string) {
    reflectAttribute(this, "icon", value || null);
  }
  get titleText(): string {
    return stringAttribute(this, "title-text");
  }
  set titleText(value: string) {
    reflectAttribute(this, "title-text", value || null);
  }
  get description(): string {
    return stringAttribute(this, "description");
  }
  set description(value: string) {
    reflectAttribute(this, "description", value || null);
  }
  get headingLevel(): DtEmptyStateHeadingLevel {
    return enumAttribute(this, "heading-level", HEADINGS, "h2");
  }
  set headingLevel(value: DtEmptyStateHeadingLevel) {
    reflectAttribute(this, "heading-level", value);
  }
  get size(): DtEmptyStateSize {
    return enumAttribute(this, "size", SIZES, "md");
  }
  set size(value: DtEmptyStateSize) {
    reflectAttribute(this, "size", value);
  }
  private textSlot(
    name: "title" | "description",
    fallback: string,
    elementName: string,
  ): HTMLElement {
    const element = this.ownerDocument.createElement(elementName);
    element.className = name;
    element.setAttribute("part", name);
    const slot = this.ownerDocument.createElement("slot");
    slot.name = name;
    if (fallback) slot.textContent = fallback;
    element.append(slot);
    return element;
  }
  private render(): void {
    const root = this.ownerDocument.createElement("div");
    root.className = `root ${this.size}`;
    root.setAttribute("part", "root");
    if (this.icon || hasNamedSlot(this, "icon")) {
      const iconWrapper = this.ownerDocument.createElement("span");
      iconWrapper.className = "icon";
      iconWrapper.setAttribute("part", "icon");
      const iconSlot = this.ownerDocument.createElement("slot");
      iconSlot.name = "icon";
      if (this.icon) {
        const icon = this.ownerDocument.createElement("dt-icon");
        icon.setAttribute("name", this.icon);
        icon.setAttribute("decorative", "");
        iconSlot.append(icon);
      }
      iconWrapper.append(iconSlot);
      root.append(iconWrapper);
    }
    if (this.titleText || hasNamedSlot(this, "title")) {
      root.append(this.textSlot("title", this.titleText, this.headingLevel));
    }
    if (this.description || hasNamedSlot(this, "description")) {
      root.append(this.textSlot("description", this.description, "p"));
    }
    if (hasNamedSlot(this, "action")) {
      const actions = this.ownerDocument.createElement("div");
      actions.className = "actions";
      actions.setAttribute("part", "actions");
      const slot = this.ownerDocument.createElement("slot");
      slot.name = "action";
      actions.append(slot);
      root.append(actions);
    }
    this.replaceShadow(styles, root);
  }
}
