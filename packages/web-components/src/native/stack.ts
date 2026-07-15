import {
  DigitaltableteurElement,
  enumAttribute,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";

const DIRECTIONS = ["vertical", "horizontal"] as const;
const GAPS = ["none", "xs", "sm", "md", "lg", "xl"] as const;
const ALIGNMENTS = ["stretch", "start", "center", "end"] as const;
const JUSTIFICATIONS = ["start", "center", "end", "between", "around"] as const;
const TAGS = [
  "div",
  "section",
  "article",
  "aside",
  "nav",
  "main",
  "header",
  "footer",
  "ul",
  "ol",
  "li",
  "form",
] as const;

export type DtStackDirection = (typeof DIRECTIONS)[number];
export type DtStackGap = (typeof GAPS)[number];
export type DtStackAlign = (typeof ALIGNMENTS)[number];
export type DtStackJustify = (typeof JUSTIFICATIONS)[number];
export type DtStackTag = (typeof TAGS)[number];

const styles = `
  :host { display: block; }
  :host([hidden]) { display: none; }
  .root { display: flex; box-sizing: border-box; }
  .vertical { flex-direction: column; }
  .horizontal { flex-direction: row; }
  .gap-none { gap: 0; }
  .gap-xs { gap: var(--space-internal-4, 0.25rem); }
  .gap-sm { gap: var(--space-internal-8, 0.5rem); }
  .gap-md { gap: var(--space-internal-16, 1rem); }
  .gap-lg { gap: var(--space-internal-24, 1.5rem); }
  .gap-xl { gap: var(--space-internal-32, 2rem); }
  .align-stretch { align-items: stretch; }
  .align-start { align-items: flex-start; }
  .align-center { align-items: center; }
  .align-end { align-items: flex-end; }
  .justify-start { justify-content: flex-start; }
  .justify-center { justify-content: center; }
  .justify-end { justify-content: flex-end; }
  .justify-between { justify-content: space-between; }
  .justify-around { justify-content: space-around; }
  .wrap { flex-wrap: wrap; }
`;

export class DtStackElement extends DigitaltableteurElement {
  static observedAttributes = [
    "direction",
    "gap",
    "align",
    "justify",
    "wrap",
    "as",
    "content",
    "role",
    "aria-label",
  ];

  connectedCallback(): void {
    this.render();
  }
  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  get direction(): DtStackDirection {
    return enumAttribute(this, "direction", DIRECTIONS, "vertical");
  }
  set direction(value: DtStackDirection) {
    reflectAttribute(this, "direction", value);
  }
  get gap(): DtStackGap {
    return enumAttribute(this, "gap", GAPS, "md");
  }
  set gap(value: DtStackGap) {
    reflectAttribute(this, "gap", value);
  }
  get align(): DtStackAlign {
    return enumAttribute(this, "align", ALIGNMENTS, "stretch");
  }
  set align(value: DtStackAlign) {
    reflectAttribute(this, "align", value);
  }
  get justify(): DtStackJustify {
    return enumAttribute(this, "justify", JUSTIFICATIONS, "start");
  }
  set justify(value: DtStackJustify) {
    reflectAttribute(this, "justify", value);
  }
  get wrap(): boolean {
    return this.hasAttribute("wrap");
  }
  set wrap(value: boolean) {
    reflectBooleanAttribute(this, "wrap", value);
  }
  get as(): DtStackTag {
    return enumAttribute(this, "as", TAGS, "div");
  }
  set as(value: DtStackTag) {
    reflectAttribute(this, "as", value);
  }
  get content(): string {
    return stringAttribute(this, "content");
  }
  set content(value: string) {
    reflectAttribute(this, "content", value || null);
  }

  private render(): void {
    const root = this.ownerDocument.createElement(this.as);
    root.className = [
      "root",
      this.direction,
      `gap-${this.gap}`,
      `align-${this.align}`,
      `justify-${this.justify}`,
      this.wrap ? "wrap" : "",
    ]
      .filter(Boolean)
      .join(" ");
    root.setAttribute("part", "stack");
    for (const attribute of ["role", "aria-label"]) {
      const value = this.getAttribute(attribute);
      if (value !== null) root.setAttribute(attribute, value);
    }
    const slot = this.ownerDocument.createElement("slot");
    if (this.content) slot.textContent = this.content;
    root.append(slot);
    this.replaceShadow(styles, root);
  }
}
