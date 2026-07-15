import {
  DigitaltableteurElement,
  enumAttribute,
  reflectAttribute,
  stringAttribute,
} from "./base";

const TAGS = [
  "p",
  "span",
  "div",
  "strong",
  "em",
  "cite",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
] as const;
const SIZES = ["xxs", "xs", "s", "m", "l", "xl", "xxl"] as const;
const LINE_HEIGHTS = ["tight", "snug", "normal", "relaxed", "loose"] as const;

export type DtTextTag = (typeof TAGS)[number];
export type DtTextSize = (typeof SIZES)[number];
export type DtTextLineHeight = (typeof LINE_HEIGHTS)[number];

const INLINE_TAGS = new Set<DtTextTag>(["span", "strong", "em", "cite"]);

const styles = `
  :host { display: block; }
  :host([hidden]) { display: none; }
  :host([as="span"]),
  :host([as="strong"]),
  :host([as="em"]),
  :host([as="cite"]) { display: inline; }
  .text {
    margin-block: 0 var(--space-layout-16, 1rem);
    margin-inline: 0;
    font-family: var(--font-text);
    font-size: var(--font-size-text);
    font-weight: var(--font-weight-text);
    line-height: 1.6;
    color: var(--color-text);
  }
  .textXXS { font-size: var(--font-size-text-xxs); }
  .textXS { font-size: var(--font-size-text-xs); }
  .textS { font-size: var(--font-size-text-s); }
  .textM { font-size: var(--font-size-text-m); }
  .textL { font-size: var(--font-size-text-l); }
  .textXL { font-size: var(--font-size-text-xl); }
  .textXXL { font-size: var(--font-size-text-xxl); }
  .lineHeightTight { line-height: var(--line-height-tight); }
  .lineHeightSnug { line-height: var(--line-height-snug); }
  .lineHeightNormal { line-height: var(--line-height-normal); }
  .lineHeightRelaxed { line-height: var(--line-height-relaxed); }
  .lineHeightLoose { line-height: var(--line-height-loose); }
  @supports (font-optical-sizing: auto) {
    .text { font-optical-sizing: auto; }
  }
`;

function lineHeightAttribute(element: Element): DtTextLineHeight | null {
  const value = element.getAttribute("line-height");
  return LINE_HEIGHTS.includes(value as DtTextLineHeight)
    ? (value as DtTextLineHeight)
    : null;
}

function sizeClass(size: DtTextSize): string {
  switch (size) {
    case "xxs":
      return "textXXS";
    case "xs":
      return "textXS";
    case "s":
      return "textS";
    case "m":
      return "textM";
    case "l":
      return "textL";
    case "xl":
      return "textXL";
    case "xxl":
      return "textXXL";
  }
}

function lineHeightClass(lineHeight: DtTextLineHeight | null): string {
  switch (lineHeight) {
    case "tight":
      return "lineHeightTight";
    case "snug":
      return "lineHeightSnug";
    case "normal":
      return "lineHeightNormal";
    case "relaxed":
      return "lineHeightRelaxed";
    case "loose":
      return "lineHeightLoose";
    default:
      return "";
  }
}

export class DtTextElement extends DigitaltableteurElement {
  static observedAttributes = ["as", "size", "line-height", "content"];

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  get as(): DtTextTag {
    return enumAttribute(this, "as", TAGS, "p");
  }

  set as(value: DtTextTag) {
    reflectAttribute(this, "as", value);
  }

  get size(): DtTextSize {
    return enumAttribute(this, "size", SIZES, "m");
  }

  set size(value: DtTextSize) {
    reflectAttribute(this, "size", value);
  }

  get lineHeight(): DtTextLineHeight | null {
    return lineHeightAttribute(this);
  }

  set lineHeight(value: DtTextLineHeight | null) {
    reflectAttribute(this, "line-height", value);
  }

  get content(): string {
    return stringAttribute(this, "content");
  }

  set content(value: string) {
    reflectAttribute(this, "content", value || null);
  }

  private render(): void {
    const tag = this.as;
    const element = this.ownerDocument.createElement(tag);
    element.className = [
      "text",
      sizeClass(this.size),
      lineHeightClass(this.lineHeight),
    ]
      .filter(Boolean)
      .join(" ");
    element.setAttribute("part", "root text");

    const slot = this.ownerDocument.createElement("slot");
    slot.setAttribute("part", "content");
    if (this.content) slot.textContent = this.content;
    element.append(slot);

    if (INLINE_TAGS.has(tag)) {
      element.style.display = "inline";
      element.style.margin = "0";
    }

    this.replaceShadow(styles, element);
  }
}
