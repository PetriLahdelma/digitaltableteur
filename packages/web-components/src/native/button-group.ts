import {
  DigitaltableteurElement,
  reflectAttribute,
  stringAttribute,
} from "./base";

const styles = `
  :host { display: inline-flex; }
  .group { display: inline-flex; align-items: stretch; }
  .spaced { gap: var(--space-internal-8); }
  ::slotted([data-dt-group-position]:not([data-dt-group-position="first"])) { margin-inline-start: -1px; }
`;

export class DtButtonGroupElement extends DigitaltableteurElement {
  static observedAttributes = ["aria-label", "attached"];
  private positioned = new Set<Element>();

  connectedCallback(): void {
    this.render();
    this.observeLightDom(() => this.positionChildren());
  }
  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }
  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.clearPositions();
  }
  get ariaLabel(): string {
    return stringAttribute(this, "aria-label");
  }
  set ariaLabel(value: string) {
    reflectAttribute(this, "aria-label", value || null);
  }
  get attached(): boolean {
    return (
      !this.hasAttribute("attached") ||
      this.getAttribute("attached") !== "false"
    );
  }
  set attached(value: boolean) {
    value
      ? this.removeAttribute("attached")
      : this.setAttribute("attached", "false");
  }
  private clearPositions(): void {
    for (const element of this.positioned) {
      element.removeAttribute("data-dt-group-position");
    }
    this.positioned.clear();
  }
  private positionChildren(): void {
    this.clearPositions();
    if (!this.attached) return;
    const children = [...this.children].filter(
      (child) => !child.hasAttribute("slot"),
    );
    children.forEach((child, index) => {
      const position =
        children.length === 1
          ? "only"
          : index === 0
            ? "first"
            : index === children.length - 1
              ? "last"
              : "middle";
      child.setAttribute("data-dt-group-position", position);
      this.positioned.add(child);
    });
  }
  private render(): void {
    const group = this.ownerDocument.createElement("div");
    group.className = `group ${this.attached ? "attached" : "spaced"}`;
    group.setAttribute("part", "group");
    group.setAttribute("role", "group");
    if (this.ariaLabel) group.setAttribute("aria-label", this.ariaLabel);
    const slot = this.ownerDocument.createElement("slot");
    slot.addEventListener("slotchange", () => this.positionChildren());
    group.append(slot);
    this.replaceShadow(styles, group);
    this.positionChildren();
  }
}
