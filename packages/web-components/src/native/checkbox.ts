import {
  DigitaltableteurElement,
  attachFormInternals,
  enumAttribute,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";
import { localizedText } from "./localization";

const SIZES = ["sm", "md", "lg"] as const;
export type DtCheckboxSize = (typeof SIZES)[number];
const styles = `
  :host { display: block; font-family: var(--primary-body-font); }
  :host([hidden]) { display: none; }
  .row { display: flex; align-items: center; gap: var(--space-internal-8, 0.5rem); }
  input { box-sizing: border-box; position: relative; margin: 0; flex: none; appearance: none; border: 1px solid var(--color-primary); border-radius: var(--radius-md, 0.25rem); background: var(--color-light-bg, Canvas); cursor: pointer; }
  input.sm { inline-size: 18px; block-size: 18px; }
  input.md { inline-size: 24px; block-size: 24px; }
  input.lg { inline-size: 30px; block-size: 30px; }
  input:checked, input:indeterminate { background: var(--color-primary); }
  input:checked::after { content: ""; position: absolute; inline-size: 45%; block-size: 25%; inset-inline-start: 25%; inset-block-start: 28%; border-inline-start: 2px solid var(--checkbox-checkmark-color, white); border-block-end: 2px solid var(--checkbox-checkmark-color, white); rotate: -45deg; }
  input:indeterminate::after { content: ""; position: absolute; inline-size: 50%; block-size: 2px; inset: 50% auto auto 25%; background: var(--checkbox-checkmark-color, white); translate: 0 -50%; }
  input:focus-visible { outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--color-primary)); outline-offset: var(--focus-ring-offset, 2px); }
  label { cursor: pointer; }
  input:disabled { background: var(--color-disabled-bg, #ddd); cursor: not-allowed; }
  input:disabled + label { color: var(--color-muted-light, #666); cursor: not-allowed; }
  .srOnly { position: absolute; inline-size: 1px; block-size: 1px; margin: -1px; overflow: hidden; clip-path: inset(50%); }
  .message { margin: 0.375rem 0 0; font-size: 0.875rem; }
  .error { color: var(--color-error-text, var(--color-error)); }
`;

export class DtCheckboxElement extends DigitaltableteurElement {
  static formAssociated = true;
  static observedAttributes = [
    "label",
    "show-label",
    "checked",
    "default-checked",
    "indeterminate",
    "disabled",
    "required",
    "size",
    "name",
    "value",
    "error",
    "helper-text",
    "required-message",
    "lang",
  ];
  private control: HTMLInputElement | null = null;
  private defaultCheckedInitialized = false;
  private formDisabled = false;
  private reflectingControlState = false;
  private readonly internals = attachFormInternals(this);
  connectedCallback(): void {
    if (!this.defaultCheckedInitialized) {
      this.defaultCheckedInitialized = true;
      if (
        this.hasAttribute("default-checked") &&
        !this.hasAttribute("checked")
      ) {
        this.setAttribute("checked", "");
        return;
      }
    }
    this.render();
  }
  attributeChangedCallback(name: string): void {
    if (
      this.reflectingControlState &&
      (name === "checked" || name === "indeterminate")
    ) {
      return;
    }
    if (!this.isConnected) return;
    if (
      this.control &&
      (name === "checked" ||
        name === "indeterminate" ||
        name === "disabled" ||
        name === "required")
    ) {
      this.syncControl();
      this.syncForm();
      return;
    }
    this.render();
  }
  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
    if (this.control) this.control.disabled = disabled || this.disabled;
  }
  formResetCallback(): void {
    this.checked = this.hasAttribute("default-checked");
  }
  get label(): string {
    return stringAttribute(this, "label");
  }
  set label(value: string) {
    reflectAttribute(this, "label", value || null);
  }
  get showLabel(): boolean {
    return this.getAttribute("show-label") !== "false";
  }
  set showLabel(value: boolean) {
    reflectAttribute(this, "show-label", value ? null : "false");
  }
  get checked(): boolean {
    return this.hasAttribute("checked");
  }
  set checked(value: boolean) {
    reflectBooleanAttribute(this, "checked", value);
  }
  get defaultChecked(): boolean {
    return this.hasAttribute("default-checked");
  }
  set defaultChecked(value: boolean) {
    reflectBooleanAttribute(this, "default-checked", value);
  }
  get indeterminate(): boolean {
    return this.hasAttribute("indeterminate");
  }
  set indeterminate(value: boolean) {
    reflectBooleanAttribute(this, "indeterminate", value);
  }
  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }
  set disabled(value: boolean) {
    reflectBooleanAttribute(this, "disabled", value);
  }
  get size(): DtCheckboxSize {
    return enumAttribute(this, "size", SIZES, "md");
  }
  set size(value: DtCheckboxSize) {
    reflectAttribute(this, "size", value);
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
  get value(): string {
    return stringAttribute(this, "value", "on");
  }
  set value(value: string) {
    reflectAttribute(this, "value", value || null);
  }

  private requiredMessage(): string {
    const override = this.getAttribute("required-message");
    if (override !== null) return override;
    return localizedText(this, {
      en: "Please check this box.",
      fi: "Valitse tämä ruutu.",
      sv: "Markera den här rutan.",
    });
  }

  private syncControl(): void {
    if (!this.control) return;
    this.control.checked = this.checked;
    this.control.indeterminate = this.indeterminate;
    this.control.disabled = this.disabled || this.formDisabled;
    this.control.required = this.required;
  }

  private syncForm(): void {
    this.internals?.setFormValue(
      this.checked ? stringAttribute(this, "value", "on") : null,
    );
    const missing = this.hasAttribute("required") && !this.checked;
    this.internals?.setValidity(
      missing ? { valueMissing: true } : {},
      missing ? this.requiredMessage() : "",
      this.control ?? undefined,
    );
  }

  private render(): void {
    const fragment = this.ownerDocument.createDocumentFragment();
    const row = this.ownerDocument.createElement("div");
    row.className = "row";
    const input = this.ownerDocument.createElement("input");
    input.id = "control";
    input.type = "checkbox";
    input.className = this.size;
    input.checked = this.checked;
    input.indeterminate = this.indeterminate;
    input.disabled = this.disabled || this.formDisabled;
    input.required = this.hasAttribute("required");
    const error = stringAttribute(this, "error");
    const helper = stringAttribute(this, "helper-text");
    if (error) input.setAttribute("aria-invalid", "true");
    const describedBy = [error && "error", helper && "helper"]
      .filter(Boolean)
      .join(" ");
    if (describedBy) input.setAttribute("aria-describedby", describedBy);
    input.addEventListener("change", () => {
      this.reflectingControlState = true;
      reflectBooleanAttribute(this, "indeterminate", false);
      reflectBooleanAttribute(this, "checked", input.checked);
      this.reflectingControlState = false;
      this.syncForm();
      this.dispatchEvent(
        new CustomEvent("checked-change", {
          detail: { checked: input.checked },
          bubbles: true,
          composed: true,
        }),
      );
    });
    this.control = input;
    row.append(input);
    const label = this.ownerDocument.createElement("label");
    label.htmlFor = "control";
    label.textContent = stringAttribute(this, "label");
    if (this.getAttribute("show-label") === "false") label.className = "srOnly";
    row.append(label);
    fragment.append(row);
    if (error) fragment.append(this.message("error", error, true));
    if (helper) fragment.append(this.message("helper", helper));
    this.replaceShadow(styles, fragment);
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
