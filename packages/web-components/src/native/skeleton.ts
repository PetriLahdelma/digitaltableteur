import {
  DigitaltableteurElement,
  enumAttribute,
  reflectAttribute,
  stringAttribute,
} from "./base";

const VARIANTS = ["text", "circle", "rect", "avatar", "card"] as const;
export type DtSkeletonVariant = (typeof VARIANTS)[number];

const styles = `
  :host {
    display: inline-block;
    max-inline-size: 100%;
    vertical-align: middle;
  }
  :host([hidden]) {
    display: none;
  }
  :host(:not([variant])),
  :host([variant="text"]) {
    display: block;
  }
  .root {
    --skeleton-base: var(--color-muted);
    --skeleton-highlight: var(--skeleton-base);
    display: block;
    position: relative;
    overflow: hidden;
    border-radius: 4px;
    background: linear-gradient(
      90deg,
      var(--skeleton-base) 25%,
      var(--skeleton-highlight) 50%,
      var(--skeleton-base) 75%
    );
    background-size: 400% 100%;
    box-sizing: border-box;
  }
  @supports (color: color-mix(in srgb, red, white)) {
    .root {
      --skeleton-highlight: color-mix(
        in srgb,
        var(--skeleton-base) 45%,
        white 55%
      );
    }
  }
  .animate {
    animation: dt-skeleton-shimmer 1.2s ease-in-out infinite;
  }
  .static {
    background: var(--color-gray);
  }
  .text {
    --skeleton-base: var(--color-muted);
    --skeleton-highlight: var(--skeleton-base);
    display: flex;
    flex-direction: column;
    gap: 6px;
    background: none;
    overflow: hidden;
  }
  @supports (color: color-mix(in srgb, red, white)) {
    .text {
      --skeleton-highlight: color-mix(
        in srgb,
        var(--skeleton-base) 45%,
        white 55%
      );
    }
  }
  .line {
    display: block;
    block-size: 0.75rem;
    border-radius: 4px;
    background: linear-gradient(
      90deg,
      var(--skeleton-base) 25%,
      var(--skeleton-highlight) 50%,
      var(--skeleton-base) 75%
    );
    background-size: 400% 100%;
  }
  @supports (color: color-mix(in srgb, red, white)) {
    .line {
      background: linear-gradient(
        90deg,
        var(--skeleton-base) 25%,
        color-mix(in srgb, var(--skeleton-base) 45%, white 55%) 50%,
        var(--skeleton-base) 75%
      );
      background-size: 400% 100%;
    }
  }
  .text.animate .line {
    animation: dt-skeleton-shimmer 1.2s ease-in-out infinite;
  }
  .text.static .line {
    background: var(--color-gray);
  }
  .circle {
    inline-size: 48px;
    block-size: 48px;
    border-radius: 50%;
  }
  .avatar {
    inline-size: 64px;
    block-size: 64px;
    border-radius: 50%;
  }
  .rect {
    inline-size: 100%;
    block-size: 120px;
  }
  .card {
    inline-size: 100%;
    block-size: 180px;
    border-radius: 8px;
  }
  @media (prefers-reduced-motion: reduce) {
    .animate,
    .text.animate .line {
      animation: none;
    }
  }
  @media (forced-colors: active) {
    .root:not(.text),
    .line {
      background: GrayText;
    }
    .static,
    .text.static .line {
      background: GrayText;
    }
  }
  @keyframes dt-skeleton-shimmer {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: 0 0;
    }
  }
`;

function animateAttribute(element: Element): boolean {
  const value = element.getAttribute("animate");
  if (value === null || value === "") return true;
  return value !== "false";
}

function linesAttribute(element: Element): number {
  const rawValue = element.getAttribute("lines");
  if (rawValue == null || rawValue.trim() === "") return 3;
  const value = Number(rawValue);
  if (!Number.isFinite(value)) return 3;
  return Math.max(0, Math.trunc(value));
}

function dimensionAttribute(element: Element, name: string): string {
  const value = stringAttribute(element, name);
  if (!value) return "";
  return /^-?\d+(?:\.\d+)?$/.test(value) ? `${value}px` : value;
}

export class DtSkeletonElement extends DigitaltableteurElement {
  static observedAttributes = [
    "variant",
    "width",
    "height",
    "lines",
    "label",
    "animate",
  ];

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  get variant(): DtSkeletonVariant {
    return enumAttribute(this, "variant", VARIANTS, "text");
  }

  set variant(value: DtSkeletonVariant) {
    reflectAttribute(this, "variant", value);
  }

  get width(): string {
    return stringAttribute(this, "width");
  }

  set width(value: number | string) {
    reflectAttribute(this, "width", value === "" ? null : String(value));
  }

  get height(): string {
    return stringAttribute(this, "height");
  }

  set height(value: number | string) {
    reflectAttribute(this, "height", value === "" ? null : String(value));
  }

  get lines(): number {
    return linesAttribute(this);
  }

  set lines(value: number) {
    reflectAttribute(this, "lines", value);
  }

  get label(): string {
    return stringAttribute(this, "label", "Loading content");
  }

  set label(value: string) {
    reflectAttribute(this, "label", value || null);
  }

  private render(): void {
    const root = this.ownerDocument.createElement("span");
    root.className = [
      "root",
      this.variant,
      animateAttribute(this) ? "animate" : "static",
    ].join(" ");
    root.setAttribute("part", "root skeleton");
    root.setAttribute("role", "status");
    root.setAttribute("aria-live", "polite");
    root.setAttribute("aria-label", this.label);

    const width = dimensionAttribute(this, "width");
    const height = dimensionAttribute(this, "height");
    if (width) root.style.width = width;
    if (height && this.variant !== "text") root.style.height = height;

    if (this.variant === "text") {
      for (let index = 0; index < this.lines; index += 1) {
        const line = this.ownerDocument.createElement("span");
        line.className = "line";
        line.setAttribute("part", "line skeleton-line");
        root.append(line);
      }
    }

    this.replaceShadow(styles, root);
  }
}
