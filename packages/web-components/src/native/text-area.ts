import {
  DigitaltableteurElement,
  attachFormInternals,
  numberAttribute,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";

const styles = `
  :host { display: block; font-family: var(--primary-body-font); }
  :host([hidden]) { display: none; }
  .field { display: grid; gap: 0.5rem; }
  label { color: var(--color-primary, currentcolor); font-size: 1rem; }
  textarea { box-sizing: border-box; inline-size: 100%; min-block-size: 5rem; padding: 0.5rem; resize: vertical; border: 1px solid var(--color-border, #767676); border-radius: var(--radius-lg, 0.5rem); background: var(--color-white, Canvas); color: var(--color-primary, CanvasText); font: inherit; line-height: 1.5; }
  textarea:focus-visible { outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--color-primary)); outline-offset: var(--focus-ring-offset, 2px); }
  textarea[aria-invalid="true"] { border-color: var(--color-error); }
  textarea:disabled { background: var(--color-disabled-bg-light, #eee); cursor: not-allowed; }
  .animated { overflow-y: hidden; transition: block-size var(--duration-fast, 160ms) var(--ease-out-cubic, ease); }
  .message { margin: 0; font-size: 0.875rem; color: var(--color-primary, currentcolor); }
  .error { color: var(--color-error-text, var(--color-error)); }
  @media (prefers-reduced-motion: reduce) { .animated { transition: none; } }
  @media (forced-colors: active) { textarea { border-color: CanvasText; } textarea[aria-invalid="true"] { border-color: Mark; } }
`;

export class DtTextAreaElement extends DigitaltableteurElement {
  static formAssociated = true;
  static observedAttributes = [
    "label",
    "value",
    "default-value",
    "error",
    "helper-text",
    "animate-resize",
    "min-rows",
    "max-rows",
    "disabled",
    "required",
    "placeholder",
    "name",
  ];
  private control: HTMLTextAreaElement | null = null;
  private formDisabled = false;
  private readonly internals = attachFormInternals(this);

  connectedCallback(): void {
    this.render();
  }
  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }
  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
    if (this.control)
      this.control.disabled = disabled || this.hasAttribute("disabled");
  }
  formResetCallback(): void {
    this.value = stringAttribute(this, "default-value");
  }
  get label(): string {
    return stringAttribute(this, "label");
  }
  set label(value: string) {
    reflectAttribute(this, "label", value || null);
  }
  get value(): string {
    return (
      this.control?.value ??
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
  get animateResize(): boolean {
    return this.hasAttribute("animate-resize");
  }
  set animateResize(value: boolean) {
    reflectBooleanAttribute(this, "animate-resize", value);
  }
  get minRows(): number {
    return numberAttribute(this, "min-rows", 3);
  }
  set minRows(value: number) {
    reflectAttribute(this, "min-rows", value);
  }
  get maxRows(): number {
    return numberAttribute(this, "max-rows", 8);
  }
  set maxRows(value: number) {
    reflectAttribute(this, "max-rows", value);
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

  private resize(): void {
    if (!this.control || !this.animateResize) return;
    this.control.style.height = "auto";
    const lineHeight =
      Number.parseFloat(getComputedStyle(this.control).lineHeight) || 24;
    const min = numberAttribute(this, "min-rows", 3) * lineHeight;
    const max = numberAttribute(this, "max-rows", 8) * lineHeight;
    this.control.style.height = `${Math.min(max, Math.max(min, this.control.scrollHeight))}px`;
    this.control.style.overflowY =
      this.control.scrollHeight > max ? "auto" : "hidden";
  }

  private render(): void {
    const field = this.ownerDocument.createElement("div");
    field.className = "field";
    const label = this.ownerDocument.createElement("label");
    label.htmlFor = "control";
    label.textContent = this.label;
    if (this.hasAttribute("required")) label.append(" *");
    field.append(label);
    const textarea = this.ownerDocument.createElement("textarea");
    textarea.id = "control";
    textarea.value = stringAttribute(
      this,
      "value",
      stringAttribute(this, "default-value"),
    );
    textarea.name = stringAttribute(this, "name");
    textarea.placeholder = stringAttribute(this, "placeholder");
    textarea.disabled = this.hasAttribute("disabled") || this.formDisabled;
    textarea.required = this.hasAttribute("required");
    textarea.rows = numberAttribute(this, "min-rows", 3);
    if (this.animateResize) textarea.className = "animated";
    const error = stringAttribute(this, "error");
    const helper = stringAttribute(this, "helper-text");
    if (error) textarea.setAttribute("aria-invalid", "true");
    const describedBy = [error && "error", helper && "helper"]
      .filter(Boolean)
      .join(" ");
    if (describedBy) textarea.setAttribute("aria-describedby", describedBy);
    textarea.addEventListener("input", () => {
      this.internals?.setFormValue(textarea.value);
      this.internals?.setValidity(
        error ? { customError: true } : textarea.validity,
        error || textarea.validationMessage,
        textarea,
      );
      this.dispatchEvent(
        new CustomEvent("value-change", {
          detail: { value: textarea.value },
          bubbles: true,
          composed: true,
        }),
      );
      this.resize();
    });
    this.control = textarea;
    field.append(textarea);
    if (error) field.append(this.message("error", error, true));
    if (helper) field.append(this.message("helper", helper));
    this.replaceShadow(styles, field);
    this.internals?.setFormValue(textarea.value);
    this.internals?.setValidity(
      error ? { customError: true } : textarea.validity,
      error || textarea.validationMessage,
      textarea,
    );
    queueMicrotask(() => this.resize());
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
