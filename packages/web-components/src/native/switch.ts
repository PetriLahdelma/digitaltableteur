import {
  DigitaltableteurElement,
  enumAttribute,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";

const SIZES = ["sm", "md", "lg"] as const;
const PLACEMENTS = ["left", "right", "top"] as const;
export type DtSwitchSize = (typeof SIZES)[number];
export type DtSwitchLabelPlacement = (typeof PLACEMENTS)[number];
const styles = `
  :host { display: block; font-family: var(--primary-body-font); }
  :host([hidden]) { display: none; }
  .wrap { display: inline-flex; align-items: center; gap: var(--space-internal-8, 0.5rem); }
  .left { inline-size: 100%; justify-content: space-between; flex-direction: row-reverse; }
  .top { flex-direction: column-reverse; align-items: flex-start; }
  button { box-sizing: border-box; position: relative; flex: none; padding: 0; border: 0; border-radius: 999px; background: var(--switch-track-off, var(--color-border-light, #767676)); cursor: pointer; transition: background var(--duration-fast, 160ms) ease; }
  button.sm { --switch-width: 2.25rem; --switch-height: 1.25rem; }
  button.md { --switch-width: 2.75rem; --switch-height: 1.5rem; }
  button.lg { --switch-width: 3.375rem; --switch-height: 1.875rem; }
  button { inline-size: var(--switch-width); block-size: var(--switch-height); }
  button[aria-checked="true"] { background: var(--switch-track-on, var(--color-primary)); }
  button:focus-visible { outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--color-primary)); outline-offset: var(--focus-ring-offset, 2px); }
  button:disabled { opacity: 0.55; cursor: not-allowed; }
  .handle { position: absolute; top: 50%; inset-inline-start: 0.15rem; translate: 0 -50%; aspect-ratio: 1; block-size: calc(var(--switch-height) - 0.3rem); border-radius: 50%; background: var(--switch-handle-bg, white); box-shadow: 0 2px 6px rgb(15 23 42 / 18%); transition: translate var(--duration-fast, 160ms) ease; }
  button[aria-checked="true"] .handle { translate: calc(var(--switch-width) - var(--switch-height)) -50%; }
  .loading .handle::after { content: ""; position: absolute; inset: 20%; border: 1px solid currentcolor; border-inline-end-color: transparent; border-radius: 50%; animation: spin 700ms linear infinite; }
  .message { margin: var(--space-internal-8, 0.5rem) 0 0; font-size: 0.875rem; color: var(--color-primary); }
  .error { color: var(--color-error-text, var(--color-error)); }
  @keyframes spin { to { rotate: 1turn; } }
  @media (prefers-reduced-motion: reduce) { button, .handle { transition: none; } .loading .handle::after { animation: none; } }
  @media (forced-colors: active) { button { forced-color-adjust: none; background: Canvas; outline: 1px solid CanvasText; } button[aria-checked="true"] { background: Highlight; } .handle { background: CanvasText; box-shadow: none; } }
`;

export class DtSwitchElement extends DigitaltableteurElement {
  static observedAttributes = [
    "checked",
    "default-checked",
    "disabled",
    "loading",
    "size",
    "label",
    "label-placement",
    "helper-text",
    "error",
  ];
  private control: HTMLButtonElement | null = null;
  private defaultCheckedInitialized = false;
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
  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
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
  get loading(): boolean {
    return this.hasAttribute("loading");
  }
  set loading(value: boolean) {
    reflectBooleanAttribute(this, "loading", value);
  }
  get size(): DtSwitchSize {
    return enumAttribute(this, "size", SIZES, "md");
  }
  set size(value: DtSwitchSize) {
    reflectAttribute(this, "size", value);
  }
  get label(): string {
    return stringAttribute(this, "label");
  }
  set label(value: string) {
    reflectAttribute(this, "label", value || null);
  }
  get labelPlacement(): DtSwitchLabelPlacement {
    return enumAttribute(this, "label-placement", PLACEMENTS, "right");
  }
  set labelPlacement(value: DtSwitchLabelPlacement) {
    reflectAttribute(this, "label-placement", value);
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

  private render(): void {
    const wasFocused =
      this.shadowRoot?.activeElement === this.control ||
      this.shadowRoot?.activeElement?.tagName === "BUTTON";
    const fragment = this.ownerDocument.createDocumentFragment();
    const wrap = this.ownerDocument.createElement("span");
    const placement = enumAttribute(
      this,
      "label-placement",
      PLACEMENTS,
      "right",
    );
    wrap.className = `wrap ${placement}`;
    const labelText = stringAttribute(this, "label");
    const label = this.ownerDocument.createElement("span");
    label.id = "label";
    label.textContent = labelText;
    const button = this.ownerDocument.createElement("button");
    button.type = "button";
    button.className = `${this.size}${this.loading ? " loading" : ""}`;
    button.setAttribute("role", "switch");
    button.setAttribute("aria-checked", String(this.checked));
    if (labelText) button.setAttribute("aria-labelledby", "label");
    if (this.loading) button.setAttribute("aria-busy", "true");
    button.disabled = this.disabled || this.loading;
    const error = stringAttribute(this, "error");
    const helper = stringAttribute(this, "helper-text");
    if (error) button.setAttribute("aria-invalid", "true");
    const describedBy = [error && "error", helper && "helper"]
      .filter(Boolean)
      .join(" ");
    if (describedBy) button.setAttribute("aria-describedby", describedBy);
    const handle = this.ownerDocument.createElement("span");
    handle.className = "handle";
    handle.setAttribute("aria-hidden", "true");
    button.append(handle);
    button.addEventListener("click", () => {
      const checked = !this.checked;
      this.checked = checked;
      this.dispatchEvent(
        new CustomEvent("checked-change", {
          detail: { checked },
          bubbles: true,
          composed: true,
        }),
      );
    });
    this.control = button;
    wrap.append(button);
    if (labelText) wrap.append(label);
    fragment.append(wrap);
    if (error) fragment.append(this.message("error", error, true));
    if (helper) fragment.append(this.message("helper", helper));
    this.replaceShadow(styles, fragment);
    if (wasFocused && !button.disabled) button.focus();
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
