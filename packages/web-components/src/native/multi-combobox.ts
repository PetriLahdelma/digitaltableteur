import {
  DigitaltableteurElement,
  attachFormInternals,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";
import { localizedText } from "./localization";

export interface DtMultiComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export type DtMultiComboboxValue = string[];

const styles = `
  :host {
    display: block;
    inline-size: 100%;
    font-family: var(--font-body, var(--primary-body-font, sans-serif));
  }
  :host([hidden]) { display: none; }
  .field { display: flex; flex-direction: column; gap: var(--space-internal-8, 0.5rem); }
  .label { display: block; color: var(--color-text, CanvasText); font-size: 0.8125rem; font-weight: 600; }
  .required { margin-inline-start: var(--space-internal-4, 0.25rem); color: var(--color-error, #b00020); }
  .srOnly { position: absolute; inline-size: 1px; block-size: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
  .wrapper { position: relative; }
  .control {
    display: grid;
    position: relative;
    min-block-size: 3rem;
    grid-template-columns: minmax(0, 1fr) 2.5rem;
    align-items: stretch;
    border: 1px solid var(--color-border, #767676);
    border-radius: var(--radius-lg, 0.5rem);
    outline: var(--focus-ring-width, 2px) solid transparent;
    background: color-mix(in srgb, var(--main-body-background-color, Canvas) 96%, var(--color-primary, CanvasText));
    color: var(--color-text, CanvasText);
    cursor: text;
  }
  .control[data-state="open"], .control:focus-within { border-color: var(--color-primary, CanvasText); }
  .control:focus-within { outline-color: var(--focus-ring-color, var(--color-primary, CanvasText)); }
  .control.error { border-color: var(--color-error, #b00020); }
  .control.disabled { border-color: var(--color-primary-disabled, GrayText); background: var(--color-disabled-bg-light, #eee); color: var(--color-disabled-placeholder, GrayText); cursor: not-allowed; }
  .inner { display: flex; padding-block: var(--space-internal-8, 0.5rem); padding-inline: var(--space-internal-16, 1rem) 0; min-inline-size: 0; flex-wrap: wrap; align-items: center; gap: var(--space-internal-6, 0.375rem); }
  .chip { display: inline-flex; max-inline-size: 100%; align-items: center; border: 1px solid var(--color-border, #767676); border-radius: var(--radius-md, 0.375rem); background: var(--color-neutral-bg, #eee); color: var(--color-text, CanvasText); overflow: hidden; }
  .chipLabel { padding-block: var(--space-internal-4, 0.25rem); padding-inline-start: var(--space-internal-8, 0.5rem); max-inline-size: 14rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: var(--font-size-text-s, 0.875rem); }
  .chipRemove { display: inline-grid; min-inline-size: 1.75rem; min-block-size: 1.75rem; padding: 0; place-items: center; border: 0; background: transparent; color: inherit; font: inherit; cursor: pointer; }
  .chipRemove:focus-visible { outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, currentcolor); outline-offset: -2px; }
  .input { padding-block: var(--space-internal-4, 0.25rem); padding-inline: 0 var(--space-internal-8, 0.5rem); min-inline-size: min(10rem, 100%); max-inline-size: 100%; flex: 1 1 10rem; border: 0; outline: 0; background: transparent; color: inherit; font: inherit; line-height: 1.4; }
  .input::placeholder { color: var(--color-muted, GrayText); opacity: 1; }
  .input:disabled { color: var(--color-disabled-placeholder, GrayText); cursor: not-allowed; }
  .toggle { display: inline-grid; padding: 0; place-items: center; border: 0; background: transparent; color: var(--color-muted, currentcolor); cursor: pointer; }
  .toggle:focus-visible { outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, currentcolor); outline-offset: -3px; }
  .chevron { inline-size: 0.6rem; block-size: 0.6rem; border-inline-end: 2px solid currentcolor; border-block-end: 2px solid currentcolor; rotate: 45deg; translate: 0 -25%; transition: rotate var(--duration-fast, 120ms); }
  .control[data-state="open"] .chevron { rotate: 225deg; translate: 0 25%; }
  .listbox { position: absolute; z-index: 1000; inset-block-start: calc(100% + var(--space-internal-4, 0.25rem)); inset-inline: 0; margin: 0; padding: var(--space-internal-8, 0.5rem); max-block-size: 17.5rem; border: 1px solid var(--color-border, #767676); border-radius: var(--radius-lg, 0.5rem); background: var(--main-body-background-color, Canvas); box-shadow: 0 12px 32px rgb(0 0 0 / 15%); list-style: none; overflow-y: auto; overflow-block: auto; overscroll-behavior: contain; }
  .option { display: flex; inline-size: 100%; min-block-size: 2.75rem; padding: var(--space-internal-12, 0.75rem) var(--space-internal-16, 1rem); justify-content: space-between; align-items: center; gap: var(--space-internal-12, 0.75rem); border: 0; border-radius: var(--radius-md, 0.375rem); background: transparent; color: var(--color-text, CanvasText); font: inherit; text-align: start; cursor: pointer; }
  .option[data-highlighted="true"] { background: color-mix(in srgb, var(--color-primary, CanvasText) 10%, transparent); }
  .option[aria-selected="true"] { background: color-mix(in srgb, var(--color-primary, CanvasText) 14%, transparent); color: var(--color-primary, CanvasText); }
  .option:disabled { color: var(--color-muted, GrayText); cursor: not-allowed; }
  .check { font-weight: 700; }
  .empty { padding: var(--space-internal-12, 0.75rem) var(--space-internal-16, 1rem); color: var(--color-muted, GrayText); }
  .message { margin: 0; font-size: var(--font-size-text-s, 0.875rem); color: var(--color-text, CanvasText); }
  .errorMessage { color: var(--color-error-text, var(--color-error, #b00020)); }
  @media (prefers-reduced-motion: reduce) { .chevron { transition: none; } }
  @media (forced-colors: active) {
    .control, .listbox, .chip { border-color: CanvasText; background: Canvas; color: CanvasText; }
    .control.error { border-color: Mark; }
    .option[data-highlighted="true"], .option[aria-selected="true"] { background: Highlight; color: HighlightText; }
    .option:disabled { color: GrayText; }
  }
`;

let multiComboboxSequence = 0;

function cloneOptions(
  options: DtMultiComboboxOption[],
): DtMultiComboboxOption[] {
  return options.map((option) => ({ ...option }));
}

function uniqueStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value.filter((item): item is string => typeof item === "string"),
    ),
  ];
}

