import {
  DigitaltableteurElement,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";

const styles = `
  :host { display: none !important; }
`;

/** Declarative option data consumed by a parent dt-select. */
export class DtSelectOptionElement extends DigitaltableteurElement {
  static observedAttributes = ["value", "label", "disabled", "selected"];

  connectedCallback(): void {
    this.render();
    this.observeLightDom(() => this.notifyParent());
    this.notifyParent();
  }

  attributeChangedCallback(): void {
    if (!this.isConnected) return;
    this.render();
    this.notifyParent();
  }

  get value(): string {
    return stringAttribute(this, "value");
  }

  set value(value: string) {
    reflectAttribute(this, "value", value);
  }

  get label(): string {
    return stringAttribute(this, "label", this.textContent?.trim() ?? "");
  }

  set label(value: string) {
    reflectAttribute(this, "label", value || null);
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(value: boolean) {
    reflectBooleanAttribute(this, "disabled", value);
  }

  get selected(): boolean {
    return this.hasAttribute("selected");
  }

  set selected(value: boolean) {
    reflectBooleanAttribute(this, "selected", value);
  }

  private notifyParent(): void {
    this.dispatchEvent(
      new CustomEvent("option-change", { bubbles: true, composed: true }),
    );
  }

  private render(): void {
    const slot = this.ownerDocument.createElement("slot");
    this.replaceShadow(styles, slot);
  }
}
