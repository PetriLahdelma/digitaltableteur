import {
  DigitaltableteurElement,
  hasNamedSlot,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";
import { localizedText } from "./localization";

const styles = `
  :host {
    display: block;
    font-family: var(--font-text, var(--primary-body-font));
  }

  :host([hidden]) {
    display: none;
  }

  .root {
    display: grid;
    gap: var(--space-internal-4, 0.25rem);
  }

  /* Mirrors GroupLabel.module.css exactly: fixed 1rem, weight 500, primary
     color, 0.5rem gap, inherited line-height. */
  .label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
    color: var(--color-primary, currentColor);
    /* Typography matches the Label primitive exactly — one label treatment
       across single fields and group legends (unified 2026-08-05, #1409). */
    font-family: var(--font-text, sans-serif);
    font-size: 1rem;
    font-weight: 400;
    cursor: pointer;
  }

  .disabled {
    color: var(--color-muted, GrayText);
    cursor: not-allowed;
  }

  .required {
    color: var(--color-error, #b00020);
  }

  .optional {
    color: var(--color-muted, GrayText);
    font-size: var(--font-size-text-s, 0.875rem);
    font-weight: 400;
  }

  .hint {
    margin: 0;
    color: var(--color-muted, GrayText);
    font-family: var(--font-text, var(--primary-body-font));
    font-size: var(--font-size-text-s, 0.875rem);
    line-height: var(--line-height-normal, 1.5);
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

  @media (forced-colors: active) {
    .label,
    .hint,
    .required,
    .optional {
      color: CanvasText;
    }

    .disabled {
      color: GrayText;
    }
  }
`;

let generatedGroupLabelId = 0;

function isTextInputTarget(
  target: HTMLElement,
): target is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

function firstFocusableDescendant(root: ParentNode): HTMLElement | null {
  return root.querySelector<HTMLElement>(
    [
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "[href]",
      "[tabindex]:not([tabindex='-1'])",
      "[contenteditable='true']",
    ].join(", "),
  );
}

export class DtGroupLabelElement extends DigitaltableteurElement {
  static observedAttributes = [
    "content",
    "for",
    "tooltip-text",
    "required",
    "required-text",
    "optional",
    "optional-text",
    "hint",
    "disabled",
    "title",
  ];

  private associatedTarget: HTMLElement | null = null;

  private ensureId(): void {
    if (!this.id) this.id = `dt-group-label-${++generatedGroupLabelId}`;
  }

  private get hintId(): string {
    return `${this.id}-hint`;
  }

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

  set htmlFor(value: string) {
    reflectAttribute(this, "for", value || null);
  }

  get content(): string {
    return stringAttribute(this, "content");
  }

  set content(value: string) {
    reflectAttribute(this, "content", value || null);
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

  get optional(): boolean {
    return this.hasAttribute("optional");
  }

  set optional(value: boolean) {
    reflectBooleanAttribute(this, "optional", value);
  }

  get optionalText(): string {
    return (
      stringAttribute(this, "optional-text") ||
      localizedText(this, {
        en: "Optional",
        fi: "Valinnainen",
        sv: "Valfri",
      })
    );
  }

  set optionalText(value: string) {
    reflectAttribute(this, "optional-text", value || null);
  }

  get hint(): string {
    return stringAttribute(this, "hint");
  }

  set hint(value: string) {
    reflectAttribute(this, "hint", value || null);
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

  private resolveTarget(): HTMLElement | null {
    const targetId = this.htmlFor;
    if (!targetId) return null;

    const root = this.getRootNode();
    return root instanceof Document || root instanceof ShadowRoot
      ? root.getElementById(targetId)
      : null;
  }

  private activateTarget(): void {
    if (this.disabled) return;

    const target = this.resolveTarget();
    if (!(target instanceof HTMLElement)) return;

    if (target instanceof HTMLInputElement) {
      target.focus();
      if (target.type === "checkbox" || target.type === "radio") {
        target.click();
      }
      return;
    }

    if (isTextInputTarget(target) || target instanceof HTMLButtonElement) {
      target.focus();
      return;
    }

    if (typeof target.focus === "function" && target.tabIndex >= 0) {
      target.focus();
      return;
    }

    firstFocusableDescendant(target)?.focus();
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

    const describedBy = (target.getAttribute("aria-describedby") ?? "")
      .split(/\s+/)
      .filter(Boolean)
      .filter((value) => value !== this.hintId);

    if (describedBy.length > 0) {
      target.setAttribute("aria-describedby", describedBy.join(" "));
    } else {
      target.removeAttribute("aria-describedby");
    }

    if (target === this.associatedTarget) this.associatedTarget = null;
  }

  private syncAccessibleAssociation(): void {
    const target = this.resolveTarget();
    if (!(target instanceof HTMLElement)) {
      this.clearAccessibleAssociation();
      return;
    }

    this.ensureId();
    if (this.associatedTarget && this.associatedTarget !== target) {
      this.clearAccessibleAssociation();
    }
    if (target.hasAttribute("aria-label")) {
      const labelledBy = (target.getAttribute("aria-labelledby") ?? "")
        .split(/\s+/)
        .filter(Boolean)
        .filter((value) => value !== this.id);
      if (labelledBy.length > 0) {
        target.setAttribute("aria-labelledby", labelledBy.join(" "));
      } else {
        target.removeAttribute("aria-labelledby");
      }
    } else {
      const labelledBy = new Set(
        (target.getAttribute("aria-labelledby") ?? "")
          .split(/\s+/)
          .filter(Boolean),
      );
      labelledBy.add(this.id);
      target.setAttribute("aria-labelledby", [...labelledBy].join(" "));
    }

    const describedBy = new Set(
      (target.getAttribute("aria-describedby") ?? "")
        .split(/\s+/)
        .filter(Boolean)
        .filter((value) => value !== this.hintId),
    );
    if (this.hint || hasNamedSlot(this, "hint")) describedBy.add(this.hintId);
    if (describedBy.size > 0) {
      target.setAttribute("aria-describedby", [...describedBy].join(" "));
    } else {
      target.removeAttribute("aria-describedby");
    }
    this.associatedTarget = target;
  }

  private render(): void {
    this.ensureId();
    const root = this.ownerDocument.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");

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

    const content = this.ownerDocument.createElement("slot");
    content.setAttribute("part", "content");
    content.textContent = this.content;
    label.append(content);

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
    } else if (this.optional) {
      const optional = this.ownerDocument.createElement("span");
      optional.className = "optional";
      optional.setAttribute("part", "optional-indicator");
      optional.textContent = this.optionalText;
      label.append(optional);
    }

    label.addEventListener("click", () => this.activateTarget());
    root.append(label);

    if (this.hint || hasNamedSlot(this, "hint")) {
      const hint = this.ownerDocument.createElement("p");
      hint.id = this.hintId;
      hint.className = "hint";
      hint.setAttribute("part", "hint");
      const hintSlot = this.ownerDocument.createElement("slot");
      hintSlot.name = "hint";
      hintSlot.textContent = this.hint;
      hint.append(hintSlot);
      root.append(hint);
    }

    this.replaceShadow(styles, root);
    this.syncAccessibleAssociation();
  }
}
