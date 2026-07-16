import {
  DigitaltableteurElement,
  attachFormInternals,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";
import { localizedText } from "./localization";

export interface DtComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

const styles = `
  :host { display: block; inline-size: 100%; font-family: var(--font-text, var(--primary-body-font, sans-serif)); }
  :host([hidden]) { display: none; }
  .field { display: grid; gap: var(--space-internal-8, 0.5rem); }
  label { color: var(--color-primary, currentcolor); font: inherit; }
  label.disabled { color: var(--color-muted-light, GrayText); cursor: not-allowed; }
  .required { color: var(--color-error, #b00020); }
  .control { position: relative; display: flex; align-items: center; border: 1px solid var(--color-border, #767676); border-radius: var(--radius-lg, 0.5rem); background: var(--color-white, Canvas); }
  .control:focus-within { outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--color-primary)); outline-offset: var(--focus-ring-offset, 2px); }
  .control.open { border-end-start-radius: 0; border-end-end-radius: 0; }
  .control.error { border-color: var(--color-error, #b00020); background: var(--color-error-bg, Canvas); }
  .control.disabled { border-color: var(--color-primary-disabled, GrayText); background: var(--color-disabled-bg-light, #eee); }
  input { box-sizing: border-box; inline-size: 100%; min-inline-size: 0; min-block-size: 2.75rem; border: 0; background: transparent; color: var(--primary-text-color, CanvasText); padding: 0.625rem 2.75rem 0.625rem 0.75rem; font: inherit; }
  input:focus-visible { outline: 0; }
  input:disabled { color: var(--color-disabled-placeholder, GrayText); cursor: not-allowed; }
  .toggle { position: absolute; inset-inline-end: 0.25rem; display: inline-grid; inline-size: 2.25rem; block-size: 2.25rem; place-items: center; border: 0; border-radius: var(--radius-sm, 0.25rem); background: transparent; color: inherit; cursor: pointer; }
  .toggle:disabled { color: GrayText; cursor: not-allowed; }
  .chevron { inline-size: 0.55rem; block-size: 0.55rem; border-inline-end: 2px solid currentcolor; border-block-end: 2px solid currentcolor; rotate: 45deg; translate: 0 -20%; transition: rotate 150ms ease; }
  .open .chevron { rotate: 225deg; translate: 0 20%; }
  .listbox { position: absolute; z-index: 20; inset-block-start: 100%; inset-inline: -1px; max-block-size: 15rem; overflow: auto; margin: 0; padding: 0.25rem; border: 1px solid var(--color-border, #767676); border-start-start-radius: 0; border-start-end-radius: 0; border-end-start-radius: var(--radius-lg, 0.5rem); border-end-end-radius: var(--radius-lg, 0.5rem); background: var(--color-white, Canvas); box-shadow: var(--shadow-elevation-2, 0 0.4rem 1rem rgb(0 0 0 / 0.16)); list-style: none; }
  .listbox[hidden] { display: none; }
  .option { display: flex; inline-size: 100%; min-block-size: 2.5rem; align-items: center; justify-content: space-between; border: 0; border-radius: var(--radius-sm, 0.25rem); background: transparent; color: inherit; padding: 0.5rem 0.625rem; text-align: start; font: inherit; cursor: pointer; }
  .option.highlighted { background: var(--color-primary-light, Highlight); color: var(--color-on-primary, HighlightText); }
  .option.selected::after { content: "✓"; margin-inline-start: 0.75rem; }
  .option:disabled { color: var(--color-disabled-placeholder, GrayText); cursor: not-allowed; }
  .empty { padding: 0.75rem 0.625rem; color: var(--color-muted, #666); font-size: 0.875rem; }
  .message { margin: 0; font-size: 0.875rem; color: var(--color-primary, currentcolor); }
  .errorMessage { color: var(--color-error-text, var(--color-error, #b00020)); }
  .source { display: none; }
  @media (forced-colors: active) { .control, .listbox { border-color: CanvasText; } .control.error { border-color: Mark; } .option.highlighted { outline: 1px solid Highlight; } }
  @media (prefers-reduced-motion: reduce) { .chevron { transition: none; } }
`;

/** Native editable single-select combobox with filtering and form association. */
export class DtComboboxElement extends DigitaltableteurElement {
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
    "name",
    "no-results-text",
    "toggle-label",
    "lang",
  ];

  private control: HTMLInputElement | null = null;
  private listbox: HTMLUListElement | null = null;
  private assignedOptions: DtComboboxOption[] | null = null;
  private liveValue: string | null = null;
  private valueDirty = false;
  private initialized = false;
  private openState = false;
  private query = "";
  private queryDirty = false;
  private highlightedIndex = -1;
  private formDisabled = false;
  private readonly internals = attachFormInternals(this);

  connectedCallback(): void {
    if (!this.initialized) {
      this.liveValue = this.hasAttribute("value")
        ? stringAttribute(this, "value")
        : this.hasAttribute("default-value")
          ? stringAttribute(this, "default-value")
          : "";
      this.initialized = true;
    }
    this.ownerDocument.addEventListener(
      "pointerdown",
      this.handleOutsidePointer,
    );
    this.observeLightDom(() => this.render());
    this.render();
  }

  disconnectedCallback(): void {
    this.ownerDocument.removeEventListener(
      "pointerdown",
      this.handleOutsidePointer,
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
      this.liveValue =
        value ?? (this.hasAttribute("default-value") ? this.defaultValue : "");
      this.valueDirty = false;
      this.query = "";
      this.queryDirty = false;
    } else if (
      name === "default-value" &&
      !this.valueDirty &&
      !this.hasAttribute("value")
    ) {
      this.liveValue = value ?? "";
    } else if (name === "disabled" && this.disabled) {
      this.openState = false;
    }
    if (this.isConnected) this.render();
  }

  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
    if (disabled) this.openState = false;
    this.render();
  }

  formResetCallback(): void {
    this.liveValue = this.hasAttribute("default-value")
      ? this.defaultValue
      : "";
    this.valueDirty = false;
    this.query = "";
    this.queryDirty = false;
    this.openState = false;
    this.render();
  }

  formStateRestoreCallback(state: string | File | FormData | null): void {
    this.liveValue = typeof state === "string" ? state : "";
    this.valueDirty = true;
    this.query = "";
    this.queryDirty = false;
    this.openState = false;
    this.render();
  }

  get label(): string {
    return stringAttribute(this, "label");
  }
  set label(value: string) {
    reflectAttribute(this, "label", value || null);
  }

  get options(): DtComboboxOption[] {
    return this.assignedOptions ?? this.parseOptionsAttribute();
  }
  set options(value: DtComboboxOption[]) {
    this.assignedOptions = value.map((option) => ({ ...option }));
    if (this.isConnected) this.render();
  }

  get value(): string {
    return this.liveValue ?? "";
  }
  set value(value: string) {
    const current = this.getAttribute("value");
    this.liveValue = value;
    this.valueDirty = false;
    reflectAttribute(this, "value", value);
    if (this.isConnected && current === value) this.render();
  }

  get defaultValue(): string {
    return stringAttribute(this, "default-value");
  }
  set defaultValue(value: string) {
    reflectAttribute(this, "default-value", value || null);
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

  get name(): string {
    return stringAttribute(this, "name");
  }
  set name(value: string) {
    reflectAttribute(this, "name", value || null);
  }

  get open(): boolean {
    return this.openState;
  }

  private readonly handleOutsidePointer = (event: Event): void => {
    if (!this.openState) return;
    const path = event.composedPath();
    if (!path.includes(this)) this.close(true);
  };

  private parseOptionsAttribute(): DtComboboxOption[] {
    const source = this.getAttribute("options");
    if (!source) return [];
    try {
      const parsed: unknown = JSON.parse(source);
      if (!Array.isArray(parsed)) return [];
      return parsed.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const option = item as Record<string, unknown>;
        if (
          typeof option.value !== "string" ||
          typeof option.label !== "string"
        ) {
          return [];
        }
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

  private declarativeOptions(): DtComboboxOption[] {
    const elements = this.querySelectorAll(
      ":scope > option, :scope > dt-select-option, :scope > [data-combobox-option]",
    );
    return [...elements].flatMap((element) => {
      const candidate = element as HTMLElement & {
        value?: string;
        label?: string;
        disabled?: boolean;
      };
      const value = candidate.value ?? element.getAttribute("value");
      const label =
        candidate.label ?? element.getAttribute("label") ?? element.textContent;
      if (value === null || !label) return [];
      return [
        {
          value,
          label: label.trim(),
          disabled:
            candidate.disabled === true || element.hasAttribute("disabled"),
        },
      ];
    });
  }

  private resolvedOptions(): DtComboboxOption[] {
    const declarative = this.declarativeOptions();
    return declarative.length > 0 ? declarative : this.options;
  }

  private filteredOptions(): DtComboboxOption[] {
    const options = this.resolvedOptions();
    if (!this.queryDirty || !this.query.trim()) return options;
    const query = this.query.trim().toLocaleLowerCase();
    return options.filter(
      (option) =>
        option.label.toLocaleLowerCase().includes(query) ||
        option.value.toLocaleLowerCase().includes(query),
    );
  }

  private selectedOption(): DtComboboxOption | undefined {
    return this.resolvedOptions().find((option) => option.value === this.value);
  }

  private nextEnabledIndex(start: number, direction: 1 | -1): number {
    const options = this.filteredOptions();
    if (options.length === 0) return -1;
    for (let offset = 1; offset <= options.length; offset += 1) {
      const index =
        (start + direction * offset + options.length) % options.length;
      if (!options[index]?.disabled) return index;
    }
    return -1;
  }

  private initialHighlight(): number {
    const options = this.filteredOptions();
    const selected = options.findIndex(
      (option) => option.value === this.value && !option.disabled,
    );
    if (selected >= 0) return selected;
    return options.findIndex((option) => !option.disabled);
  }

  private openList(): void {
    if (this.disabled || this.formDisabled) return;
    this.openState = true;
    this.highlightedIndex = this.initialHighlight();
    this.syncInteractiveState();
    if (!this.queryDirty && this.control?.value) this.control.select();
  }

  private close(restoreLabel: boolean): void {
    this.openState = false;
    this.highlightedIndex = -1;
    if (restoreLabel) {
      this.query = "";
      this.queryDirty = false;
      if (this.control) this.control.value = this.selectedOption()?.label ?? "";
    }
    this.syncInteractiveState();
  }

  private select(option: DtComboboxOption): void {
    if (option.disabled || this.disabled || this.formDisabled) return;
    this.liveValue = option.value;
    this.valueDirty = true;
    this.query = "";
    this.queryDirty = false;
    this.openState = false;
    this.highlightedIndex = -1;
    if (this.control) this.control.value = option.label;
    this.syncInteractiveState();
    this.syncForm();
    this.dispatchEvent(
      new CustomEvent("value-change", {
        detail: { value: option.value, option: { ...option } },
        bubbles: true,
        composed: true,
      }),
    );
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (this.disabled || this.formDisabled) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!this.openState) {
        this.openList();
        return;
      }
      this.highlightedIndex = this.nextEnabledIndex(
        this.highlightedIndex,
        event.key === "ArrowDown" ? 1 : -1,
      );
      this.syncInteractiveState();
      return;
    }
    if (event.key === "Home" && this.openState) {
      event.preventDefault();
      this.highlightedIndex = this.filteredOptions().findIndex(
        (option) => !option.disabled,
      );
      this.syncInteractiveState();
      return;
    }
    if (event.key === "End" && this.openState) {
      event.preventDefault();
      const options = this.filteredOptions();
      this.highlightedIndex =
        [...options]
          .map((option, index) => ({ option, index }))
          .reverse()
          .find(({ option }) => !option.disabled)?.index ?? -1;
      this.syncInteractiveState();
      return;
    }
    if (event.key === "Enter" && this.openState) {
      event.preventDefault();
      const option = this.filteredOptions()[this.highlightedIndex];
      if (option) this.select(option);
      return;
    }
    if (event.key === "Escape" && this.openState) {
      event.preventDefault();
      this.close(true);
      return;
    }
    if (event.key === "Tab" && this.openState) this.close(true);
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
      fi: "Näytä tai piilota vaihtoehdot",
      sv: "Visa eller dölj alternativ",
    });
  }

  private optionId(index: number): string {
    return `${this.id || "control"}-option-${index}`;
  }

  private syncInteractiveState(): void {
    if (!this.control || !this.listbox) return;
    const controlContainer = this.control.closest(".control");
    controlContainer?.classList.toggle("open", this.openState);
    this.control.setAttribute("aria-expanded", String(this.openState));
    this.control
      .closest(".control")
      ?.querySelector(".toggle")
      ?.setAttribute("aria-expanded", String(this.openState));
    const activeId =
      this.openState && this.highlightedIndex >= 0
        ? this.optionId(this.highlightedIndex)
        : null;
    if (activeId) this.control.setAttribute("aria-activedescendant", activeId);
    else this.control.removeAttribute("aria-activedescendant");
    this.listbox.hidden = !this.openState;
    this.renderOptions();
  }

  private renderOptions(): void {
    if (!this.listbox) return;
    const options = this.filteredOptions();
    const fragment = this.ownerDocument.createDocumentFragment();
    if (options.length === 0) {
      const empty = this.ownerDocument.createElement("li");
      empty.className = "empty";
      empty.setAttribute("role", "presentation");
      empty.textContent = this.noResultsText();
      fragment.append(empty);
    } else {
      options.forEach((option, index) => {
        const item = this.ownerDocument.createElement("li");
        item.setAttribute("role", "presentation");
        const button = this.ownerDocument.createElement("button");
        button.id = this.optionId(index);
        button.type = "button";
        button.className = `option${index === this.highlightedIndex ? " highlighted" : ""}${option.value === this.value ? " selected" : ""}`;
        button.setAttribute("role", "option");
        button.setAttribute(
          "aria-selected",
          String(option.value === this.value),
        );
        button.disabled =
          option.disabled === true || this.disabled || this.formDisabled;
        button.textContent = option.label;
        button.addEventListener("pointermove", () => {
          if (!option.disabled) {
            this.highlightedIndex = index;
            this.syncInteractiveState();
          }
        });
        button.addEventListener("mousedown", (event) => event.preventDefault());
        button.addEventListener("click", () => this.select(option));
        item.append(button);
        fragment.append(item);
      });
    }
    this.listbox.replaceChildren(fragment);
    const active =
      this.highlightedIndex >= 0
        ? [...this.listbox.querySelectorAll<HTMLElement>(".option")].find(
            (option) => option.id === this.optionId(this.highlightedIndex),
          )
        : null;
    active?.scrollIntoView?.({ block: "nearest" });
  }

  private syncForm(): void {
    if (!this.control) return;
    const selected = this.selectedOption();
    const validSelection =
      selected && !selected.disabled ? selected : undefined;
    const missing = this.required && !validSelection;
    const error = this.error;
    this.internals?.setFormValue(
      validSelection?.value ?? null,
      validSelection?.value ?? null,
    );
    this.internals?.setValidity(
      missing ? { valueMissing: true } : error ? { customError: true } : {},
      error || (missing ? this.requiredMessage() : ""),
      this.control,
    );
  }

  private requiredMessage(): string {
    return localizedText(this, {
      en: "Please select an option.",
      fi: "Valitse vaihtoehto.",
      sv: "Välj ett alternativ.",
    });
  }

  private message(id: string, text: string, error = false): HTMLElement {
    const message = this.ownerDocument.createElement("p");
    message.id = id;
    message.className = `message${error ? " errorMessage" : ""}`;
    message.textContent = text;
    if (error) message.setAttribute("role", "alert");
    return message;
  }

  private render(): void {
    const hadFocus = this.shadowRoot?.activeElement === this.control;
    const field = this.ownerDocument.createElement("div");
    field.className = "field";
    const controlId = this.id || "control";
    const listboxId = `${controlId}-listbox`;
    const error = this.error;
    const helper = this.helperText;
    const disabled = this.disabled || this.formDisabled;

    const label = this.ownerDocument.createElement("label");
    label.htmlFor = controlId;
    label.className = disabled ? "disabled" : "";
    label.append(this.label);
    if (this.required) {
      const marker = this.ownerDocument.createElement("span");
      marker.className = "required";
      marker.setAttribute("aria-hidden", "true");
      marker.textContent = " *";
      label.append(marker);
    }
    field.append(label);

    const controlContainer = this.ownerDocument.createElement("div");
    controlContainer.className = `control${this.openState ? " open" : ""}${error ? " error" : ""}${disabled ? " disabled" : ""}`;
    const input = this.ownerDocument.createElement("input");
    input.id = controlId;
    input.type = "text";
    input.role = "combobox";
    input.autocomplete = "off";
    input.placeholder = this.placeholder;
    input.disabled = disabled;
    input.value = this.queryDirty
      ? this.query
      : (this.selectedOption()?.label ?? "");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-expanded", String(this.openState));
    input.setAttribute("aria-controls", listboxId);
    if (this.required) input.setAttribute("aria-required", "true");
    if (error) input.setAttribute("aria-invalid", "true");
    const describedBy = [error && "error", helper && "helper"]
      .filter(Boolean)
      .join(" ");
    if (describedBy) input.setAttribute("aria-describedby", describedBy);
    input.addEventListener("click", () => this.openList());
    input.addEventListener("keydown", (event) => this.handleKeyDown(event));
    input.addEventListener("input", () => {
      this.query = input.value;
      this.queryDirty = true;
      this.openState = true;
      this.highlightedIndex = this.initialHighlight();
      this.syncInteractiveState();
      this.dispatchEvent(
        new CustomEvent("filter-change", {
          detail: {
            query: this.query,
            options: this.filteredOptions().map((option) => ({ ...option })),
          },
          bubbles: true,
          composed: true,
        }),
      );
    });

    const toggle = this.ownerDocument.createElement("button");
    toggle.type = "button";
    toggle.className = "toggle";
    toggle.tabIndex = -1;
    toggle.disabled = disabled;
    toggle.setAttribute("aria-label", this.toggleLabel());
    toggle.setAttribute("aria-expanded", String(this.openState));
    toggle.addEventListener("mousedown", (event) => event.preventDefault());
    toggle.addEventListener("click", () => {
      if (this.openState) this.close(true);
      else this.openList();
      input.focus();
    });
    const chevron = this.ownerDocument.createElement("span");
    chevron.className = "chevron";
    chevron.setAttribute("aria-hidden", "true");
    toggle.append(chevron);

    const listbox = this.ownerDocument.createElement("ul");
    listbox.id = listboxId;
    listbox.className = "listbox";
    listbox.setAttribute("role", "listbox");
    listbox.setAttribute("aria-label", this.label);
    listbox.hidden = !this.openState;

    this.control = input;
    this.listbox = listbox;
    controlContainer.append(input, toggle, listbox);
    field.append(controlContainer);
    if (error) field.append(this.message("error", error, true));
    if (helper) field.append(this.message("helper", helper));

    const source = this.ownerDocument.createElement("slot");
    source.className = "source";
    source.setAttribute("aria-hidden", "true");
    field.append(source);
    this.replaceShadow(styles, field);
    this.syncInteractiveState();
    this.syncForm();
    if (hadFocus) input.focus();
  }
}
