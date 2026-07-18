import {
  DigitaltableteurElement,
  enumAttribute,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";

const TYPES = ["single", "multiple"] as const;
const ORIENTATIONS = ["vertical", "horizontal"] as const;
export type DtSelectableCardSelectionType = (typeof TYPES)[number];
export type DtSelectableCardOrientation = (typeof ORIENTATIONS)[number];

const cardStyles = `
  :host { display: flex; position: relative; flex-direction: column; }
  /* The whole card is the control (no radio/checkbox glyph); the label is a
     flex column so the surface fills it when a grid/flex parent stretches
     options to equal heights, mirroring the React SelectableCard. */
  label { display: flex; position: relative; flex: 1 1 auto; flex-direction: column; cursor: pointer; }
  label.disabled { cursor: not-allowed; opacity: .55; }
  input { position: absolute; margin: -1px; inline-size: 1px; block-size: 1px; border: 0; clip-path: inset(50%); overflow: hidden; }
  .surface { display: flex; position: relative; box-sizing: border-box; flex: 1 1 auto; flex-direction: column; justify-content: center; min-block-size: 4rem; padding: var(--space-internal-16); border: 1px solid var(--color-border-light); border-radius: var(--radius-lg, 8px); background: var(--color-surface); color: var(--color-text); }
  /* Hover only affects unselected cards; a selected card keeps its look. */
  label:hover:not(.disabled):not(.selected) .surface { border-color: var(--color-border); }
  label.selected .surface { border-color: var(--color-primary); box-shadow: inset 0 0 0 1px var(--color-primary); }
  input:focus-visible + .surface { outline: 2px solid var(--color-focus-ring, var(--color-primary)); outline-offset: 2px; }
  @media (forced-colors: active) {
    /* The UA strips author box-shadows; border-width survives forced colors
       and keeps a non-color selected cue. */
    label.selected .surface { border-width: 3px; border-color: Highlight; }
    label.disabled .surface { color: GrayText; opacity: 1; }
  }
`;

export class DtSelectableCardElement extends DigitaltableteurElement {
  static observedAttributes = [
    "value",
    "selected",
    "disabled",
    "selection-type",
    "name",
  ];
  connectedCallback(): void {
    this.render();
    this.observeLightDom(() => this.render());
  }
  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }
  get value(): string {
    return stringAttribute(this, "value");
  }
  set value(value: string) {
    reflectAttribute(this, "value", value || null);
  }
  get selected(): boolean {
    return this.hasAttribute("selected");
  }
  set selected(value: boolean) {
    reflectBooleanAttribute(this, "selected", value);
  }
  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }
  set disabled(value: boolean) {
    reflectBooleanAttribute(this, "disabled", value);
  }
  get selectionType(): DtSelectableCardSelectionType {
    return enumAttribute(this, "selection-type", TYPES, "multiple");
  }
  set selectionType(value: DtSelectableCardSelectionType) {
    reflectAttribute(this, "selection-type", value);
  }
  get name(): string {
    return stringAttribute(this, "name");
  }
  set name(value: string) {
    reflectAttribute(this, "name", value || null);
  }

  private render(): void {
    const label = this.ownerDocument.createElement("label");
    label.className = [
      this.selected ? "selected" : "",
      this.disabled ? "disabled" : "",
    ]
      .filter(Boolean)
      .join(" ");
    label.setAttribute("part", "root");
    const input = this.ownerDocument.createElement("input");
    input.type = this.selectionType === "single" ? "radio" : "checkbox";
    input.name = this.name;
    input.value = this.value;
    input.checked = this.selected;
    input.disabled = this.disabled;
    input.addEventListener("change", () => {
      this.dispatchEvent(
        new CustomEvent("selection-request", {
          bubbles: true,
          composed: true,
          detail: { value: this.value, selected: input.checked },
        }),
      );
    });
    const surface = this.ownerDocument.createElement("div");
    surface.className = "surface";
    surface.setAttribute("part", "surface");
    surface.append(this.ownerDocument.createElement("slot"));
    label.append(input, surface);
    this.replaceShadow(cardStyles, label);
  }
}

const groupStyles = `
  :host { display: block; }
  fieldset { margin: 0; padding: 0; min-inline-size: 0; border: 0; }
  legend { margin-block-end: var(--space-internal-8); padding: 0; font-weight: 600; color: var(--color-title, var(--color-primary)); }
  .options { display: flex; gap: var(--space-internal-12); }
  .vertical { flex-direction: column; }
  .horizontal { flex-flow: row wrap; }
  .message { margin-block-start: var(--space-internal-8); color: var(--secondary-text-color); }
  .error { color: var(--color-error); }
`;

