import {
  DigitaltableteurElement,
  attachFormInternals,
  enumAttribute,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";
import { localizedText } from "./localization";
import type { DtRadioElement, DtRadioSize } from "./radio";

const ORIENTATIONS = ["vertical", "horizontal"] as const;
export type DtRadioGroupOrientation = (typeof ORIENTATIONS)[number];
export interface DtRadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

const styles = `
  :host { display: block; inline-size: 100%; font-family: var(--primary-body-font); }
  :host([hidden]) { display: none; }
  fieldset { margin: 0; padding: 0; border: 0; min-inline-size: 0; }
  legend { margin-block-end: var(--space-internal-8, 0.5rem); padding: 0; color: var(--color-title, currentcolor); font-family: var(--font-text, var(--primary-body-font)); font-size: var(--font-size-text-s, 0.875rem); font-weight: 600; }
  .options { display: flex; gap: var(--space-layout-16, 1rem); }
  .vertical { flex-direction: column; }
  .horizontal { flex-flow: row wrap; }
  .message { margin: 0.5rem 0 0; font-size: 0.875rem; }
  .error { color: var(--color-error, #b00020); }
`;

let radioGroupCounter = 0;

export class DtRadioGroupElement extends DigitaltableteurElement {
  static formAssociated = true;
  static observedAttributes = [
    "name",
    "legend",
    "options",
    "value",
    "default-value",
    "orientation",
    "size",
    "disabled",
    "error",
    "helper-text",
    "required",
    "required-message",
  ];

  private readonly generatedName = `dt-radio-group-${++radioGroupCounter}`;
  private readonly internals = attachFormInternals(this);
  private assignedOptions: DtRadioOption[] | null = null;
  private liveValue: string | null = null;
  private valueDirty = false;
  private formDisabled = false;

  connectedCallback(): void {
    this.liveValue ??= stringAttribute(
      this,
      "value",
      stringAttribute(this, "default-value"),
    );
    this.addEventListener("checked-change", this.handleCheckedChange);
    this.observeLightDom(() => this.render());
    this.render();
  }

  disconnectedCallback(): void {
    this.removeEventListener("checked-change", this.handleCheckedChange);
    super.disconnectedCallback();
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    value: string | null,
  ): void {
    if (name === "options") this.assignedOptions = null;
    if (name === "value") {
      this.liveValue = value === null ? this.defaultValue : value;
      this.valueDirty = false;
    } else if (
      name === "default-value" &&
      !this.valueDirty &&
      !this.hasAttribute("value")
    ) {
      this.liveValue = value ?? "";
    }
    if (this.isConnected) this.render();
  }

  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
    this.syncControls();
  }

  formResetCallback(): void {
    this.liveValue = this.defaultValue;
    this.valueDirty = false;
    this.render();
  }

  get name(): string {
    return stringAttribute(this, "name", this.generatedName);
  }
  set name(value: string) {
    reflectAttribute(this, "name", value || null);
  }
  get legend(): string {
    return stringAttribute(this, "legend");
  }
  set legend(value: string) {
    reflectAttribute(this, "legend", value || null);
  }
  get options(): DtRadioOption[] {
    return this.assignedOptions ?? this.parseOptions();
  }
  set options(value: DtRadioOption[]) {
    this.assignedOptions = value.map((option) => ({ ...option }));
    if (this.isConnected) this.render();
  }
  get value(): string {
    return this.liveValue ?? "";
  }
  set value(value: string) {
    reflectAttribute(this, "value", value);
  }
  get defaultValue(): string {
    return stringAttribute(this, "default-value");
  }
  set defaultValue(value: string) {
    reflectAttribute(this, "default-value", value || null);
  }
  get orientation(): DtRadioGroupOrientation {
    return enumAttribute(this, "orientation", ORIENTATIONS, "vertical");
  }
  set orientation(value: DtRadioGroupOrientation) {
    reflectAttribute(this, "orientation", value);
  }
  get size(): DtRadioSize {
    return enumAttribute(this, "size", ["sm", "md", "lg"] as const, "md");
  }
  set size(value: DtRadioSize) {
    reflectAttribute(this, "size", value);
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
  get requiredMessage(): string {
    return (
      stringAttribute(this, "required-message") ||
      localizedText(this, {
        en: "Please select an option.",
        fi: "Valitse vaihtoehto.",
        sv: "Välj ett alternativ.",
      })
    );
  }
  set requiredMessage(value: string) {
    reflectAttribute(this, "required-message", value || null);
  }
  get error(): string {
    return stringAttribute(this, "error");
  }
  set error(value: string) {
    reflectAttribute(this, "error", value || null);
  }
  get helperText(): string {
    return stringAttribute(this, "helper-text");
  }
  set helperText(value: string) {
    reflectAttribute(this, "helper-text", value || null);
  }

  private parseOptions(): DtRadioOption[] {
    const source = this.getAttribute("options");
    if (!source) return [];
    try {
      const parsed: unknown = JSON.parse(source);
      if (!Array.isArray(parsed)) return [];
      return parsed.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const option = item as Record<string, unknown>;
        return typeof option.value === "string" &&
          typeof option.label === "string"
          ? [
              {
                value: option.value,
                label: option.label,
                disabled: option.disabled === true,
              },
            ]
          : [];
      });
    } catch {
      return [];
    }
  }

  private get slottedRadios(): DtRadioElement[] {
    return [...this.children].filter(
      (child): child is DtRadioElement =>
        child.tagName.toLowerCase() === "dt-radio",
    );
  }

  private get controls(): DtRadioElement[] {
    const slotted = this.slottedRadios;
    return slotted.length > 0
      ? slotted
      : [
          ...(this.shadowRoot?.querySelectorAll<DtRadioElement>(
            ".options > dt-radio",
          ) ?? []),
        ];
  }

  private readonly handleCheckedChange = (event: Event): void => {
    const target = event
      .composedPath()
      .find(
        (node) =>
          node instanceof HTMLElement &&
          node.tagName.toLowerCase() === "dt-radio",
      );
    const detail = (event as CustomEvent<{ checked?: boolean }>).detail;
    if (!(target instanceof HTMLElement)) return;
    if (!detail?.checked) return;
    const radio = target as DtRadioElement;
    this.liveValue = radio.value;
    this.valueDirty = true;
    this.syncControls();
    this.syncForm();
    this.dispatchEvent(
      new CustomEvent("value-change", {
        detail: { value: radio.value },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private syncControls(): void {
    const inheritedDisabled = this.disabled || this.formDisabled;
    for (const radio of this.controls) {
      const checked = radio.value === this.value;
      if (radio.name !== this.name) radio.name = this.name;
      if (radio.size !== this.size) radio.size = this.size;
      if (radio.checked !== checked) radio.checked = checked;
      if (radio.inheritedDisabled !== inheritedDisabled) {
        radio.inheritedDisabled = inheritedDisabled;
      }
    }
  }

  private syncForm(): void {
    const selected = this.controls.find(
      (radio) =>
        radio.value === this.value &&
        radio.checked &&
        !radio.disabled &&
        !radio.inheritedDisabled,
    );
    const missing = this.required && !selected;
    const error = this.error;
    this.internals?.setFormValue(selected?.value ?? null);
    this.internals?.setValidity(
      missing ? { valueMissing: true } : error ? { customError: true } : {},
      missing ? this.requiredMessage : error || "",
      this,
    );
  }

  private render(): void {
    const fieldset = this.ownerDocument.createElement("fieldset");
    fieldset.disabled = this.disabled || this.formDisabled;
    if (this.error) fieldset.setAttribute("aria-invalid", "true");
    const describedBy = [this.helperText && "helper", this.error && "error"]
      .filter(Boolean)
      .join(" ");
    if (describedBy) fieldset.setAttribute("aria-describedby", describedBy);

    const legend = this.ownerDocument.createElement("legend");
    legend.textContent = this.legend;
    fieldset.append(legend);
    const optionContainer = this.ownerDocument.createElement("div");
    optionContainer.className = `options ${this.orientation}`;
    if (this.slottedRadios.length > 0) {
      optionContainer.append(this.ownerDocument.createElement("slot"));
    } else {
      for (const option of this.options) {
        const radio = this.ownerDocument.createElement(
          "dt-radio",
        ) as DtRadioElement;
        radio.label = option.label;
        radio.value = option.value;
        radio.disabled = option.disabled === true;
        optionContainer.append(radio);
      }
    }
    fieldset.append(optionContainer);
    if (this.helperText)
      fieldset.append(this.message("helper", this.helperText));
    if (this.error) fieldset.append(this.message("error", this.error, true));
    this.replaceShadow(styles, fieldset);
    this.syncControls();
    this.syncForm();
  }

  private message(id: string, text: string, error = false): HTMLElement {
    const message = this.ownerDocument.createElement("p");
    message.id = id;
    message.className = `message${error ? " error" : ""}`;
    message.textContent = text;
    if (error) message.setAttribute("role", "alert");
    return message;
  }
}
