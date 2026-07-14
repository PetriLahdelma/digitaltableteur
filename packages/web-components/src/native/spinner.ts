import {
  DigitaltableteurElement,
  enumAttribute,
  reflectAttribute,
} from "./base";

const SIZES = ["sm", "md", "lg"] as const;
export type DtSpinnerSize = (typeof SIZES)[number];

const styles = `
  :host {
    display: inline-block;
    line-height: 0;
    vertical-align: middle;
  }

  .spinner {
    display: inline-block;
    box-sizing: border-box;
    border: 2px solid var(--color-border);
    border-block-start-color: var(--color-primary);
    border-radius: 50%;
    animation: dt-spinner-rotate var(--duration-slow) linear infinite;
  }

  .sm { block-size: 1rem; inline-size: 1rem; }
  .md { block-size: 1.25rem; inline-size: 1.25rem; }
  .lg { block-size: 1.75rem; inline-size: 1.75rem; }

  @keyframes dt-spinner-rotate {
    to { transform: rotate(360deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    .spinner { animation-duration: var(--duration-slower, 1.5s); }
  }
`;

export class DtSpinnerElement extends DigitaltableteurElement {
  static observedAttributes = ["label", "size"];

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  get label(): string {
    return this.getAttribute("label") || "Loading";
  }

  set label(value: string) {
    reflectAttribute(this, "label", value || null);
  }

  get size(): DtSpinnerSize {
    return enumAttribute(this, "size", SIZES, "md");
  }

  set size(value: DtSpinnerSize) {
    reflectAttribute(this, "size", value);
  }

  private render(): void {
    const spinner = this.ownerDocument.createElement("span");
    spinner.className = `spinner ${this.size}`;
    spinner.setAttribute("part", "indicator");
    spinner.setAttribute("role", "status");
    spinner.setAttribute("aria-label", this.label);
    this.replaceShadow(styles, spinner);
  }
}
