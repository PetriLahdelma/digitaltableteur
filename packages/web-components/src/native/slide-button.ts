import {
  DigitaltableteurElement,
  enumAttribute,
  reflectAttribute,
  stringAttribute,
} from "./base";

const ICON_SIDES = ["left", "right"] as const;
export type DtSlideButtonIconSide = (typeof ICON_SIDES)[number];

// Mirrors nextjs-app/shared/components/SlideButton/SlideButton.module.css:
// a primary pill whose icon disc slides across on hover while the label shifts
// and the disc rolls a full turn. All motion is gated behind reduced motion.
const styles = `
  :host { display: inline-flex; vertical-align: middle; }
  :host([hidden]) { display: none; }
  .root {
    position: relative;
    display: inline-flex;
    align-items: center;
    block-size: 2.75rem;
    border-radius: var(--radius-full, 9999px);
    background-color: var(--color-primary);
    color: var(--color-primary-foreground, var(--color-white, #fff));
    font-family: var(--primary-body-font);
    font-weight: var(--font-weight-medium, 500);
    font-size: 1rem;
    text-decoration: none;
    cursor: pointer;
    padding-block: 0.375rem;
    padding-inline: 0.375rem 1.25rem;
  }
  .root.reverse { padding-inline: 1.25rem 0.375rem; }
  .root:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-background, #fff), 0 0 0 4px var(--color-ring, var(--color-primary));
  }
  .label {
    position: relative;
    z-index: 1;
    white-space: nowrap;
    padding-inline: 2.75rem 1.25rem;
    transition: padding 300ms var(--ease-out-cubic, ease-out);
  }
  .root.reverse .label { padding-inline: 1.25rem 2.75rem; }
  .icon-track {
    position: absolute;
    inset-block: 0;
    margin-block: auto;
    inset-inline-start: 0.375rem;
    z-index: 2;
    inline-size: 2rem;
    block-size: 2rem;
    transition: inset-inline-start 600ms var(--ease-out-cubic, ease-out);
  }
  .root.reverse .icon-track { inset-inline-start: calc(100% - 2.375rem); }
  .disc {
    display: flex;
    align-items: center;
    justify-content: center;
    inline-size: 2rem;
    block-size: 2rem;
    border-radius: var(--radius-circle, 50%);
    background-color: var(--logo-background);
    animation: dt-slide-button-roll-back 600ms var(--ease-out-cubic, ease-out);
  }
  .disc dt-icon { color: var(--color-foreground); inline-size: 1.25rem; block-size: 1.25rem; }
  @media (hover: hover) and (pointer: fine) {
    .root:hover .label { padding-inline: 1.25rem 2.75rem; }
    .root.reverse:hover .label { padding-inline: 2.75rem 1.25rem; }
    .root:hover .icon-track { inset-inline-start: calc(100% - 2.375rem); }
    .root.reverse:hover .icon-track { inset-inline-start: 0.375rem; }
    .root:hover .disc { animation: dt-slide-button-roll 600ms var(--ease-out-cubic, ease-out); }
  }
  @keyframes dt-slide-button-roll { from { transform: rotate(0); } to { transform: rotate(360deg); } }
  @keyframes dt-slide-button-roll-back { from { transform: rotate(360deg); } to { transform: rotate(0); } }
  @media (prefers-reduced-motion: reduce) {
    .label, .icon-track { transition: none; }
    .disc, .root:hover .disc { animation: none; }
    .root:hover .label { padding-inline: 2.75rem 1.25rem; }
    .root.reverse:hover .label { padding-inline: 1.25rem 2.75rem; }
    .root:hover .icon-track { inset-inline-start: 0.375rem; }
    .root.reverse:hover .icon-track { inset-inline-start: calc(100% - 2.375rem); }
  }
`;

export class DtSlideButtonElement extends DigitaltableteurElement {
  static observedAttributes = ["label", "href", "icon", "icon-side"];

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
  get href(): string {
    return stringAttribute(this, "href");
  }
  set href(value: string) {
    reflectAttribute(this, "href", value || null);
  }
  get icon(): string {
    return stringAttribute(this, "icon", "lightning");
  }
  set icon(value: string) {
    reflectAttribute(this, "icon", value || null);
  }
  get iconSide(): DtSlideButtonIconSide {
    return enumAttribute(this, "icon-side", ICON_SIDES, "left");
  }
  set iconSide(value: DtSlideButtonIconSide) {
    reflectAttribute(this, "icon-side", value);
  }

  private render(): void {
    const doc = this.ownerDocument;
    const anchor = doc.createElement("a");
    anchor.className = this.iconSide === "right" ? "root reverse" : "root";
    if (this.href) anchor.setAttribute("href", this.href);
    anchor.setAttribute("aria-label", this.label);

    const label = doc.createElement("span");
    label.className = "label";
    label.textContent = this.label;

    const track = doc.createElement("span");
    track.className = "icon-track";
    track.setAttribute("aria-hidden", "true");
    const disc = doc.createElement("span");
    disc.className = "disc";
    const icon = doc.createElement("dt-icon");
    icon.setAttribute("name", this.icon || "lightning");
    icon.setAttribute("weight", "fill");
    disc.appendChild(icon);
    track.appendChild(disc);

    anchor.append(label, track);
    this.replaceShadow(styles, anchor);
  }
}
