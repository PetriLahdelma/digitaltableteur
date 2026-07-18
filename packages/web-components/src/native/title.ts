import {
  DigitaltableteurElement,
  enumAttribute,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";

const TAGS = ["h1", "h2", "h3", "h4", "h5", "h6", "div"] as const;
const SIZES = ["xxs", "xs", "s", "m", "l", "xl", "xxl"] as const;
const LINE_HEIGHTS = ["tight", "snug", "normal", "relaxed", "loose"] as const;

export type DtTitleTag = (typeof TAGS)[number];
export type DtTitleSize = (typeof SIZES)[number];
export type DtTitleLineHeight = (typeof LINE_HEIGHTS)[number];
export type DtTitleLevel = 1 | 2 | 3 | 4 | 5 | 6;

const styles = `
  :host { display: block; }
  :host([hidden]) { display: none; }
  .title {
    margin-block: 0 var(--space-layout-16, 1rem);
    margin-inline: 0;
    font-family: var(--font-title);
    font-size: var(--font-size-title);
    font-weight: 500;
    overflow-wrap: normal;
    word-break: normal;
    hyphens: none;
    color: var(--color-title);
  }
  .titleXXS { font-size: var(--font-size-title-xxs); }
  .titleXS { font-size: var(--font-size-title-xs); }
  .titleS { font-size: var(--font-size-title-s); }
  .titleM { font-size: var(--font-size-title-m); }
  .titleL { font-size: var(--font-size-title-l); }
  .titleXL { font-size: var(--font-size-title-xl); }
  .titleXXL { font-size: var(--font-size-title-xxl); }
  h1.title { line-height: var(--line-height-tight); }
  h2.title, h3.title { line-height: var(--line-height-snug); }
  h4.title, h5.title, h6.title, div.title { line-height: var(--line-height-normal); }
  .title.lineHeightTight { line-height: var(--line-height-tight); }
  .title.lineHeightSnug { line-height: var(--line-height-snug); }
  .title.lineHeightNormal { line-height: var(--line-height-normal); }
  .title.lineHeightRelaxed { line-height: var(--line-height-relaxed); }
  .title.lineHeightLoose { line-height: var(--line-height-loose); }
  @supports (text-wrap: balance) {
    .title { text-wrap: balance; }
  }
  @supports (font-optical-sizing: auto) {
    .title { font-optical-sizing: auto; }
  }
  @media (width < 768px) {
    .title {
      max-inline-size: 100%;
      overflow-wrap: anywhere;
    }
  }
`;

function lineHeightAttribute(element: Element): DtTitleLineHeight | null {
  const value = element.getAttribute("line-height");
  return LINE_HEIGHTS.includes(value as DtTitleLineHeight)
    ? (value as DtTitleLineHeight)
    : null;
}

function levelAttribute(element: Element): DtTitleLevel | null {
  const value = Number(element.getAttribute("level"));
  return Number.isInteger(value) && value >= 1 && value <= 6
    ? (value as DtTitleLevel)
    : null;
}

function asAttribute(element: Element): DtTitleTag | null {
  const value = element.getAttribute("as");
  return TAGS.includes(value as DtTitleTag) ? (value as DtTitleTag) : null;
}

function sizeClass(size: DtTitleSize): string {
  switch (size) {
    case "xxs":
      return "titleXXS";
    case "xs":
      return "titleXS";
    case "s":
      return "titleS";
    case "m":
      return "titleM";
    case "l":
      return "titleL";
    case "xl":
      return "titleXL";
    case "xxl":
      return "titleXXL";
  }
}

function lineHeightClass(lineHeight: DtTitleLineHeight | null): string {
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

export class DtTitleElement extends DigitaltableteurElement {
  static observedAttributes = [
    "as",
    "size",
    "level",
    "line-height",
    "unstyled",
    "content",
  ];

  connectedCallback(): void {
    this.render();
    this.observeLightDom(() => this.render());
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  get as(): DtTitleTag | null {
    return asAttribute(this);
  }

  set as(value: DtTitleTag | null) {
    reflectAttribute(this, "as", value);
  }

  get size(): DtTitleSize {
    return enumAttribute(this, "size", SIZES, "l");
  }

  set size(value: DtTitleSize) {
    reflectAttribute(this, "size", value);
  }

  get level(): DtTitleLevel | null {
    return levelAttribute(this);
  }

  set level(value: DtTitleLevel | null) {
    reflectAttribute(this, "level", value);
  }

  get lineHeight(): DtTitleLineHeight | null {
    return lineHeightAttribute(this);
  }

  set lineHeight(value: DtTitleLineHeight | null) {
    reflectAttribute(this, "line-height", value);
  }

  get unstyled(): boolean {
    return this.hasAttribute("unstyled");
  }

  set unstyled(value: boolean) {
    reflectBooleanAttribute(this, "unstyled", value);
  }

  get content(): string {
    return stringAttribute(this, "content");
  }

  set content(value: string) {
    reflectAttribute(this, "content", value || null);
  }

  private resolvedTag(): DtTitleTag {
    const as = this.as;
    if (as) return as;
    const level = this.level;
    return level ? (`h${level}` as DtTitleTag) : "h1";
  }

  private render(): void {
    const element = this.ownerDocument.createElement(this.resolvedTag());
    if (!this.unstyled) {
      element.className = [
        "title",
        sizeClass(this.size),
        lineHeightClass(this.lineHeight),
      ]
        .filter(Boolean)
        .join(" ");
    }
    element.setAttribute("part", "root title");

    const slot = this.ownerDocument.createElement("slot");
    slot.setAttribute("part", "content");
    if (this.content) slot.textContent = this.content;
    element.append(slot);

    this.replaceShadow(styles, element);
  }
}
