import {
  DigitaltableteurElement,
  attachFormInternals,
  enumAttribute,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";

const SIZES = ["sm", "md", "lg"] as const;
export type DtRadioSize = (typeof SIZES)[number];

const styles = `
  :host { display: inline-flex; font-family: var(--primary-body-font); }
  :host([hidden]) { display: none; }
  .row {
    display: inline-flex;
    align-items: center;
    gap: var(--space-internal-8, 0.5rem);
  }
  input {
    margin: 0;
    flex: none;
    border: 1px solid var(--color-primary);
    border-radius: 50%;
    background: var(--main-body-background-color, var(--color-white, Canvas));
    cursor: pointer;
    transition: box-shadow var(--duration-fast, 160ms) var(--ease-out-expo, ease);
    appearance: none;
  }
  input:focus-visible {
    outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--color-primary));
    outline-offset: var(--focus-ring-offset, 2px);
  }
  input:checked {
    border-color: var(--color-primary);
    box-shadow: inset 0 0 0 4px var(--color-primary);
  }
  input:disabled {
    border-color: var(--color-primary-disabled, #b5b5b5);
    background: var(--color-disabled-bg, #eee);
    cursor: not-allowed;
  }
  input:disabled:checked {
    box-shadow: inset 0 0 0 4px var(--color-disabled-placeholder, #9a9a9a);
  }
  input.sm { inline-size: 1rem; block-size: 1rem; }
  input.md { inline-size: 1.25rem; block-size: 1.25rem; }
  input.lg { inline-size: 1.5rem; block-size: 1.5rem; }
  label { cursor: pointer; }
  .srOnly {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
  .message {
    margin: 0.375rem 0 0;
    font-size: 0.875rem;
  }
  .error {
    color: var(--color-error-text, var(--color-error));
  }
  @media (prefers-reduced-motion: reduce) {
    input {
      transition: none;
    }
  }
`;

export class DtRadioElement extends DigitaltableteurElement {
  static formAssociated = true;
  static observedAttributes = [
    "label",
    "show-label",
    "name",
    "value",
    "checked",
    "default-checked",
    "disabled",
    "required",
    "size",
    "error",
    "helper-text",
  ];

  private control: HTMLInputElement | null = null;
  private formDisabled = false;
  private reflectingControlState = false;
  private readonly internals = attachFormInternals(this);

  private get selectedValue(): string {
    return stringAttribute(this, "value", "on");
  }

  connectedCallback(): void {
    if (this.hasAttribute("default-checked") && !this.hasAttribute("checked")) {
      this.setAttribute("checked", "");
      return;
    }
    this.render();
    if (this.checked) this.uncheckPeers();
  }

  attributeChangedCallback(name: string): void {
    if (name === "checked" && this.reflectingControlState) return;
    if (this.isConnected) this.render();
  }

  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
    if (this.control) {
      this.control.disabled = disabled || this.disabled;
    }
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

  get name(): string {
    return stringAttribute(this, "name");
  }

  set name(value: string) {
    reflectAttribute(this, "name", value || null);
  }

  get value(): string {
    return this.selectedValue;
  }

  set value(value: string) {
    reflectAttribute(this, "value", value || "on");
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

  get size(): DtRadioSize {
    return enumAttribute(this, "size", SIZES, "md");
  }

  set size(value: DtRadioSize) {
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

  private syncForm(): void {
    const value = this.checked ? this.selectedValue : null;
    this.internals?.setFormValue(value);

    if (!this.control) return;
    const missing = this.required && !this.checked;
    this.internals?.setValidity(
      missing ? { valueMissing: true } : {},
      missing ? "Please select an option." : "",
      this.control,
    );
  }

  private render(): void {
    const fragment = this.ownerDocument.createDocumentFragment();
    const row = this.ownerDocument.createElement("div");
    row.className = "row";

    const input = this.ownerDocument.createElement("input");
    input.type = "radio";
    input.id = "control";
    input.name = this.name;
    input.value = this.selectedValue;
    input.className = this.size;
    input.checked = this.checked;
    input.disabled = this.disabled || this.formDisabled;
    input.required = this.required;

    const error = this.error;
    const helper = this.helperText;
    if (error) input.setAttribute("aria-invalid", "true");
    const describedBy = [error && "error", helper && "helper"]
      .filter(Boolean)
      .join(" ");
    if (describedBy) input.setAttribute("aria-describedby", describedBy);

    input.addEventListener("change", () => {
      if (input.checked) this.uncheckPeers();
      this.reflectingControlState = true;
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
    label.textContent = this.label;
    if (!this.showLabel) label.className = "srOnly";
    row.append(label);

    if (error) fragment.append(this.message("error", error, true));
    if (helper) fragment.append(this.message("helper", helper));

    fragment.append(row);
    this.replaceShadow(styles, fragment);
    this.syncForm();
  }

  private uncheckPeers(): void {
    if (!this.name) return;
    const root = this.getRootNode();
    if (!(root instanceof Document || root instanceof ShadowRoot)) return;
    const form = this.internals?.form ?? this.closest("form");
    for (const peer of root.querySelectorAll("dt-radio")) {
      if (peer === this || !(peer instanceof DtRadioElement)) continue;
      const peerForm = peer.internals?.form ?? peer.closest("form");
      if (peer.name === this.name && peerForm === form && peer.checked) {
        peer.checked = false;
      }
    }
  }

  private message(id: string, text: string, isError = false): HTMLElement {
    const message = this.ownerDocument.createElement("p");
    message.id = id;
    message.className = `message${isError ? " error" : ""}`;
    message.textContent = text;
    if (isError) message.setAttribute("role", "alert");
    return message;
  }
}
