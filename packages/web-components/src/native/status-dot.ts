import {
  DigitaltableteurElement,
  enumAttribute,
  hasDefaultSlotContent,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";

const TONES = ["neutral", "success", "warning", "error", "info"] as const;
const SIZES = ["sm", "md", "lg"] as const;
export type DtStatusDotTone = (typeof TONES)[number];
export type DtStatusDotSize = (typeof SIZES)[number];

const styles = `
  :host { display: inline-flex; vertical-align: middle; }
  .root { display: inline-flex; align-items: center; gap: var(--space-internal-6); font-family: var(--font-body); color: var(--color-text); }
  .dot { inline-size: 0.5em; block-size: 0.5em; flex: none; border-radius: 50%; background: currentcolor; }
  .sm { font-size: var(--font-size-text-xxs); } .md { font-size: var(--font-size-text-s); } .lg { font-size: var(--font-size-text-m); }
  .neutral { color: var(--color-muted); } .success { color: var(--color-success); } .warning { color: var(--color-warning); } .error { color: var(--color-error); } .info { color: var(--color-info); }
  .pulse { animation: dt-status-pulse 2s var(--ease-out-cubic) infinite; }
  .label { line-height: 1.3; }
  .srOnly { position: absolute; margin: -1px; padding: 0; inline-size: 1px; block-size: 1px; border: 0; clip-path: inset(50%); white-space: nowrap; overflow: hidden; }
  @keyframes dt-status-pulse { 0% { box-shadow: 0 0 0 0 color-mix(in srgb, currentcolor 45%, transparent); } 70%, 100% { box-shadow: 0 0 0 0.4em transparent; } }
  @media (prefers-reduced-motion: reduce) { .pulse { animation: none; } }
  @media (forced-colors: active) { .dot { border: 1px solid CanvasText; background: CanvasText; } }
`;

export class DtStatusDotElement extends DigitaltableteurElement {
  static observedAttributes = ["tone", "size", "pulse", "label"];
  connectedCallback(): void {
    this.render();
    this.observeLightDom(() => this.render());
  }
  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }
  get tone(): DtStatusDotTone {
    return enumAttribute(this, "tone", TONES, "neutral");
  }
  set tone(value: DtStatusDotTone) {
    reflectAttribute(this, "tone", value);
  }
  get size(): DtStatusDotSize {
    return enumAttribute(this, "size", SIZES, "md");
  }
  set size(value: DtStatusDotSize) {
    reflectAttribute(this, "size", value);
  }
  get pulse(): boolean {
    return this.hasAttribute("pulse");
  }
  set pulse(value: boolean) {
    reflectBooleanAttribute(this, "pulse", value);
  }
  get label(): string {
    return stringAttribute(this, "label");
  }
  set label(value: string) {
    reflectAttribute(this, "label", value || null);
  }
  private render(): void {
    const root = this.ownerDocument.createElement("span");
    root.className = `root ${this.size}`;
    root.setAttribute("part", "root");
    const dot = this.ownerDocument.createElement("span");
    dot.className = ["dot", this.tone, this.pulse ? "pulse" : ""]
      .filter(Boolean)
      .join(" ");
    dot.setAttribute("part", "dot");
    dot.setAttribute("aria-hidden", "true");
    const label = this.ownerDocument.createElement("span");
    label.className = hasDefaultSlotContent(this) ? "label" : "srOnly";
    label.setAttribute("part", "label");
    const slot = this.ownerDocument.createElement("slot");
    if (this.label) slot.textContent = this.label;
    label.append(slot);
    root.append(dot, label);
    this.replaceShadow(styles, root);
  }
}
