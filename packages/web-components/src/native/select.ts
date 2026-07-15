import {
  DigitaltableteurElement,
  attachFormInternals,
  enumAttribute,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";
import { localizedText } from "./localization";
import type { DtSelectOptionElement } from "./select-option";

const SIZES = ["sm", "md", "lg"] as const;
export type DtSelectSize = (typeof SIZES)[number];

export interface DtSelectOptionItem {
  value: string;
  label: string;
  disabled?: boolean;
  selected?: boolean;
}

const styles = `
  :host { display: block; inline-size: 100%; font-family: var(--font-text, var(--primary-body-font, sans-serif)); }
  :host([hidden]) { display: none; }
  .container { display: flex; inline-size: 100%; flex-direction: column; gap: 0.5rem; }
  label { display: flex; align-items: center; gap: 0.25rem; color: var(--color-primary, currentcolor); font: inherit; }
  label.disabled { color: var(--color-muted-light, GrayText); cursor: not-allowed; }
  .required { color: var(--color-error, #b00020); }
  .srOnly { position: absolute; inline-size: 1px; block-size: 1px; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  .wrapper { position: relative; display: flex; inline-size: 100%; align-items: center; }
  select { box-sizing: border-box; inline-size: 100%; border: 1px solid var(--color-border, #767676); border-radius: var(--radius-lg, 0.5rem); background-color: var(--color-white, Canvas); color: var(--primary-text-color, CanvasText); appearance: none; font-family: inherit; transition: border-color 0.3s; }
  select.sm { padding: 0.375rem 2.25rem 0.375rem 0.625rem; font-size: 0.875rem; line-height: 1.25; }
  select.md { padding: 0.5rem 2.5rem 0.5rem 0.75rem; font-size: 1rem; line-height: 1.5; }
  select.lg { padding: 0.625rem 2.75rem 0.625rem 0.875rem; font-size: 1.125rem; line-height: 1.75; }
  select:focus-visible { outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--color-primary)); outline-offset: var(--focus-ring-offset, 2px); }
  select.error { border-color: var(--color-error, #b00020); }
  select.error:focus-visible { outline-color: var(--color-error, #b00020); }
  select:disabled { border-color: var(--color-primary-disabled, GrayText); background-color: var(--color-disabled-bg-light, #eee); color: var(--color-disabled-placeholder, GrayText); cursor: not-allowed; }
  .chevron { position: absolute; inset-inline-end: 1rem; inline-size: 1rem; block-size: 1rem; color: var(--color-primary, currentcolor); pointer-events: none; }
  .chevron::before { content: ""; display: block; inline-size: 0.55rem; block-size: 0.55rem; border-inline-end: 2px solid currentcolor; border-block-end: 2px solid currentcolor; rotate: 45deg; translate: 0 -20%; }
  .message { display: flex; margin: 0; align-items: center; gap: 0.375rem; background: transparent; font-size: 0.875rem; color: var(--color-primary, currentcolor); }
  .errorMessage { color: var(--color-error, #b00020); }
  @media (forced-colors: active) { select { border-color: CanvasText; } select.error { border-color: Mark; } }
`;

export class DtSelectElement extends DigitaltableteurElement {
  static formAssociated = true;
  static observedAttributes = [
    "label",
    "options",
    "helper-text",
    "error",
    "size",
    "value",
    "default-value",
    "disabled",
    "required",
    "name",
    "required-text",
    "lang",
  ];

  private control: HTMLSelectElement | null = null;
  private formDisabled = false;
  private liveValue: string | null = null;
  private valueDirty = false;
  private assignedOptions: DtSelectOptionItem[] | null = null;
  private readonly internals = attachFormInternals(this);

  connectedCallback(): void {
    if (this.liveValue === null) {
      if (this.hasAttribute("value")) {
        this.liveValue = stringAttribute(this, "value");
      } else if (this.hasAttribute("default-value")) {
        this.liveValue = stringAttribute(this, "default-value");
      }
    }
    this.addEventListener("option-change", this.handleOptionChange);
    this.observeLightDom(() => this.render());
    this.render();
  }

  disconnectedCallback(): void {
    this.removeEventListener("option-change", this.handleOptionChange);
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
        value === null
          ? this.hasAttribute("default-value")
            ? this.defaultValue
            : null
          : value;
      this.valueDirty = false;
    } else if (
      name === "default-value" &&
      !this.valueDirty &&
      !this.hasAttribute("value")
    ) {
      this.liveValue = value;
    }
    if (this.isConnected) this.render();
  }

  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
    if (this.control) this.control.disabled = disabled || this.disabled;
  }

  formResetCallback(): void {
    this.liveValue = this.hasAttribute("default-value")
      ? this.defaultValue
      : null;
    this.valueDirty = false;
    this.render();
  }

  get label(): string {
    return stringAttribute(this, "label");
  }
  set label(value: string) {
    reflectAttribute(this, "label", value || null);
  }

  get options(): DtSelectOptionItem[] {
    return this.assignedOptions ?? this.parseOptionsAttribute();
  }
  set options(value: DtSelectOptionItem[]) {
    this.assignedOptions = value.map((option) => ({ ...option }));
    if (this.isConnected) this.render();
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

  get size(): DtSelectSize {
    return enumAttribute(this, "size", SIZES, "md");
  }
  set size(value: DtSelectSize) {
    reflectAttribute(this, "size", value);
  }

  get value(): string {
    return this.control?.value ?? this.liveValue ?? "";
  }
  set value(value: string) {
    const reflectedValue = this.getAttribute("value");
    this.liveValue = value;
    this.valueDirty = false;
    reflectAttribute(this, "value", value);
    if (this.isConnected && reflectedValue === value) this.render();
  }

  get defaultValue(): string {
    return stringAttribute(this, "default-value");
  }
  set defaultValue(value: string) {
    reflectAttribute(this, "default-value", value || null);
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }
  set disabled(value: boolean) {
    reflectBooleanAttribute(this, "disabled", value);
  }

  get required(): boolean {
    return this.hasAttribute("required");
  }
  set required(value: boolean) {
    reflectBooleanAttribute(this, "required", value);
  }

  get name(): string {
    return stringAttribute(this, "name");
  }
  set name(value: string) {
    reflectAttribute(this, "name", value || null);
  }

  private readonly handleOptionChange = (event: Event): void => {
    if (event.target !== this) this.render();
  };

  private parseOptionsAttribute(): DtSelectOptionItem[] {
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
            selected: option.selected === true,
          },
        ];
      });
    } catch {
      return [];
    }
  }

  private declarativeOptions(): DtSelectOptionItem[] {
    return [...this.querySelectorAll(":scope > dt-select-option")].map(
      (element) => {
        const option = element as DtSelectOptionElement;
        return {
          value: option.value,
          label: option.label,
          disabled: option.disabled,
          selected: option.selected,
        };
      },
    );
  }

  private commit(value: string): void {
    this.liveValue = value;
    this.valueDirty = true;
    this.syncForm();
    this.dispatchEvent(
      new CustomEvent("value-change", {
        detail: { value },
        bubbles: true,
        composed: true,
      }),
    );
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  }

  private requiredText(): string {
    const override = this.getAttribute("required-text");
    if (override !== null) return override;
    return localizedText(this, {
      en: " (required)",
      fi: " (pakollinen)",
      sv: " (obligatorisk)",
    });
  }

  private missingSelectionMessage(select: HTMLSelectElement): string {
    const probe = select.cloneNode(true) as HTMLSelectElement;
    probe.required = true;
    probe.selectedIndex = -1;
    return probe.validationMessage;
  }

  private selectedEnabledOption(
    select: HTMLSelectElement,
  ): HTMLOptionElement | null {
    return (
      [...select.options].find(
        (option) => option.selected && !option.disabled,
      ) ?? null
    );
  }

  private optionsMatch(
    select: HTMLSelectElement,
    items: DtSelectOptionItem[],
  ): boolean {
    if (select.options.length !== items.length) return false;
    return items.every((item, index) => {
      const option = select.options.item(index);
      return (
        option !== null &&
        option.value === item.value &&
        option.textContent === item.label &&
        option.disabled === (item.disabled === true) &&
        option.defaultSelected === (item.selected === true)
      );
    });
  }

  private syncOptions(
    select: HTMLSelectElement,
    items: DtSelectOptionItem[],
  ): void {
    if (this.optionsMatch(select, items)) return;
    const fragment = this.ownerDocument.createDocumentFragment();
    for (const item of items) {
      const option = this.ownerDocument.createElement("option");
      option.value = item.value;
      option.textContent = item.label;
      option.disabled = item.disabled === true;
      option.defaultSelected = item.selected === true;
      fragment.append(option);
    }
    select.replaceChildren(fragment);
  }

  private defaultSelectedIndex(items: DtSelectOptionItem[]): number {
    const markedIndex = items.findIndex((item) => item.selected === true);
    if (markedIndex >= 0) return markedIndex;
    return items.length > 0 ? 0 : -1;
  }

  private buildLabel(): HTMLLabelElement {
    const label = this.ownerDocument.createElement("label");
    label.htmlFor = "control";
    if (this.disabled || this.formDisabled) label.className = "disabled";
    label.append(this.label);
    if (this.required) {
      const marker = this.ownerDocument.createElement("span");
      marker.className = "required";
      marker.setAttribute("aria-hidden", "true");
      marker.textContent = "*";
      const requiredText = this.ownerDocument.createElement("span");
      requiredText.className = "srOnly";
      requiredText.textContent = this.requiredText();
      label.append(marker, requiredText);
    }
    return label;
  }

  private buildMessage(id: string, text: string, error = false): HTMLElement {
    const message = this.ownerDocument.createElement("p");
    message.id = id;
    message.className = `message${error ? " errorMessage" : ""}`;
    message.textContent = text;
    if (error) message.setAttribute("role", "alert");
    return message;
  }

  private syncForm(): void {
    if (!this.control) return;
    const error = this.error;
    const selected = this.selectedEnabledOption(this.control);
    const missing = this.required && !selected;
    this.internals?.setFormValue(selected?.value ?? null);
    this.internals?.setValidity(
      missing ? { valueMissing: true } : error ? { customError: true } : {},
      error || (missing ? this.missingSelectionMessage(this.control) : ""),
      this.control,
    );
  }

  private render(): void {
    const root = this.shadowRoot;
    if (!root) return;
    let style = root.querySelector("style");
    if (!style) {
      style = this.ownerDocument.createElement("style");
      root.append(style);
    }
    style.textContent = styles;
    let container = root.querySelector(".container") as HTMLDivElement | null;
    if (!container) {
      container = this.ownerDocument.createElement("div");
      container.className = "container";
      root.append(container);
    }
    const error = this.error;
    const helper = this.helperText;
    let wrapper = container.querySelector(".wrapper") as HTMLDivElement | null;
    if (!wrapper) {
      wrapper = this.ownerDocument.createElement("div");
      wrapper.className = "wrapper";
      container.append(wrapper);
    }
    const select =
      this.control && this.control.parentElement === wrapper
        ? this.control
        : this.ownerDocument.createElement("select");
    select.id = "control";
    select.name = this.name;
    select.className = `${this.size}${error ? " error" : ""}`;
    select.disabled = this.disabled || this.formDisabled;
    select.required = this.required;
    const describedBy = [error && "error", helper && "helper"]
      .filter(Boolean)
      .join(" ");
    if (describedBy) select.setAttribute("aria-describedby", describedBy);
    else select.removeAttribute("aria-describedby");
    if (error) select.setAttribute("aria-invalid", "true");
    else select.removeAttribute("aria-invalid");

    const declarative = this.declarativeOptions();
    const options = declarative.length > 0 ? declarative : this.options;
    this.syncOptions(select, options);

    const desiredValue = this.liveValue;
    if (desiredValue !== null) select.value = desiredValue;
    else select.selectedIndex = this.defaultSelectedIndex(options);
    if (select !== this.control) {
      select.addEventListener("change", () => this.commit(select.value));
      this.control = select;
    }
    if (select.parentElement !== wrapper) wrapper.prepend(select);

    let chevron = wrapper.querySelector(".chevron") as HTMLSpanElement | null;
    if (!chevron) {
      chevron = this.ownerDocument.createElement("span");
      chevron.className = "chevron";
      chevron.setAttribute("aria-hidden", "true");
      wrapper.append(chevron);
    }

    const existingLabel = container.querySelector("label");
    if (this.label) {
      const label = this.buildLabel();
      if (existingLabel) existingLabel.replaceWith(label);
      else container.insertBefore(label, wrapper);
    } else {
      existingLabel?.remove();
    }

    const existingError = container.querySelector("#error");
    if (error) {
      const errorMessage = this.buildMessage("error", error, true);
      if (existingError) existingError.replaceWith(errorMessage);
      else container.append(errorMessage);
    } else {
      existingError?.remove();
    }

    const existingHelper = container.querySelector("#helper");
    if (helper) {
      const helperMessage = this.buildMessage("helper", helper);
      if (existingHelper) existingHelper.replaceWith(helperMessage);
      else container.append(helperMessage);
    } else {
      existingHelper?.remove();
    }

    if (desiredValue === null) this.liveValue = select.value;
    this.syncForm();
  }
}
