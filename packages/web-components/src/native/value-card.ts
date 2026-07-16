import {
  DigitaltableteurElement,
  enumAttribute,
  reflectAttribute,
  stringAttribute,
} from "./base";

const VARIANTS = ["default", "bordered", "elevated"] as const;
export type DtValueCardVariant = (typeof VARIANTS)[number];

const styles = `
  :host { display: block; }
  article { position: relative; box-sizing: border-box; padding: var(--space-layout-24); border-radius: var(--radius-lg, 8px); background: var(--main-body-background-color); color: var(--color-text); transition: box-shadow var(--duration-normal, .3s), transform var(--duration-normal, .3s), border-color var(--duration-normal, .3s); overflow: hidden; }
  .bordered { border: 1px solid var(--color-border); }
  .bordered:hover { border-color: var(--color-primary); box-shadow: var(--shadow-sm); }
  .elevated { background: var(--color-surface); box-shadow: var(--shadow-lg); }
  .elevated:hover { box-shadow: var(--shadow-xl); transform: translateY(-.25rem); }
  .icon { display: flex; inline-size: 3rem; block-size: 3rem; margin-block-end: var(--space-internal-16); justify-content: center; align-items: center; border-radius: var(--radius-lg, 8px); background: color-mix(in srgb, var(--color-primary) 10%, transparent); color: var(--color-primary); }
  h3 { margin: 0 0 var(--space-internal-8); font-family: var(--font-display); font-size: var(--font-size-title-xxs, 1.125rem); color: var(--color-title); }
  p { margin: 0; font-family: var(--font-body); font-size: var(--font-size-text-s, .875rem); line-height: var(--line-height-relaxed, 1.6); color: var(--secondary-text-color); }
  @media (prefers-reduced-motion: reduce) { article { transition: none; } .elevated:hover { transform: none; } }
  @media (forced-colors: active) { article { border: 1px solid CanvasText; background: Canvas; color: CanvasText; } .icon { forced-color-adjust: auto; } }
`;

export class DtValueCardElement extends DigitaltableteurElement {
  static observedAttributes = ["title", "description", "variant"];
  connectedCallback(): void {
    this.render();
    this.observeLightDom(() => this.render());
  }
  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }
  get title(): string {
    return stringAttribute(this, "title");
  }
  set title(value: string) {
    reflectAttribute(this, "title", value || null);
  }
  get description(): string {
    return stringAttribute(this, "description");
  }
  set description(value: string) {
    reflectAttribute(this, "description", value || null);
  }
  get variant(): DtValueCardVariant {
    return enumAttribute(this, "variant", VARIANTS, "default");
  }
  set variant(value: DtValueCardVariant) {
    reflectAttribute(this, "variant", value);
  }
  private render(): void {
    const article = this.ownerDocument.createElement("article");
    article.className = this.variant;
    article.setAttribute("part", "card");
    const icon = this.ownerDocument.createElement("div");
    icon.className = "icon";
    icon.setAttribute("part", "icon");
    const iconSlot = this.ownerDocument.createElement("slot");
    iconSlot.name = "icon";
    icon.append(iconSlot);
    const heading = this.ownerDocument.createElement("h3");
    heading.textContent = this.title;
    const description = this.ownerDocument.createElement("p");
    description.textContent = this.description;
    const slot = this.ownerDocument.createElement("slot");
    article.append(icon, heading, description, slot);
    this.replaceShadow(styles, article);
  }
}