function parseValue(value: string | null): string | string[] {
  if (!value) return "";
  try {
    const parsed = JSON.parse(value) as unknown;
    if (
      Array.isArray(parsed) &&
      parsed.every((item) => typeof item === "string")
    )
      return parsed;
  } catch {
    /* scalar values are valid */
  }
  return value;
}

export class DtSelectableCardGroupElement extends DigitaltableteurElement {
  static observedAttributes = [
    "type",
    "legend",
    "name",
    "value",
    "default-value",
    "orientation",
    "disabled",
    "error",
    "helper-text",
  ];
  private internalValue: string | string[] | undefined;
  private readonly ownDisabled = new WeakMap<
    DtSelectableCardElement,
    boolean
  >();
  private readonly onSelection = (event: Event) => {
    const customEvent = event as CustomEvent<{
      value: string;
      selected: boolean;
    }>;
    if (customEvent.type !== "selection-request" || !customEvent.detail) return;
    event.stopPropagation();
    const { value, selected } = customEvent.detail;
    const current = this.values();
    const next =
      this.type === "single"
        ? value
        : selected
          ? [...new Set([...current, value])]
          : current.filter((item) => item !== value);
    if (!this.hasAttribute("value")) this.internalValue = next;
    this.syncCards();
    this.dispatchEvent(
      new CustomEvent("value-change", {
        bubbles: true,
        composed: true,
        detail: { value: next },
      }),
    );
  };

  connectedCallback(): void {
    this.internalValue = parseValue(this.getAttribute("default-value"));
    this.addEventListener("selection-request", this.onSelection);
    this.render();
    this.observeLightDom(() => this.syncCards());
  }
  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("selection-request", this.onSelection);
  }
  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    newValue: string | null,
  ): void {
    if (name === "default-value" && !this.hasAttribute("value")) {
      this.internalValue = parseValue(newValue);
    }
    if (this.isConnected) {
      this.render();
      this.syncCards();
    }
  }
  get type(): DtSelectableCardSelectionType {
    return enumAttribute(this, "type", TYPES, "single");
  }
  set type(value: DtSelectableCardSelectionType) {
    reflectAttribute(this, "type", value);
  }
  get legend(): string {
    return stringAttribute(this, "legend");
  }
  set legend(value: string) {
    reflectAttribute(this, "legend", value || null);
  }
  get name(): string {
    return stringAttribute(this, "name", "selectable-card-group");
  }
  set name(value: string) {
    reflectAttribute(this, "name", value || null);
  }
  get value(): string | string[] {
    return this.hasAttribute("value")
      ? parseValue(this.getAttribute("value"))
      : (this.internalValue ?? "");
  }
  set value(value: string | string[]) {
    reflectAttribute(
      this,
      "value",
      Array.isArray(value) ? JSON.stringify(value) : value || null,
    );
  }
  get orientation(): DtSelectableCardOrientation {
    return enumAttribute(this, "orientation", ORIENTATIONS, "vertical");
  }
  set orientation(value: DtSelectableCardOrientation) {
    reflectAttribute(this, "orientation", value);
  }
  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }
  set disabled(value: boolean) {
    reflectBooleanAttribute(this, "disabled", value);
  }
  private values(): string[] {
    const value = this.value;
    return Array.isArray(value) ? value : value ? [value] : [];
  }
  private cards(): DtSelectableCardElement[] {
    return [
      ...this.querySelectorAll("dt-selectable-card"),
    ] as DtSelectableCardElement[];
  }
  private syncCards(): void {
    const selected = this.values();
    for (const card of this.cards()) {
      if (!this.ownDisabled.has(card))
        this.ownDisabled.set(card, card.disabled);
      card.selectionType = this.type;
      card.name = this.name;
      card.selected = selected.includes(card.value);
      card.disabled = this.disabled || Boolean(this.ownDisabled.get(card));
    }
  }
  private render(): void {
    const fieldset = this.ownerDocument.createElement("fieldset");
    fieldset.disabled = this.disabled;
    if (this.getAttribute("error"))
      fieldset.setAttribute("aria-invalid", "true");
    const legend = this.ownerDocument.createElement("legend");
    legend.textContent = this.legend;
    const options = this.ownerDocument.createElement("div");
    options.className = `options ${this.orientation}`;
    options.setAttribute("part", "options");
    options.append(this.ownerDocument.createElement("slot"));
    fieldset.append(legend, options);
    const message =
      this.getAttribute("error") || this.getAttribute("helper-text");
    if (message) {
      const node = this.ownerDocument.createElement("div");
      node.className = `message ${this.getAttribute("error") ? "error" : ""}`;
      if (this.getAttribute("error")) node.setAttribute("role", "alert");
      node.textContent = message;
      fieldset.append(node);
    }
    this.replaceShadow(groupStyles, fieldset);
    queueMicrotask(() => this.syncCards());
  }
}