function parseStringArray(source: string | null): string[] {
  if (!source) return [];
  try {
    return uniqueStrings(JSON.parse(source));
  } catch {
    return [];
  }
}

export class DtMultiComboboxElement extends DigitaltableteurElement {
  static formAssociated = true;
  static observedAttributes = [
    "label",
    "options",
    "value",
    "default-value",
    "placeholder",
    "helper-text",
    "error",
    "required",
    "disabled",
    "controlled",
    "name",
    "no-results-text",
    "toggle-label",
    "remove-label-prefix",
    "required-message",
    "lang",
  ];

  private readonly internalId = `dt-multi-combobox-${++multiComboboxSequence}`;
  private readonly internals = attachFormInternals(this);
  private assignedOptions: DtMultiComboboxOption[] | null = null;
  private liveValue: string[] = [];
  private valueDirty = false;
  private initialized = false;
  private formDisabled = false;
  private query = "";
  private openState = false;
  private highlightedIndex = -1;
  private input: HTMLInputElement | null = null;

  connectedCallback(): void {
    if (!this.initialized) {
      this.liveValue = this.hasAttribute("value")
        ? parseStringArray(this.getAttribute("value"))
        : parseStringArray(this.getAttribute("default-value"));
      this.initialized = true;
    }
    this.ownerDocument.addEventListener(
      "pointerdown",
      this.handleDocumentPointerDown,
    );
    this.render();
  }

