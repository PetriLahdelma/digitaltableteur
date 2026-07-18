import {
  DigitaltableteurElement,
  enumAttribute,
  reflectAttribute,
  reflectBooleanAttribute,
} from "./base";

const ORIENTATIONS = ["horizontal", "vertical"] as const;
export type DtDividerOrientation = (typeof ORIENTATIONS)[number];

const styles = `
  :host { display: block; flex: none; }
  :host([orientation="vertical"]) { display: inline-block; min-block-size: var(--space-layout-24); align-self: stretch; }
  hr { margin: 0; border: 0; background: var(--color-border); }
  .horizontal { inline-size: 100%; block-size: 1px; }
  .vertical { inline-size: 1px; block-size: 100%; min-block-size: var(--space-layout-24); }
  /*
   * The React Divider's line is a light-DOM <hr>, so in forced-colors it
   * survives via Tailwind preflight's border-style:solid + border-top-width.
   * The shadow-DOM twin never sees that preflight, so its background line is
   * forced to Canvas and the rule vanishes (an a11y regression, not a waiver).
   * Redraw it with a system color so high-contrast mode keeps the separator,
   * matching React's rendered output.
   */
  @media (forced-colors: active) {
    hr { background: CanvasText; }
  }
`;

export class DtDividerElement extends DigitaltableteurElement {
  static observedAttributes = ["orientation", "decorative"];
  connectedCallback(): void {
    this.render();
  }
  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }
  get orientation(): DtDividerOrientation {
    return enumAttribute(this, "orientation", ORIENTATIONS, "horizontal");
  }
  set orientation(value: DtDividerOrientation) {
    reflectAttribute(this, "orientation", value);
  }
  get decorative(): boolean {
    return (
      !this.hasAttribute("decorative") ||
      this.getAttribute("decorative") !== "false"
    );
  }
  set decorative(value: boolean) {
    value
      ? this.removeAttribute("decorative")
      : this.setAttribute("decorative", "false");
  }
  private render(): void {
    const divider = this.ownerDocument.createElement("hr");
    divider.className = this.orientation;
    divider.setAttribute("part", "divider");
    divider.setAttribute("role", this.decorative ? "none" : "separator");
    if (!this.decorative)
      divider.setAttribute("aria-orientation", this.orientation);
    this.replaceShadow(styles, divider);
  }
}
