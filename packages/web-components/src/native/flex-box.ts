import {
  DigitaltableteurElement,
  enumAttribute,
  reflectAttribute,
  stringAttribute,
} from "./base";

const DIRECTIONS = ["row", "row-reverse", "column", "column-reverse"] as const;
const WRAPS = ["nowrap", "wrap", "wrap-reverse"] as const;
const JUSTIFICATIONS = [
  "flex-start",
  "flex-end",
  "center",
  "space-between",
  "space-around",
  "space-evenly",
] as const;
const ALIGNMENTS = [
  "stretch",
  "flex-start",
  "flex-end",
  "center",
  "baseline",
] as const;
const ALIGN_CONTENTS = [
  "stretch",
  "flex-start",
  "flex-end",
  "center",
  "space-between",
  "space-around",
] as const;
const FORWARDED_ATTRIBUTES = [
  "role",
  "aria-label",
  "aria-labelledby",
  "aria-describedby",
] as const;

export type DtFlexBoxDirection = (typeof DIRECTIONS)[number];
export type DtFlexBoxWrap = (typeof WRAPS)[number];
export type DtFlexBoxJustify = (typeof JUSTIFICATIONS)[number];
export type DtFlexBoxAlign = (typeof ALIGNMENTS)[number];
export type DtFlexBoxAlignContent = (typeof ALIGN_CONTENTS)[number];

type CssValue = string | number;

const styles = `
  :host { display: block; }
  :host([hidden]) { display: none; }
  .root {
    display: flex;
    box-sizing: border-box;
  }
  slot { display: contents; }
`;

function numberLike(value: string): boolean {
  return /^-?\d+(\.\d+)?$/.test(value);
}

function cssValueAttribute(
  element: Element,
  name: string,
): CssValue | undefined {
  const value = element.getAttribute(name)?.trim();
  if (!value) return undefined;
  return numberLike(value) ? Number(value) : value;
}

function toCssValue(value: CssValue | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

function reflectCssValue(
  element: Element,
  name: string,
  value: CssValue | null | undefined,
): void {
  reflectAttribute(element, name, value == null ? null : String(value));
}

export class DtFlexBoxElement extends DigitaltableteurElement {
  static observedAttributes = [
    "direction",
    "wrap",
    "justify",
    "align",
    "align-content",
    "gap",
    "row-gap",
    "column-gap",
    ...FORWARDED_ATTRIBUTES,
  ];

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  get direction(): DtFlexBoxDirection {
    return enumAttribute(this, "direction", DIRECTIONS, "row");
  }

  set direction(value: DtFlexBoxDirection) {
    reflectAttribute(this, "direction", value);
  }

  get wrap(): DtFlexBoxWrap {
    return enumAttribute(this, "wrap", WRAPS, "nowrap");
  }

  set wrap(value: DtFlexBoxWrap) {
    reflectAttribute(this, "wrap", value);
  }

  get justify(): DtFlexBoxJustify {
    return enumAttribute(this, "justify", JUSTIFICATIONS, "flex-start");
  }

  set justify(value: DtFlexBoxJustify) {
    reflectAttribute(this, "justify", value);
  }

  get align(): DtFlexBoxAlign {
    return enumAttribute(this, "align", ALIGNMENTS, "stretch");
  }

  set align(value: DtFlexBoxAlign) {
    reflectAttribute(this, "align", value);
  }

  get alignContent(): DtFlexBoxAlignContent | undefined {
    const value = this.getAttribute("align-content");
    return ALIGN_CONTENTS.includes(value as DtFlexBoxAlignContent)
      ? (value as DtFlexBoxAlignContent)
      : undefined;
  }

  set alignContent(value: DtFlexBoxAlignContent | undefined) {
    reflectAttribute(this, "align-content", value ?? null);
  }

  get gap(): CssValue | undefined {
    return cssValueAttribute(this, "gap");
  }

  set gap(value: CssValue | undefined) {
    reflectCssValue(this, "gap", value);
  }

  get rowGap(): CssValue | undefined {
    return cssValueAttribute(this, "row-gap");
  }

  set rowGap(value: CssValue | undefined) {
    reflectCssValue(this, "row-gap", value);
  }

  get columnGap(): CssValue | undefined {
    return cssValueAttribute(this, "column-gap");
  }

  set columnGap(value: CssValue | undefined) {
    reflectCssValue(this, "column-gap", value);
  }

  get ariaLabel(): string {
    return stringAttribute(this, "aria-label");
  }

  set ariaLabel(value: string) {
    reflectAttribute(this, "aria-label", value || null);
  }

  private render(): void {
    const root = this.ownerDocument.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root flex-box");
    root.style.flexDirection = this.direction;
    root.style.flexWrap = this.wrap;
    root.style.justifyContent = this.justify;
    root.style.alignItems = this.align;

    const alignContent = this.alignContent;
    if (alignContent) root.style.alignContent = alignContent;

    const gap = toCssValue(this.gap);
    const rowGap = toCssValue(this.rowGap);
    const columnGap = toCssValue(this.columnGap);
    if (gap !== undefined) root.style.gap = gap;
    if (rowGap !== undefined) root.style.rowGap = rowGap;
    if (columnGap !== undefined) root.style.columnGap = columnGap;

    for (const attribute of FORWARDED_ATTRIBUTES) {
      const value = this.getAttribute(attribute);
      if (value !== null) root.setAttribute(attribute, value);
    }

    root.append(this.ownerDocument.createElement("slot"));
    this.replaceShadow(styles, root);
  }
}
