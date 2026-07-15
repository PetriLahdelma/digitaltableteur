import {
  DigitaltableteurElement,
  enumAttribute,
  reflectAttribute,
  stringAttribute,
} from "./base";

const TAGS = ["ul", "ol"] as const;
const SIZES = ["xxs", "xs", "s", "m", "l", "xl", "xxl"] as const;
const LINE_HEIGHTS = ["tight", "snug", "normal", "relaxed", "loose"] as const;
const SPACING = ["compact", "normal", "relaxed"] as const;
const MARKERS = [
  "disc",
  "circle",
  "square",
  "decimal",
  "decimal-leading-zero",
  "lower-alpha",
  "upper-alpha",
  "lower-roman",
  "upper-roman",
  "none",
  "dash",
] as const;

export type DtListTag = (typeof TAGS)[number];
export type DtListSize = (typeof SIZES)[number];
export type DtListLineHeight = (typeof LINE_HEIGHTS)[number];
export type DtListSpacing = (typeof SPACING)[number];
export type DtListStyleType = (typeof MARKERS)[number];

const styles = `
  :host { display: block; }
  :host([hidden]) { display: none; }
  .list { margin: 0; padding-inline-start: var(--space-internal-16, 1rem); font-family: var(--font-body, var(--font-text)), system-ui, sans-serif; line-height: var(--line-height-relaxed); list-style-type: " "; }
  .marker-none { list-style-type: " "; }
  .marker-dash { list-style-type: "—  "; padding-inline-start: 1.5em; }
  .text-xxs { font-size: var(--font-size-text-xxs); }
  .text-xs { font-size: var(--font-size-text-xs); }
  .text-s { font-size: var(--font-size-text-s); }
  .text-m { font-size: var(--font-size-text-m); }
  .text-l { font-size: var(--font-size-text-l); }
  .text-xl { font-size: var(--font-size-text-xl); }
  .text-xxl { font-size: var(--font-size-text-xxl); }
  .line-tight { line-height: var(--line-height-tight); }
  .line-snug { line-height: var(--line-height-snug); }
  .line-normal { line-height: var(--line-height-normal); }
  .line-relaxed { line-height: var(--line-height-relaxed); }
  .line-loose { line-height: var(--line-height-loose); }
  .list > li, ::slotted(li) { margin-block-end: var(--dt-list-item-gap); white-space: normal; overflow-wrap: break-word; }
  .list > li:last-child, ::slotted(li:last-child) { margin-block-end: 0; }
  .spacing-compact { --dt-list-item-gap: var(--space-internal-4, 0.25rem); }
  .spacing-normal { --dt-list-item-gap: var(--space-internal-8, 0.5rem); }
  .spacing-relaxed { --dt-list-item-gap: var(--space-internal-12, 0.75rem); }
`;

function parseItems(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export class DtListElement extends DigitaltableteurElement {
  static observedAttributes = [
    "items",
    "as",
    "size",
    "line-height",
    "list-style-type",
    "spacing",
    "role",
    "aria-label",
  ];

  connectedCallback(): void {
    this.render();
  }
  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  get items(): string[] {
    return parseItems(this.getAttribute("items"));
  }
  set items(value: readonly string[]) {
    reflectAttribute(this, "items", JSON.stringify([...value]));
  }
  get as(): DtListTag {
    return enumAttribute(this, "as", TAGS, "ul");
  }
  set as(value: DtListTag) {
    reflectAttribute(this, "as", value);
  }
  get size(): DtListSize {
    return enumAttribute(this, "size", SIZES, "m");
  }
  set size(value: DtListSize) {
    reflectAttribute(this, "size", value);
  }
  get lineHeight(): DtListLineHeight | "" {
    const value = stringAttribute(this, "line-height");
    return LINE_HEIGHTS.includes(value as DtListLineHeight)
      ? (value as DtListLineHeight)
      : "";
  }
  set lineHeight(value: DtListLineHeight | "") {
    reflectAttribute(this, "line-height", value || null);
  }
  get listStyleType(): DtListStyleType | "" {
    const value = stringAttribute(this, "list-style-type");
    return MARKERS.includes(value as DtListStyleType)
      ? (value as DtListStyleType)
      : "";
  }
  set listStyleType(value: DtListStyleType | "") {
    reflectAttribute(this, "list-style-type", value || null);
  }
  get spacing(): DtListSpacing {
    return enumAttribute(this, "spacing", SPACING, "normal");
  }
  set spacing(value: DtListSpacing) {
    reflectAttribute(this, "spacing", value);
  }

  private render(): void {
    const list = this.ownerDocument.createElement(this.as);
    list.className = [
      "list",
      `text-${this.size}`,
      this.lineHeight ? `line-${this.lineHeight}` : "",
      `spacing-${this.spacing}`,
      this.listStyleType === "none" || this.listStyleType === "dash"
        ? `marker-${this.listStyleType}`
        : "",
    ]
      .filter(Boolean)
      .join(" ");
    list.setAttribute("part", "list");
    if (
      this.listStyleType &&
      this.listStyleType !== "none" &&
      this.listStyleType !== "dash"
    ) {
      list.style.listStyleType = this.listStyleType;
    }
    for (const attribute of ["role", "aria-label"]) {
      const value = this.getAttribute(attribute);
      if (value !== null) list.setAttribute(attribute, value);
    }
    const items = this.items;
    if (items.length > 0) {
      for (const item of items) {
        const listItem = this.ownerDocument.createElement("li");
        listItem.setAttribute("part", "item");
        listItem.textContent = item;
        list.append(listItem);
      }
    } else {
      list.append(this.ownerDocument.createElement("slot"));
    }
    this.replaceShadow(styles, list);
  }
}