  disconnectedCallback(): void {
    this.ownerDocument.removeEventListener(
      "pointerdown",
      this.handleDocumentPointerDown,
    );
    super.disconnectedCallback();
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    value: string | null,
  ): void {
    if (name === "options") this.assignedOptions = null;
    if (name === "value") {
      this.liveValue = parseStringArray(value);
      this.valueDirty = false;
    } else if (
      name === "default-value" &&
      !this.valueDirty &&
      !this.hasAttribute("value")
    ) {
      this.liveValue = parseStringArray(value);
    } else if (name === "disabled" && this.disabled) {
      this.openState = false;
      this.query = "";
    }
    if (this.isConnected) this.render();
  }

  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
    // close() early-returns at rest (no open state, no query), so render()
    // unconditionally to propagate the disabled state and null the form value.
    if (disabled) this.close(false);
    this.render();
  }

  formResetCallback(): void {
    this.liveValue = parseStringArray(this.getAttribute("default-value"));
    this.valueDirty = false;
    this.query = "";
    this.openState = false;
    this.render();
  }

  formStateRestoreCallback(state: string | File | FormData | null): void {
    if (state instanceof FormData)
      this.liveValue = uniqueStrings(state.getAll(this.name));
    else if (typeof state === "string")
      this.liveValue = parseStringArray(state);
    this.valueDirty = true;
    this.render();
  }

  get label(): string {
    return stringAttribute(this, "label");
  }
  set label(value: string) {
    reflectAttribute(this, "label", value || null);
  }

  get options(): DtMultiComboboxOption[] {
    return cloneOptions(this.assignedOptions ?? this.parseOptionsAttribute());
  }
  set options(value: DtMultiComboboxOption[]) {
    this.assignedOptions = cloneOptions(value);
    this.highlightedIndex = this.firstEnabledIndex(this.filteredOptions());
    if (this.isConnected) this.render();
  }

  get value(): DtMultiComboboxValue {
    return [...this.liveValue];
  }
  set value(value: DtMultiComboboxValue) {
    const next = uniqueStrings(value);
    this.liveValue = next;
    this.valueDirty = false;
    const serialized = JSON.stringify(next);
    if (this.getAttribute("value") === serialized) {
      if (this.isConnected) this.render();
    } else {
      reflectAttribute(this, "value", serialized);
    }
  }

  get defaultValue(): DtMultiComboboxValue {
    return parseStringArray(this.getAttribute("default-value"));
  }
  set defaultValue(value: DtMultiComboboxValue) {
    reflectAttribute(
      this,
      "default-value",
      JSON.stringify(uniqueStrings(value)),
    );
  }

  get placeholder(): string {
    return stringAttribute(this, "placeholder");
  }
  set placeholder(value: string) {
    reflectAttribute(this, "placeholder", value || null);
  }
  get helperText(): string {
    return stringAttribute(this, "helper-text");
  }
  set helperText(value: string) {
    reflectAttribute(this, "helper-text", value || null);
  }
  get error(): string {
    return stringAttribute(this, "error");
  }
  set error(value: string) {
    reflectAttribute(this, "error", value || null);
  }
  get required(): boolean {
    return this.hasAttribute("required");
  }
  set required(value: boolean) {
    reflectBooleanAttribute(this, "required", value);
  }
  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }
  set disabled(value: boolean) {
    reflectBooleanAttribute(this, "disabled", value);
  }
  get controlled(): boolean {
    return this.hasAttribute("controlled");
  }
  set controlled(value: boolean) {
    reflectBooleanAttribute(this, "controlled", value);
  }
  get name(): string {
    return stringAttribute(this, "name");
  }
  set name(value: string) {
    reflectAttribute(this, "name", value || null);
  }

  focus(options?: FocusOptions): void {
    this.input?.focus(options);
  }

  private parseOptionsAttribute(): DtMultiComboboxOption[] {
    const source = this.getAttribute("options");
    if (!source) return [];
    try {
      const value: unknown = JSON.parse(source);
      if (!Array.isArray(value)) return [];
      return value.flatMap((entry) => {
        if (!entry || typeof entry !== "object") return [];
        const option = entry as Record<string, unknown>;
        if (
          typeof option.value !== "string" ||
          typeof option.label !== "string"
        )
          return [];
        return [
          {
            value: option.value,
            label: option.label,
            disabled: option.disabled === true,
          },
        ];
      });
    } catch {
      return [];
    }
  }

  private filteredOptions(): DtMultiComboboxOption[] {
    const normalized = this.query.trim().toLocaleLowerCase();
    return normalized
      ? this.options.filter((option) =>
          option.label.toLocaleLowerCase().includes(normalized),
        )
      : this.options;
  }

  private firstEnabledIndex(options: DtMultiComboboxOption[]): number {
    return options.findIndex((option) => !option.disabled);
  }

  private lastEnabledIndex(options: DtMultiComboboxOption[]): number {
    for (let index = options.length - 1; index >= 0; index -= 1) {
      if (!options[index]?.disabled) return index;
    }
    return -1;
  }

  private moveHighlight(direction: 1 | -1): void {
    const options = this.filteredOptions();
    if (options.length === 0) return;
    let index = this.highlightedIndex;
    for (let visited = 0; visited < options.length; visited += 1) {
      index = (index + direction + options.length) % options.length;
      if (!options[index]?.disabled) {
        this.highlightedIndex = index;
        this.render(true);
        return;
      }
    }
  }

  private open(): void {
    if (this.disabled || this.formDisabled) return;
    this.openState = true;
    const options = this.filteredOptions();
    if (
      this.highlightedIndex < 0 ||
      !options[this.highlightedIndex] ||
      options[this.highlightedIndex]?.disabled
    ) {
      this.highlightedIndex = this.firstEnabledIndex(options);
    }
    this.render(true);
  }

  private close(restoreFocus: boolean): void {
    if (!this.openState && !this.query) return;
    this.openState = false;
    this.query = "";
    this.highlightedIndex = this.firstEnabledIndex(this.options);
    this.render(restoreFocus);
  }

  private readonly handleDocumentPointerDown = (event: PointerEvent): void => {
    if (this.openState && !event.composedPath().includes(this))
      this.close(false);
  };

  private requestValue(nextValue: string[]): void {
    const next = uniqueStrings(nextValue);
    const detail = { value: [...next] };
    const request = new CustomEvent("before-value-change", {
      detail,
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    if (!this.dispatchEvent(request)) return;
    if (!this.controlled) {
      this.liveValue = next;
      this.valueDirty = true;
      this.syncForm();
      this.render(true);
    }
    this.dispatchEvent(
      new CustomEvent("value-change", {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  }

  private toggleOption(option: DtMultiComboboxOption): void {
    if (option.disabled || this.disabled || this.formDisabled) return;
    const next = this.liveValue.includes(option.value)
      ? this.liveValue.filter((value) => value !== option.value)
      : [...this.liveValue, option.value];
    this.requestValue(next);
  }

  private handleInputKeydown(event: KeyboardEvent): void {
    if (this.disabled || this.formDisabled) return;
    const options = this.filteredOptions();
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!this.openState) this.open();
        else this.moveHighlight(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!this.openState) {
          this.openState = true;
          this.highlightedIndex = this.lastEnabledIndex(options);
          this.render(true);
        } else this.moveHighlight(-1);
        break;
      case "Home":
        if (!this.openState) return;
        event.preventDefault();
        this.highlightedIndex = this.firstEnabledIndex(options);
        this.render(true);
        break;
      case "End":
        if (!this.openState) return;
        event.preventDefault();
        this.highlightedIndex = this.lastEnabledIndex(options);
        this.render(true);
        break;
      case "Enter": {
        event.preventDefault();
        if (!this.openState) this.open();
        else {
          const option = options[this.highlightedIndex];
          if (option) this.toggleOption(option);
        }
        break;
      }
      case "Escape":
        if (this.openState) {
          event.preventDefault();
          this.close(true);
        }
        break;
      case "Backspace":
        if (!this.query && this.liveValue.length > 0) {
          this.requestValue(this.liveValue.slice(0, -1));
        }
        break;
      case "Tab":
        this.close(false);
        break;
      default:
        break;
    }
  }

  private requiredMessage(): string {
    const override = this.getAttribute("required-message");
    if (override !== null) return override;
    return localizedText(this, {
      en: "Select at least one option.",
      fi: "Valitse vähintään yksi vaihtoehto.",
      sv: "Välj minst ett alternativ.",
    });
  }

  private noResultsText(): string {
    const override = this.getAttribute("no-results-text");
    if (override !== null) return override;
    return localizedText(this, {
      en: "No matching options",
      fi: "Ei vastaavia vaihtoehtoja",
      sv: "Inga matchande alternativ",
    });
  }

  private toggleLabel(): string {
    const override = this.getAttribute("toggle-label");
    if (override !== null) return override;
    return localizedText(this, {
      en: "Toggle options",
      fi: "Näytä vaihtoehdot",
      sv: "Visa alternativ",
    });
  }

  private removeLabel(label: string): string {
    const override = this.getAttribute("remove-label-prefix");
    const prefix =
      override ??
      localizedText(this, { en: "Remove ", fi: "Poista ", sv: "Ta bort " });
    return `${prefix}${label}`;
  }

  private syncForm(): void {
    const selected = this.liveValue.filter((value) =>
      this.options.some((option) => option.value === value && !option.disabled),
    );
    if (
      this.disabled ||
      this.formDisabled ||
      !this.name ||
      selected.length === 0
    ) {
      this.internals?.setFormValue(null);
    } else {
      const data = new FormData();
      selected.forEach((value) => data.append(this.name, value));
      this.internals?.setFormValue(data, JSON.stringify(selected));
    }
    const missing = this.required && selected.length === 0;
    this.internals?.setValidity(
      missing
        ? { valueMissing: true }
        : this.error
          ? { customError: true }
          : {},
      this.error || (missing ? this.requiredMessage() : ""),
      this.input ?? undefined,
    );
  }

  private message(
    id: string,
    text: string,
    error = false,
  ): HTMLParagraphElement {
    const message = this.ownerDocument.createElement("p");
    message.id = id;
    message.className = `message${error ? " errorMessage" : ""}`;
    message.textContent = text;
    if (error) message.setAttribute("role", "alert");
    return message;
  }

  private render(restoreInputFocus = false): void {
    const hadInputFocus =
      restoreInputFocus || this.shadowRoot?.activeElement === this.input;
    const field = this.ownerDocument.createElement("div");
    field.className = "field";
    const disabled = this.disabled || this.formDisabled;
    const labelId = `${this.internalId}-label`;
    const listboxId = `${this.internalId}-listbox`;
    const errorId = `${this.internalId}-error`;
    const helperId = `${this.internalId}-helper`;

    const label = this.ownerDocument.createElement("label");
    label.id = labelId;
    label.htmlFor = "control";
    label.className = "label";
    label.append(this.label);
    if (this.required) {
      const marker = this.ownerDocument.createElement("span");
      marker.className = "required";
      marker.setAttribute("aria-hidden", "true");
      marker.textContent = "*";
      const required = this.ownerDocument.createElement("span");
      required.className = "srOnly";
      required.textContent = this.requiredMessage();
      label.append(marker, required);
    }
    field.append(label);

    const wrapper = this.ownerDocument.createElement("div");
    wrapper.className = "wrapper";
    const control = this.ownerDocument.createElement("div");
    control.className = `control${this.error ? " error" : ""}${disabled ? " disabled" : ""}`;
    control.dataset.state = this.openState ? "open" : "closed";
    control.addEventListener("pointerdown", (event) => {
      const target = event.composedPath()[0];
      if (target instanceof Element && target.closest("button")) return;
      event.preventDefault();
      this.open();
    });

    const inner = this.ownerDocument.createElement("div");
    inner.className = "inner";
    const labels = new Map(
      this.options.map((option) => [option.value, option.label]),
    );
    this.liveValue.forEach((value) => {
      const chip = this.ownerDocument.createElement("span");
      chip.className = "chip";
      const chipLabel = this.ownerDocument.createElement("span");
      chipLabel.className = "chipLabel";
      chipLabel.textContent = labels.get(value) ?? value;
      chip.append(chipLabel);
      const remove = this.ownerDocument.createElement("button");
      remove.type = "button";
      remove.className = "chipRemove";
      remove.disabled = disabled;
      remove.setAttribute(
        "aria-label",
        this.removeLabel(chipLabel.textContent),
      );
      remove.textContent = "×";
      remove.addEventListener("click", () =>
        this.requestValue(this.liveValue.filter((entry) => entry !== value)),
      );
      chip.append(remove);
      inner.append(chip);
    });

    const input = this.ownerDocument.createElement("input");
    input.id = "control";
    input.type = "text";
    input.className = "input";
    input.role = "combobox";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.value = this.query;
    input.disabled = disabled;
    input.placeholder = this.liveValue.length === 0 ? this.placeholder : "";
    input.setAttribute("aria-labelledby", labelId);
    input.setAttribute("aria-expanded", String(this.openState));
    input.setAttribute("aria-controls", listboxId);
    input.setAttribute("aria-autocomplete", "list");
    if (this.required) input.setAttribute("aria-required", "true");
    if (this.error) input.setAttribute("aria-invalid", "true");
    const describedBy = [this.error && errorId, this.helperText && helperId]
      .filter(Boolean)
      .join(" ");
    if (describedBy) input.setAttribute("aria-describedby", describedBy);
    const filtered = this.filteredOptions();
    const active = this.openState ? filtered[this.highlightedIndex] : undefined;
    if (active)
      input.setAttribute(
        "aria-activedescendant",
        `${this.internalId}-option-${this.highlightedIndex}`,
      );
    input.addEventListener("focus", () => {
      if (!this.openState) this.open();
    });
    input.addEventListener("input", () => {
      this.query = input.value;
      this.openState = true;
      this.highlightedIndex = this.firstEnabledIndex(this.filteredOptions());
      this.render(true);
    });
    input.addEventListener("keydown", (event) =>
      this.handleInputKeydown(event),
    );
    this.input = input;
    inner.append(input);
    control.append(inner);

    const toggle = this.ownerDocument.createElement("button");
    toggle.type = "button";
    toggle.className = "toggle";
    toggle.disabled = disabled;
    toggle.setAttribute("aria-label", this.toggleLabel());
    toggle.setAttribute("aria-expanded", String(this.openState));
    toggle.setAttribute("aria-controls", listboxId);
    const chevron = this.ownerDocument.createElement("span");
    chevron.className = "chevron";
    chevron.setAttribute("aria-hidden", "true");
    toggle.append(chevron);
    toggle.addEventListener("pointerdown", (event) => event.preventDefault());
    toggle.addEventListener("click", () => {
      if (this.openState) this.close(true);
      else this.open();
    });
    control.append(toggle);
    wrapper.append(control);

    if (this.openState) {
      const listbox = this.ownerDocument.createElement("ul");
      listbox.id = listboxId;
      listbox.className = "listbox";
      listbox.role = "listbox";
      listbox.setAttribute("aria-label", this.label);
      listbox.setAttribute("aria-multiselectable", "true");
      listbox.setAttribute("data-lenis-prevent", "");
      listbox.setAttribute("data-lenis-prevent-wheel", "");
      listbox.setAttribute("data-lenis-prevent-touch", "");
      if (filtered.length === 0) {
        const empty = this.ownerDocument.createElement("li");
        empty.className = "empty";
        empty.role = "presentation";
        empty.textContent = this.noResultsText();
        listbox.append(empty);
      } else {
        filtered.forEach((option, index) => {
          const row = this.ownerDocument.createElement("li");
          row.role = "presentation";
          const button = this.ownerDocument.createElement("button");
          button.id = `${this.internalId}-option-${index}`;
          button.type = "button";
          button.className = "option";
          button.role = "option";
          button.disabled = disabled || option.disabled === true;
          button.dataset.highlighted = String(index === this.highlightedIndex);
          button.setAttribute(
            "aria-selected",
            String(this.liveValue.includes(option.value)),
          );
          const optionLabel = this.ownerDocument.createElement("span");
          optionLabel.textContent = option.label;
          button.append(optionLabel);
          if (this.liveValue.includes(option.value)) {
            const check = this.ownerDocument.createElement("span");
            check.className = "check";
            check.setAttribute("aria-hidden", "true");
            check.textContent = "✓";
            button.append(check);
          }
          button.addEventListener("pointerenter", () => {
            if (!button.disabled) {
              this.highlightedIndex = index;
              listbox.querySelectorAll(".option").forEach((item, itemIndex) => {
                (item as HTMLElement).dataset.highlighted = String(
                  itemIndex === index,
                );
              });
              input.setAttribute("aria-activedescendant", button.id);
            }
          });
          button.addEventListener("pointerdown", (event) =>
            event.preventDefault(),
          );
          button.addEventListener("click", () => this.toggleOption(option));
          row.append(button);
          listbox.append(row);
        });
      }
      wrapper.append(listbox);
    }
    field.append(wrapper);
    if (this.error) field.append(this.message(errorId, this.error, true));
    if (this.helperText) field.append(this.message(helperId, this.helperText));
    this.replaceShadow(styles, field);
    this.syncForm();

    if (hadInputFocus && !disabled) {
      queueMicrotask(() => {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
        const highlighted = this.shadowRoot?.querySelector<HTMLElement>(
          '.option[data-highlighted="true"]',
        );
        highlighted?.scrollIntoView?.({ block: "nearest" });
      });
    }
  }
}
