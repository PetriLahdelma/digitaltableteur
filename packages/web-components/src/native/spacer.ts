import {
  DigitaltableteurElement,
  enumAttribute,
  reflectAttribute,
} from "./base";

const SIZES = ["xs", "sm", "md", "lg", "xl", "2xl"] as const;
const AXES = ["vertical", "horizontal"] as const;

export type DtSpacerSize = (typeof SIZES)[number];
export type DtSpacerAxis = (typeof AXES)[number];

const styles = `
  :host { display: block; }
  :host([hidden]) { display: none; }
  .spacer { display: block; box-sizing: border-box; flex: none; }
  .vertical-xs { inline-size: 100%; block-size: var(--space-layout-8, 0.5rem); }
  .vertical-sm { inline-size: 100%; block-size: var(--space-layout-16, 1rem); }
  .vertical-md { inline-size: 100%; block-size: var(--space-layout-24, 1.5rem); }
  .vertical-lg { inline-size: 100%; block-size: var(--space-layout-32, 2rem); }
  .vertical-xl { inline-size: 100%; block-size: var(--space-layout-48, 3rem); }
  .vertical-\\32 xl { inline-size: 100%; block-size: var(--space-layout-64, 4rem); }
  .horizontal-xs { inline-size: var(--space-layout-8, 0.5rem); block-size: 0; }
  .horizontal-sm { inline-size: var(--space-layout-16, 1rem); block-size: 0; }
  .horizontal-md { inline-size: var(--space-layout-24, 1.5rem); block-size: 0; }
  .horizontal-lg { inline-size: var(--space-layout-32, 2rem); block-size: 0; }
  .horizontal-xl { inline-size: var(--space-layout-48, 3rem); block-size: 0; }
  .horizontal-\\32 xl { inline-size: var(--space-layout-64, 4rem); block-size: 0; }
`;

export class DtSpacerElement extends DigitaltableteurElement {
  static observedAttributes = ["size", "axis"];

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  get size(): DtSpacerSize {
    return enumAttribute(this, "size", SIZES, "md");
  }

  set size(value: DtSpacerSize) {
    reflectAttribute(this, "size", value);
  }

  get axis(): DtSpacerAxis {
    return enumAttribute(this, "axis", AXES, "vertical");
  }

  set axis(value: DtSpacerAxis) {
    reflectAttribute(this, "axis", value);
  }

  private render(): void {
    const spacer = this.ownerDocument.createElement("div");
    spacer.className = `spacer ${this.axis}-${this.size}`;
    spacer.setAttribute("part", "spacer");
    spacer.setAttribute("aria-hidden", "true");
    this.setAttribute("aria-hidden", "true");
    this.replaceShadow(styles, spacer);
  }
}
