import {
  DigitaltableteurElement,
  enumAttribute,
  numberAttribute,
  reflectAttribute,
  reflectBooleanAttribute,
} from "./base";

const SIZES = ["sm", "md", "lg"] as const;
const STATES = ["neutral", "success", "info", "warning", "error"] as const;

export type DtProgressSize = (typeof SIZES)[number];
export type DtProgressState = (typeof STATES)[number];

const styles = `
  :host {
    display: block;
    inline-size: 100%;
  }

  .track {
    position: relative;
    box-sizing: border-box;
    inline-size: 100%;
    border-radius: var(--radius-full);
    background: var(--color-neutral-bg);
    overflow: hidden;
  }

  .sm { block-size: var(--space-internal-4); }
  .md { block-size: var(--space-internal-8); }
  .lg { block-size: var(--space-layout-16); }

  .bar {
    block-size: 100%;
    inline-size: 100%;
    background: var(--color-primary);
    transition: transform var(--duration-normal) var(--ease-out-expo);
    transform-origin: left center;
  }

  .success { background: var(--color-success); }
  .info { background: var(--color-info); }
  .warning { background: var(--color-warning); }
  .error { background: var(--color-error); }

  .indeterminate {
    inline-size: 40%;
    transition: none;
    animation: dt-progress-sweep var(--duration-slower, 1.4s) ease-in-out infinite;
  }

  @keyframes dt-progress-sweep {
    from { transform: translateX(-100%) scaleX(1); }
    to { transform: translateX(250%) scaleX(1); }
  }

  @media (prefers-reduced-motion: reduce) {
    .indeterminate { animation-duration: 2.8s; }
  }
`;

export class DtProgressElement extends DigitaltableteurElement {
  static observedAttributes = [
    "value",
    "max",
    "label",
    "size",
    "state",
    "indeterminate",
  ];

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  get value(): number {
    return numberAttribute(this, "value", 0);
  }

  set value(value: number) {
    reflectAttribute(this, "value", Number.isFinite(value) ? value : null);
  }

  get max(): number {
    const max = numberAttribute(this, "max", 100);
    return max > 0 ? max : 100;
  }

  set max(value: number) {
    reflectAttribute(this, "max", Number.isFinite(value) && value > 0 ? value : null);
  }

  get label(): string {
    return this.getAttribute("label") || "Progress";
  }

  set label(value: string) {
    reflectAttribute(this, "label", value || null);
  }

  get size(): DtProgressSize {
    return enumAttribute(this, "size", SIZES, "md");
  }

  set size(value: DtProgressSize) {
    reflectAttribute(this, "size", value);
  }

  get state(): DtProgressState {
    return enumAttribute(this, "state", STATES, "neutral");
  }

  set state(value: DtProgressState) {
    reflectAttribute(this, "state", value);
  }

  get indeterminate(): boolean {
    return this.hasAttribute("indeterminate");
  }

  set indeterminate(value: boolean) {
    reflectBooleanAttribute(this, "indeterminate", value);
  }

  private render(): void {
    const currentValue = Math.min(this.max, Math.max(0, this.value));
    const ratio = currentValue / this.max;
    const track = this.ownerDocument.createElement("div");
    track.className = `track ${this.size}`;
    track.setAttribute("part", "track");
    track.setAttribute("role", "progressbar");
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", String(this.max));
    track.setAttribute("aria-label", this.label);
    if (!this.indeterminate) {
      track.setAttribute("aria-valuenow", String(currentValue));
    }

    const bar = this.ownerDocument.createElement("div");
    bar.className = [
      "bar",
      this.state,
      this.indeterminate ? "indeterminate" : "",
    ]
      .filter(Boolean)
      .join(" ");
    bar.setAttribute("part", "bar");
    if (!this.indeterminate) bar.style.transform = `scaleX(${ratio})`;
    track.append(bar);
    this.replaceShadow(styles, track);
  }
}
