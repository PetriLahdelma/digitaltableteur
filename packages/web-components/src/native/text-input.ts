import {
  DigitaltableteurElement,
  attachFormInternals,
  enumAttribute,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";

const SIZES = ["sm", "md", "lg"] as const;
const TYPES = ["text", "number", "email", "password", "search", "tel"] as const;
export type DtTextInputSize = (typeof SIZES)[number];
export type DtTextInputType = (typeof TYPES)[number];

const styles = `
  :host { display: block; font-family: var(--primary-body-font); }
  :host([hidden]) { display: none; }
  .field { display: grid; gap: 0.5rem; }
  label { color: var(--color-primary, currentcolor); font-size: 1rem; }
  .srOnly { position: absolute; inline-size: 1px; block-size: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
  .control { position: relative; display: flex; align-items: center; }
  input { box-sizing: border-box; inline-size: 100%; border: 1px solid var(--color-border, #767676); border-radius: var(--radius-lg, 0.5rem); background: var(--color-white, Canvas); color: var(--color-primary, CanvasText); font: inherit; }
  input.sm { min-block-size: 2rem; padding: 0.375rem 0.625rem; }
  input.md { min-block-size: 2.5rem; padding: 0.5rem 0.75rem; }
  input.lg { min-block-size: 3rem; padding: 0.75rem 1rem; }
  input:focus-visible { outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--color-primary)); outline-offset: var(--focus-ring-offset, 2px); }
  input[aria-invalid="true"] { border-color: var(--color-error); }
  input:disabled { background: var(--color-disabled-bg-light, #eee); color: var(--color-muted-light, #666); cursor: not-allowed; }
  .clear { position: absolute; inset-inline-end: 0.5rem; display: inline-grid; place-items: center; border: 0; border-radius: 999px; background: transparent; color: inherit; font: inherit; cursor: pointer; }
  .hasClear { padding-inline-end: 2.5rem !important; }
  .message { margin: 0; font-size: 0.875rem; color: var(--color-primary, currentcolor); }
  .error { color: var(--color-error-text, var(--color-error)); }
  @media (forced-colors: active) { input { border-color: CanvasText; } input[aria-invalid="true"] { border-color: Mark; } }
`;

export class DtTextInputElement extends DigitaltableteurElement {
  static formAssociated = true;
  static observedAttributes = [
    "label",
    "type",
    "size",
    "value",
    "default-value",
    "error",
    "helper-text",
    "disabled",
    "required",
    "clearable",
    "hide-label",
    "placeholder",
    "name",
  ];

  private control: HTMLInputElement | null = null;
  private formDisabled = false;
  private liveValue: string | null = null;
  private valueDirty = false;
  private readonly internals = attachFormInternals(this);

  connectedCallback(): void {
    this.liveValue ??= stringAttribute(
      this,
      "value",
      stringAttribute(this, "default-value"),
    );
    this.render();
  }
  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    value: string | null,
  ): void {
    if (name === "value") {
      this.liveValue = value ?? "";
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
    if (this.control) this.control.disabled = disabled || this.disabled;
  }
  formResetCallback(): void {
    this.liveValue = stringAttribute(this, "default-value");
    this.valueDirty = false;
    this.render();
  }

  get label(): string {
    return stringAttribute(this, "label");
  }
  set label(value: string) {
    reflectAttribute(this, "label", value || null);
  }
  get type(): DtTextInputType {
    return enumAttribute(this, "type", TYPES, "text");
  }
  set type(value: DtTextInputType) {
    reflectAttribute(this, "type", value);
  }
  get size(): DtTextInputSize {
    return enumAttribute(this, "size", SIZES, "md");
  }
  set size(value: DtTextInputSize) {
    reflectAttribute(this, "size", value);
  }
  get value(): string {
    return (
      this.control?.value ??
      this.liveValue ??
      stringAttribute(this, "value", stringAttribute(this, "default-value"))
    );
  }
  set value(value: string) {
    reflectAttribute(this, "value", value);
  }
  get defaultValue(): string {
    return stringAttribute(this, "default-value");
  }
  set defaultValue(value: string) {
    reflectAttribute(this, "default-value", value);
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
  get clearable(): boolean {
    return this.hasAttribute("clearable");
  }
  set clearable(value: boolean) {
    reflectBooleanAttribute(this, "clearable", value);
  }
  get hideLabel(): boolean {
    return this.hasAttribute("hide-label");
  }
  set hideLabel(value: boolean) {
    reflectBooleanAttribute(this, "hide-label", value);
  }
  get placeholder(): string {
    return stringAttribute(this, "placeholder");
  }
  set placeholder(value: string) {
    reflectAttribute(this, "placeholder", value || null);
  }
  get name(): string {
    return stringAttribute(this, "name");
  }
  set name(value: string) {
    reflectAttribute(this, "name", value || null);
  }

  private commit(value: string, source: "input" | "clear"): void {
    this.liveValue = value;
    this.valueDirty = true;
    this.internals?.setFormValue(value);
    if (this.control) {
      const error = stringAttribute(this, "error");
      this.internals?.setValidity(
        error ? { customError: true } : this.control.validity,
        error || this.control.validationMessage,
        this.control,
      );
    }
    this.dispatchEvent(
      new CustomEvent("value-change", {
        detail: { value },
        bubbles: true,
        composed: true,
      }),
    );
    if (source === "clear") {
      this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
      this.dispatchEvent(
        new Event("change", { bubbles: true, composed: true }),
      );
    }
  }

  private render(): void {
    const field = this.ownerDocument.createElement("div");
    field.className = "field";
    const id = "control";
    const error = stringAttribute(this, "error");
    const helper = stringAttribute(this, "helper-text");

    const label = this.ownerDocument.createElement("label");
    label.htmlFor = id;
    label.textContent = this.label;
    if (this.hasAttribute("hide-label")) label.className = "srOnly";
    if (this.required) label.append(" *");
    field.append(label);

    const wrapper = this.ownerDocument.createElement("div");
    wrapper.className = "control";
    const input = this.ownerDocument.createElement("input");
    input.id = id;
    input.type = this.type;
    input.className = `${this.size}${this.clearable && this.value ? " hasClear" : ""}`;
    input.value =
      this.liveValue ??
      stringAttribute(this, "value", stringAttribute(this, "default-value"));
    input.name = stringAttribute(this, "name");
    input.placeholder = stringAttribute(this, "placeholder");
    input.disabled = this.disabled || this.formDisabled;
    input.required = this.required;
    if (error) input.setAttribute("aria-invalid", "true");
    const describedBy = [error && "error", helper && "helper"]
      .filter(Boolean)
      .join(" ");
    if (describedBy) input.setAttribute("aria-describedby", describedBy);
    let clear: HTMLButtonElement | null = null;
    input.addEventListener("input", () => {
      this.commit(input.value, "input");
      if (clear) clear.hidden = input.value.length === 0;
    });
    this.control = input;
    wrapper.append(input);

    if (this.clearable) {
      clear = this.ownerDocument.createElement("button");
      clear.type = "button";
      clear.className = "clear";
      clear.hidden = input.value.length === 0;
      clear.setAttribute("aria-label", `Clear ${this.label || "field"}`);
      clear.textContent = "×";
      clear.addEventListener("click", () => {
        input.value = "";
        clear!.hidden = true;
        this.commit("", "clear");
        this.dispatchEvent(
          new CustomEvent("clear", { bubbles: true, composed: true }),
        );
        input.focus();
      });
      wrapper.append(clear);
    }
    field.append(wrapper);

    if (error) field.append(this.message("error", error, "error", "alert"));
    if (helper) field.append(this.message("helper", helper));
    this.replaceShadow(styles, field);
    this.internals?.setFormValue(input.value);
    this.internals?.setValidity(
      error ? { customError: true } : input.validity,
      error || input.validationMessage,
      input,
    );
  }

  private message(
    id: string,
    text: string,
    className = "",
    role?: string,
  ): HTMLElement {
    const message = this.ownerDocument.createElement("p");
    message.id = id;
    message.className = `message ${className}`.trim();
    message.textContent = text;
    if (role) message.setAttribute("role", role);
    return message;
  }
}
