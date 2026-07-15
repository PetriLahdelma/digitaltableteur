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
    "required-message",
    "size",
    "error",
    "helper-text",
  ];

  private control: HTMLInputElement | null = null;
  private formDisabled = false;
  private inheritedDisabledState = false;
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
    this.reconcileGroupState();
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    _newValue: string | null,
  ): void {
    if (name === "checked" && this.reflectingControlState) return;
    const previousGroup =
      name === "name" && oldValue && oldValue !== this.name
        ? this.groupMembers(oldValue)
        : [];
    if (this.isConnected) this.render();
    if (
      this.isConnected &&
      (name === "checked" ||
        name === "name" ||
        name === "required" ||
        name === "disabled")
    ) {
      this.reconcileGroupState(previousGroup);
    }
  }

  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
    if (this.control) this.control.disabled = this.effectiveDisabled;
    this.reconcileGroupState();
  }

  formResetCallback(): void {
    const defaultChecked = this.hasAttribute("default-checked");
    if (this.checked !== defaultChecked) {
      this.checked = defaultChecked;
      return;
    }
    this.reconcileGroupState();
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

  get inheritedDisabled(): boolean {
    return this.inheritedDisabledState;
  }

  set inheritedDisabled(value: boolean) {
    this.inheritedDisabledState = value;
    if (this.control) this.control.disabled = this.effectiveDisabled;
    this.reconcileGroupState();
  }

  private get effectiveDisabled(): boolean {
    return this.disabled || this.formDisabled || this.inheritedDisabledState;
  }

  private syncForm(): void {
    const groupSelection = this.groupMembers().find(
      (radio) => radio.checked && !radio.effectiveDisabled,
    );
    const value =
      this.checked && !this.effectiveDisabled ? this.selectedValue : null;
    this.internals?.setFormValue(value);

    const missing = !this.effectiveDisabled && this.required && !groupSelection;
    this.internals?.setValidity(
      missing ? { valueMissing: true } : {},
      missing ? this.requiredMessage : "",
      this.control ?? undefined,
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
    input.disabled = this.effectiveDisabled;
    input.required = this.required;

    const error = this.error;
    const helper = this.helperText;
    if (error) input.setAttribute("aria-invalid", "true");
    const describedBy = [error && "error", helper && "helper"]
      .filter(Boolean)
      .join(" ");
    if (describedBy) input.setAttribute("aria-describedby", describedBy);

    input.addEventListener("change", () => {
      this.reflectingControlState = true;
      reflectBooleanAttribute(this, "checked", input.checked);
      this.reflectingControlState = false;
      this.reconcileGroupState();
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

  private groupMembers(name = this.name): DtRadioElement[] {
    if (!name) return [this];
    const root = this.getRootNode();
    if (!(root instanceof Document || root instanceof ShadowRoot))
      return [this];
    const form = this.internals?.form ?? this.closest("form");
    const members: DtRadioElement[] = [];
    for (const peer of root.querySelectorAll("dt-radio")) {
      if (!(peer instanceof DtRadioElement)) continue;
      const peerForm = peer.internals?.form ?? peer.closest("form");
      if (peer.name === name && peerForm === form) members.push(peer);
    }
    return members.length > 0 ? members : [this];
  }

  private reconcileGroupState(extraMembers: DtRadioElement[] = []): void {
    const members = new Set<DtRadioElement>([
      ...extraMembers,
      ...this.groupMembers(),
      this,
    ]);

    if (this.checked) {
      for (const peer of this.groupMembers()) {
        if (peer === this || !peer.checked) continue;
        peer.checked = false;
      }
    }

    for (const peer of this.groupMembers()) members.add(peer);
    for (const radio of members) radio.syncForm();
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
