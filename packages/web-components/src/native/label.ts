import {
  DigitaltableteurElement,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";
import { localizedText } from "./localization";

let generatedLabelId = 0;

const styles = `
  :host {
    display: block;
    font-family: var(--font-text, var(--primary-body-font));
  }

  :host([hidden]) { display: none; }

  .label {
    display: flex;
    align-items: center;
    gap: var(--space-internal-4, 0.25rem);
    color: var(--color-primary, currentColor);
    font-size: var(--font-size-text-m, 1rem);
    font-family: var(--font-text, var(--primary-body-font));
  }

  .disabled {
    color: var(--color-muted-light, var(--color-muted));
    cursor: not-allowed;
  }

  .required {
    color: var(--color-error, #b00020);
  }

  .srOnly {
    position: absolute;
    margin: -1px;
    padding: 0;
    inline-size: 1px;
    block-size: 1px;
    border: 0;
    clip-path: inset(50%);
    overflow: hidden;
    white-space: nowrap;
  }
`;

export class DtLabelElement extends DigitaltableteurElement {
  static observedAttributes = [
    "content",
    "for",
    "tooltip-text",
    "required",
    "required-text",
    "disabled",
    "title",
  ];
  private associatedTarget: HTMLElement | null = null;

  connectedCallback(): void {
    this.render();
    this.observeLightDom(() => this.render());
  }

  disconnectedCallback(): void {
    this.clearAccessibleAssociation();
    super.disconnectedCallback();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  get htmlFor(): string {
    return stringAttribute(this, "for");
  }

  get content(): string {
    return stringAttribute(this, "content");
  }

  set content(value: string) {
    reflectAttribute(this, "content", value || null);
  }

  set htmlFor(value: string) {
    reflectAttribute(this, "for", value || null);
  }

  get tooltipText(): string {
    return stringAttribute(this, "tooltip-text");
  }

  set tooltipText(value: string) {
    reflectAttribute(this, "tooltip-text", value || null);
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

  get tooltip(): string {
    return stringAttribute(this, "title");
  }

  set tooltip(value: string) {
    reflectAttribute(this, "title", value || null);
  }

  get requiredText(): string {
    return (
      stringAttribute(this, "required-text") ||
      localizedText(this, {
        en: "(required)",
        fi: "(pakollinen)",
        sv: "(obligatorisk)",
      })
    );
  }

  set requiredText(value: string) {
    reflectAttribute(this, "required-text", value || null);
  }

  private activateTarget(): void {
    const targetId = this.htmlFor;
    if (!targetId || this.disabled) return;

    const root = this.getRootNode();
    const target =
      root instanceof Document || root instanceof ShadowRoot
        ? root.getElementById(targetId)
        : null;
    if (!(target instanceof HTMLElement)) return;

    target.focus();

    if (
      target instanceof HTMLInputElement &&
      (target.type === "checkbox" || target.type === "radio")
    ) {
      target.click();
    }
  }

  private render(): void {
    const label = this.ownerDocument.createElement("label");
    label.className = ["label", this.disabled ? "disabled" : ""]
      .filter(Boolean)
      .join(" ");
    label.htmlFor = this.htmlFor;
    label.setAttribute("part", "label");

    const title = this.getAttribute("title") ?? this.tooltipText;
    if (title) {
      label.title = title;
    } else {
      label.removeAttribute("title");
    }

    const slot = this.ownerDocument.createElement("slot");
    slot.setAttribute("part", "content");
    slot.textContent = this.content;
    label.append(slot);
    label.addEventListener("click", () => this.activateTarget());

    if (this.required) {
      const required = this.ownerDocument.createElement("span");
      required.className = "required";
      required.setAttribute("aria-hidden", "true");
      required.setAttribute("part", "required-indicator");
      required.textContent = "*";
      label.append(required);

      const srOnly = this.ownerDocument.createElement("span");
      srOnly.className = "srOnly";
      srOnly.setAttribute("part", "required-text");
      srOnly.textContent = this.requiredText;
      label.append(srOnly);
    }

    this.replaceShadow(styles, label);
    this.syncAccessibleAssociation();
  }

  private clearAccessibleAssociation(target = this.associatedTarget): void {
    if (!(target instanceof HTMLElement) || !this.id) {
      if (target === this.associatedTarget) this.associatedTarget = null;
      return;
    }

    const labelledBy = (target.getAttribute("aria-labelledby") ?? "")
      .split(/\s+/)
      .filter(Boolean)
      .filter((value) => value !== this.id);

    if (labelledBy.length > 0) {
      target.setAttribute("aria-labelledby", labelledBy.join(" "));
    } else {
      target.removeAttribute("aria-labelledby");
    }

    if (target === this.associatedTarget) this.associatedTarget = null;
  }

  private syncAccessibleAssociation(): void {
    const targetId = this.htmlFor;
    if (!targetId) {
      this.clearAccessibleAssociation();
      return;
    }
    const root = this.getRootNode();
    const target =
      root instanceof Document || root instanceof ShadowRoot
        ? root.getElementById(targetId)
        : null;
    if (!(target instanceof HTMLElement)) {
      this.clearAccessibleAssociation();
      return;
    }
    if (!this.id) this.id = `dt-label-${++generatedLabelId}`;
    if (this.associatedTarget && this.associatedTarget !== target) {
      this.clearAccessibleAssociation();
    }
    if (target.hasAttribute("aria-label")) {
      this.clearAccessibleAssociation(target);
      return;
    }
    const labelledBy = new Set(
      (target.getAttribute("aria-labelledby") ?? "")
        .split(/\s+/)
        .filter(Boolean),
    );
    labelledBy.add(this.id);
    target.setAttribute("aria-labelledby", [...labelledBy].join(" "));
    this.associatedTarget = target;
  }
}
