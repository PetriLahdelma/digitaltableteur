import {
  DigitaltableteurElement,
  enumAttribute,
  reflectAttribute,
  stringAttribute,
} from "./base";

const SIZES = ["sm", "md", "lg"] as const;
const VARIANTS = ["pills", "underline", "minimal"] as const;

export type DtCategoryFilterSize = (typeof SIZES)[number];
export type DtCategoryFilterVariant = (typeof VARIANTS)[number];
export type DtCategoryOption = { value: string; label: string };

const styles = `
  :host { display: block; }
  .group { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-internal-8); overflow-x: auto; padding-block: var(--space-internal-4); }
  .underline { gap: var(--space-internal-24); border-block-end: 1px solid var(--color-border); }
  .minimal { gap: var(--space-internal-16); }
  button { display: inline-flex; flex: none; align-items: center; border: 0; background: transparent; font-family: var(--font-body); white-space: nowrap; color: var(--color-muted); cursor: pointer; }
  button:hover { color: var(--color-text); }
  button:focus-visible { outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--color-primary)); outline-offset: 2px; }
  .sm { padding-block: var(--space-internal-6); padding-inline: var(--space-internal-12); font-size: var(--font-size-text-xs, .75rem); }
  .md { padding-block: var(--space-internal-8); padding-inline: var(--space-internal-16); font-size: var(--font-size-text-s, .875rem); }
  .lg { padding-block: var(--space-internal-8); padding-inline: var(--space-internal-24); font-size: var(--font-size-text-m, 1rem); }
  .pills button { border: 1px solid var(--color-border); border-radius: var(--radius-full, 9999px); }
  .pills button[aria-pressed="true"] { border-color: var(--color-text); background: var(--color-text); color: var(--main-body-background-color, white); }
  .underline button { margin-block-end: -1px; padding-inline: 0; border-block-end: 2px solid transparent; }
  .underline button[aria-pressed="true"] { border-block-end-color: var(--color-text); color: var(--color-text); }
  .minimal button { padding-inline: 0; }
  .minimal button[aria-pressed="true"] { font-weight: 600; color: var(--color-text); }
  @media (forced-colors: active) { button { color: ButtonText; } button[aria-pressed="true"] { background: Highlight; color: HighlightText; } }
`;

function parseCategories(value: string | null): DtCategoryOption[] {
  try {
    const parsed = JSON.parse(value ?? "[]") as unknown;
    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is DtCategoryOption =>
            Boolean(item) &&
            typeof item === "object" &&
            typeof (item as DtCategoryOption).value === "string" &&
            typeof (item as DtCategoryOption).label === "string",
        )
      : [];
  } catch {
    return [];
  }
}

export class DtCategoryFilterElement extends DigitaltableteurElement {
  static observedAttributes = [
    "categories",
    "active-category",
    "size",
    "variant",
    "aria-label",
  ];

  connectedCallback(): void {
    this.render();
  }
  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  get categories(): DtCategoryOption[] {
    return parseCategories(this.getAttribute("categories"));
  }
  set categories(value: DtCategoryOption[]) {
    reflectAttribute(
      this,
      "categories",
      JSON.stringify(Array.isArray(value) ? value : []),
    );
  }
  get activeCategory(): string {
    return stringAttribute(this, "active-category");
  }
  set activeCategory(value: string) {
    reflectAttribute(this, "active-category", value || null);
  }
  get size(): DtCategoryFilterSize {
    return enumAttribute(this, "size", SIZES, "md");
  }
  set size(value: DtCategoryFilterSize) {
    reflectAttribute(this, "size", value);
  }
  get variant(): DtCategoryFilterVariant {
    return enumAttribute(this, "variant", VARIANTS, "pills");
  }
  set variant(value: DtCategoryFilterVariant) {
    reflectAttribute(this, "variant", value);
  }

  private render(): void {
    const group = this.ownerDocument.createElement("div");
    group.className = `group ${this.variant}`;
    group.setAttribute("part", "group");
    group.setAttribute("role", "group");
    group.setAttribute(
      "aria-label",
      this.getAttribute("aria-label") || "Filter by category",
    );
    for (const category of this.categories) {
      const button = this.ownerDocument.createElement("button");
      button.type = "button";
      button.className = this.size;
      button.setAttribute("part", "option");
      button.setAttribute(
        "aria-pressed",
        String(category.value === this.activeCategory),
      );
      button.textContent = category.label;
      button.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("category-change", {
            bubbles: true,
            composed: true,
            detail: { category: category.value },
          }),
        );
      });
      group.append(button);
    }
    this.replaceShadow(styles, group);
  }
}
