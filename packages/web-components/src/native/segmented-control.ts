import {
  DigitaltableteurElement,
  enumAttribute,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";

const SIZES = ["sm", "md", "lg"] as const;
const ORIENTATIONS = ["horizontal", "vertical"] as const;

export type DtSegmentedControlSize = (typeof SIZES)[number];
export type DtSegmentedControlOrientation = (typeof ORIENTATIONS)[number];

export interface DtSegmentedControlItem {
  value: string;
  label: string;
  disabled?: boolean;
}

const styles = `
  :host { display: inline-block; font-family: var(--font-body, var(--primary-body-font, sans-serif)); }
  :host([hidden]) { display: none; }
  .root {
    display: inline-flex;
    padding: var(--space-internal-2, 0.125rem);
    gap: var(--space-internal-2, 0.125rem);
    border-radius: var(--radius-md, 0.625rem);
    background-color: color-mix(in srgb, var(--color-muted, currentcolor) 14%, transparent);
  }
  .root.vertical {
    flex-direction: column;
    inline-size: min(100%, 18rem);
  }
  .segment {
    padding-block: var(--space-internal-2, 0.125rem);
    border: 0;
    border-radius: var(--radius-sm, 0.375rem);
    background-color: transparent;
    font-family: inherit;
    font-weight: 500;
    white-space: nowrap;
    color: var(--color-muted, currentcolor);
    cursor: pointer;
    transition:
      color 0.15s var(--ease-out-cubic, ease),
      background-color 0.15s var(--ease-out-cubic, ease),
      box-shadow 0.15s var(--ease-out-cubic, ease);
    appearance: none;
  }
  .vertical .segment { inline-size: 100%; text-align: start; }
  .segment[data-selected] {
    background-color: var(--color-surface, white);
    box-shadow: 0 1px 2px color-mix(in srgb, var(--color-text, currentcolor) 16%, transparent);
    color: var(--color-text, currentcolor);
  }
  .segment:disabled {
    color: var(--color-muted-light, GrayText);
    cursor: not-allowed;
  }
  .segment:focus-visible {
    outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--color-primary, currentcolor));
    outline-offset: var(--focus-ring-offset, 2px);
  }
  .sm .segment {
    padding-inline: var(--space-internal-12, 0.75rem);
    min-block-size: 1.75rem;
    font-size: var(--font-size-text-xs, 0.75rem);
  }
  .md .segment {
    padding-inline: var(--space-internal-16, 1rem);
    min-block-size: 2.25rem;
    font-size: var(--font-size-text-s, 0.875rem);
  }
  .lg .segment {
    padding-inline: var(--space-internal-24, 1.5rem);
    min-block-size: 2.75rem;
    font-size: var(--font-size-text-m, 1rem);
  }
  .segment:hover:not([data-selected], :disabled) {
    color: var(--color-text, currentcolor);
  }
  @media (prefers-reduced-motion: reduce) {
    .segment { transition: none; }
  }
  @media (forced-colors: active) {
    .root { border: 1px solid CanvasText; }
    .segment[data-selected] {
      outline: 2px solid Highlight;
      outline-offset: -2px;
    }
  }
`;

function segmentSlotName(value: string): string {
  return `segment-${value}`;
}

export class DtSegmentedControlElement extends DigitaltableteurElement {
  static observedAttributes = [
    "items",
    "value",
    "default-value",
    "size",
    "aria-label",
    "disabled",
    "orientation",
  ];

  private assignedItems: DtSegmentedControlItem[] | null = null;
  private liveValue: string | null = null;
  private valueDirty = false;
  private focusValue: string | null = null;
  private readonly buttons = new Map<string, HTMLButtonElement>();

  connectedCallback(): void {
    if (this.liveValue === null) {
      this.liveValue = this.resolveInitialValue();
    }
    this.observeLightDom(() => this.render());
    this.render();
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    value: string | null,
  ): void {
    if (name === "items") this.assignedItems = null;
    if (name === "value") {
      this.liveValue = value === null ? this.resolveFallbackValue() : value;
      this.valueDirty = false;
      if (value !== null) this.focusValue = value;
    } else if (
      name === "default-value" &&
      !this.valueDirty &&
      !this.hasAttribute("value")
    ) {
      this.liveValue = this.resolveFallbackValue();
    }
    if (this.isConnected) this.render();
  }

  get items(): DtSegmentedControlItem[] {
    return this.assignedItems ?? this.parseItemsAttribute();
  }
  set items(value: DtSegmentedControlItem[]) {
    this.assignedItems = value.map((item) => ({ ...item }));
    if (this.isConnected) this.render();
  }

  get value(): string {
    return this.liveValue ?? "";
  }
  set value(value: string) {
    // Empty string means "no controlled selection" (parity with React); reflect it
    // as an absent attribute rather than a controlled-empty state.
    reflectAttribute(this, "value", value || null);
  }

  get defaultValue(): string {
    return stringAttribute(this, "default-value");
  }
  set defaultValue(value: string) {
    reflectAttribute(this, "default-value", value || null);
  }

  get size(): DtSegmentedControlSize {
    return enumAttribute(this, "size", SIZES, "md");
  }
  set size(value: DtSegmentedControlSize) {
    reflectAttribute(this, "size", value);
  }

  get ariaLabel(): string {
    return stringAttribute(this, "aria-label");
  }
  set ariaLabel(value: string) {
    reflectAttribute(this, "aria-label", value || null);
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }
  set disabled(value: boolean) {
    reflectBooleanAttribute(this, "disabled", value);
  }

  get orientation(): DtSegmentedControlOrientation {
    return enumAttribute(this, "orientation", ORIENTATIONS, "horizontal");
  }
  set orientation(value: DtSegmentedControlOrientation) {
    reflectAttribute(this, "orientation", value);
  }

  private get isControlled(): boolean {
    return (this.getAttribute("value") ?? "") !== "";
  }

  private parseItemsAttribute(): DtSegmentedControlItem[] {
    const source = this.getAttribute("items");
    if (!source) return [];
    try {
      const parsed: unknown = JSON.parse(source);
      if (!Array.isArray(parsed)) return [];
      return parsed.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const segment = item as Record<string, unknown>;
        if (
          typeof segment.value !== "string" ||
          typeof segment.label !== "string"
        ) {
          return [];
        }
        return [
          {
            value: segment.value,
            label: segment.label,
            disabled: segment.disabled === true,
          },
        ];
      });
    } catch {
      return [];
    }
  }

  private firstEnabledValue(): string | null {
    return this.items.find((item) => !item.disabled)?.value ?? null;
  }

  private isKnownValue(value: string | null): value is string {
    return Boolean(value && this.items.some((item) => item.value === value));
  }

  private isEnabledValue(value: string | null): value is string {
    return Boolean(
      value && this.items.some((item) => item.value === value && !item.disabled),
    );
  }

  private resolveInitialValue(): string {
    if (this.hasAttribute("value")) return stringAttribute(this, "value");
    return this.resolveFallbackValue();
  }

  private resolveFallbackValue(): string {
    if (this.hasAttribute("default-value")) {
      return stringAttribute(this, "default-value");
    }
    return this.firstEnabledValue() ?? this.items[0]?.value ?? "";
  }

  private selectedValue(): string {
    return this.liveValue ?? "";
  }

  private resolvedFocusValue(): string {
    if (this.isEnabledValue(this.focusValue)) return this.focusValue;
    if (this.isEnabledValue(this.selectedValue())) return this.selectedValue();
    return this.firstEnabledValue() ?? this.items[0]?.value ?? "";
  }

  private activate(value: string): void {
    const previousValue = this.selectedValue();
    this.focusValue = value;
    if (!this.isControlled) {
      this.liveValue = value;
      this.valueDirty = true;
    }
    this.syncDomState();
    this.buttons.get(value)?.focus();
    this.dispatchEvent(
      new CustomEvent("value-change", {
        detail: { value, previousValue },
        bubbles: true,
        composed: true,
      }),
    );
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  }

  private handleKeyDown(event: KeyboardEvent, value: string): void {
    const enabled = this.items.filter((item) => !item.disabled).map((item) => item.value);
    const currentValue = this.isEnabledValue(this.focusValue) ? this.focusValue : value;
    const currentIndex = enabled.indexOf(currentValue);
    if (currentIndex === -1) return;

    let nextValue: string | null = null;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextValue = enabled[(currentIndex + 1) % enabled.length] ?? null;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextValue = enabled[(currentIndex - 1 + enabled.length) % enabled.length] ?? null;
        break;
      case "Home":
        nextValue = enabled[0] ?? null;
        break;
      case "End":
        nextValue = enabled[enabled.length - 1] ?? null;
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        this.activate(value);
        return;
      default:
        return;
    }

    if (!nextValue) return;
    event.preventDefault();
    this.activate(nextValue);
  }

  private render(): void {
    const hadFocusedButton =
      this.shadowRoot?.activeElement instanceof HTMLElement &&
      this.shadowRoot.activeElement.matches("[data-segment-value]");

    const previousFocusValue =
      this.shadowRoot?.activeElement instanceof HTMLElement
        ? this.shadowRoot.activeElement.dataset.segmentValue
        : null;

    if (!this.isControlled && !this.isKnownValue(this.liveValue)) {
      this.liveValue = this.resolveFallbackValue();
    }
    if (!this.isEnabledValue(this.focusValue)) {
      this.focusValue = this.isEnabledValue(this.selectedValue())
        ? this.selectedValue()
        : this.firstEnabledValue();
    }

    const selectedValue = this.selectedValue();
    const focusValue = this.resolvedFocusValue();
    const root = this.ownerDocument.createElement("div");
    root.className = ["root", this.size, this.orientation].join(" ");
    root.setAttribute("part", "group");
    root.setAttribute("role", "radiogroup");
    root.setAttribute("aria-label", this.ariaLabel);
    root.setAttribute("aria-orientation", this.orientation);

    this.buttons.clear();

    for (const item of this.items) {
      const selected = item.value === selectedValue;
      const button = this.ownerDocument.createElement("button");
      button.type = "button";
      button.dataset.segmentValue = item.value;
      button.className = "segment";
      button.setAttribute("part", "segment");
      button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", String(selected));
      if (selected) button.dataset.selected = "true";
      button.tabIndex =
        !item.disabled && item.value === focusValue ? 0 : -1;
      button.disabled = this.disabled || item.disabled === true;
      button.addEventListener("click", () => {
        if (!button.disabled) this.activate(item.value);
      });
      button.addEventListener("keydown", (event) =>
        this.handleKeyDown(event, item.value),
      );
      button.addEventListener("focus", () => {
        if (this.focusValue !== item.value) {
          this.focusValue = item.value;
          this.syncDomState();
        }
      });

      const slot = this.ownerDocument.createElement("slot");
      slot.name = segmentSlotName(item.value);
      slot.textContent = item.label;
      button.append(slot);
      this.buttons.set(item.value, button);
      root.append(button);
    }

    this.replaceShadow(styles, root);
    this.syncDomState();

    if (hadFocusedButton) {
      const targetValue =
        previousFocusValue && this.buttons.has(previousFocusValue)
          ? previousFocusValue
          : focusValue;
      this.buttons.get(targetValue)?.focus();
    }
  }

  private syncDomState(): void {
    const selectedValue = this.selectedValue();
    const focusValue = this.resolvedFocusValue();
    for (const item of this.items) {
      const button = this.buttons.get(item.value);
      if (!button) continue;
      const selected = item.value === selectedValue;
      button.setAttribute("aria-checked", String(selected));
      button.tabIndex = !item.disabled && item.value === focusValue ? 0 : -1;
      button.disabled = this.disabled || item.disabled === true;
      if (selected) button.dataset.selected = "true";
      else delete button.dataset.selected;
    }
  }
}
