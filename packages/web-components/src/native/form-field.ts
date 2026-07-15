import {
  DigitaltableteurElement,
  hasNamedSlot,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";

const styles = `
  :host {
    display: block;
    font-family: var(--font-body, var(--primary-body-font));
  }

  :host([hidden]) { display: none; }

  fieldset {
    margin: 0;
    padding: 0;
    border: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-internal-16, 1rem);
  }

  legend {
    padding: 0;
    font-family: var(--font-body, var(--primary-body-font));
    font-size: var(--font-size-text-l, 1.125rem);
    font-weight: 600;
    color: var(--color-text, currentColor);
  }

  .groupDescription {
    margin: calc(var(--space-internal-8, 0.5rem) * -1) 0 0;
    font-size: var(--font-size-text-s, 0.875rem);
    color: var(--color-muted, #666);
  }

  .error {
    margin: 0;
    color: var(--color-error, #b00020);
    font-size: var(--font-size-text-s, 0.875rem);
  }

  .groupControls {
    display: flex;
    flex-direction: column;
    gap: var(--space-internal-16, 1rem);
  }
`;

export class DtFormFieldElement extends DigitaltableteurElement {
  static observedAttributes = [
    "legend",
    "group-description",
    "error",
    "required",
    "disabled",
    "class",
  ];

  private readonly disabledSnapshot = new WeakMap<HTMLElement, boolean>();

  connectedCallback(): void {
    this.render();
    this.observeLightDom(() => this.render());
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  get legend(): string {
    return stringAttribute(this, "legend");
  }

  set legend(value: string) {
    reflectAttribute(this, "legend", value || null);
  }

  get groupDescription(): string {
    return stringAttribute(this, "group-description");
  }

  set groupDescription(value: string) {
    reflectAttribute(this, "group-description", value || null);
  }

  get error(): string {
    return stringAttribute(this, "error");
  }

  set error(value: string) {
    reflectAttribute(this, "error", value || null);
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

  private render(): void {
    const fieldset = this.ownerDocument.createElement("fieldset");
    fieldset.disabled = this.disabled;
    fieldset.setAttribute("part", "fieldset");

    const legend = this.ownerDocument.createElement("legend");
    legend.className = "legend";
    legend.setAttribute("part", "legend");
    const legendSlot = this.ownerDocument.createElement("slot");
    legendSlot.name = "legend";
    legendSlot.textContent = this.legend;
    if (this.legend || hasNamedSlot(this, "legend")) legend.append(legendSlot);

    if (this.required) {
      const asterisk = this.ownerDocument.createElement("span");
      asterisk.setAttribute("aria-hidden", "true");
      asterisk.setAttribute("part", "required-indicator");
      asterisk.textContent = " *";
      legend.append(asterisk);
    }

    const describedBy: string[] = [];
    const controls = this.ownerDocument.createElement("div");
    controls.className = "groupControls";
    controls.setAttribute("part", "controls");
    const controlSlot = this.ownerDocument.createElement("slot");
    controlSlot.setAttribute("part", "controls-slot");
    controls.append(controlSlot);

    fieldset.append(legend);

    if (this.groupDescription || hasNamedSlot(this, "group-description")) {
      const description = this.ownerDocument.createElement("p");
      description.id = "group-description";
      description.className = "groupDescription";
      description.setAttribute("part", "group-description");
      const descriptionSlot = this.ownerDocument.createElement("slot");
      descriptionSlot.name = "group-description";
      descriptionSlot.textContent = this.groupDescription;
      description.append(descriptionSlot);
      fieldset.append(description);
      describedBy.push(description.id);
    }

    fieldset.append(controls);

    if (this.error || hasNamedSlot(this, "error")) {
      const error = this.ownerDocument.createElement("p");
      error.id = "error";
      error.className = "error";
      error.setAttribute("part", "error");
      error.setAttribute("role", "alert");
      const errorSlot = this.ownerDocument.createElement("slot");
      errorSlot.name = "error";
      errorSlot.textContent = this.error;
      error.append(errorSlot);
      fieldset.append(error);
      describedBy.push(error.id);
    }

    if (describedBy.length > 0) {
      fieldset.setAttribute("aria-describedby", describedBy.join(" "));
    }

    this.replaceShadow(styles, fieldset);
    this.syncDisabledControls();
  }

  private syncDisabledControls(): void {
    for (const element of this.defaultSlotControls()) {
      if (this.supportsInheritedDisabled(element)) {
        element.inheritedDisabled = this.disabled;
        continue;
      }

      if (this.disabled) {
        if (!this.disabledSnapshot.has(element)) {
          this.disabledSnapshot.set(
            element,
            element.hasAttribute("disabled") ||
              this.readDisabledProperty(element),
          );
        }
        this.writeDisabledState(element, true);
        continue;
      }

      const wasDisabled = this.disabledSnapshot.get(element);
      if (wasDisabled === undefined) continue;
      if (!wasDisabled) this.writeDisabledState(element, false);
      this.disabledSnapshot.delete(element);
    }
  }

  private defaultSlotControls(): HTMLElement[] {
    const controls: HTMLElement[] = [];
    const visit = (element: Element): void => {
      if (!(element instanceof HTMLElement)) return;
      if (element.getAttribute("slot")) return;
      if (this.canToggleDisabled(element)) controls.push(element);
      for (const child of [...element.children]) visit(child);
    };

    for (const child of [...this.children]) visit(child);
    return controls;
  }

  private canToggleDisabled(element: HTMLElement): boolean {
    return "disabled" in element || this.supportsInheritedDisabled(element);
  }

  private supportsInheritedDisabled(
    element: HTMLElement,
  ): element is HTMLElement & { inheritedDisabled: boolean } {
    return "inheritedDisabled" in element;
  }

  private readDisabledProperty(element: HTMLElement): boolean {
    const target = element as HTMLElement & { disabled?: boolean };
    return target.disabled === true;
  }

  private writeDisabledState(element: HTMLElement, disabled: boolean): void {
    const target = element as HTMLElement & { disabled?: boolean };
    if ("disabled" in target) {
      target.disabled = disabled;
    }
    if (disabled) {
      element.setAttribute("disabled", "");
    } else {
      element.removeAttribute("disabled");
    }
  }
}
