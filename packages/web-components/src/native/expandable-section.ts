import {
  DigitaltableteurElement,
  reflectAttribute,
  stringAttribute,
} from "./base";

const styles = `
  :host {
    display: block;
    inline-size: 100%;
    color: var(--color-text, currentcolor);
  }
  :host([hidden]) { display: none; }
  .container {
    inline-size: 100%;
  }
  .trigger {
    display: inline-flex;
    align-items: center;
    gap: var(--space-internal-8, 0.5rem);
    padding: var(--space-internal-8, 0.5rem) 0;
    border: 0;
    background: none;
    color: var(--color-muted, currentcolor);
    cursor: pointer;
    font-family: var(--font-body, var(--primary-body-font, sans-serif));
    font-size: 0.875rem;
    transition: color var(--duration-fast, 160ms)
      var(--ease-out-cubic, ease);
  }
  .trigger:hover {
    color: var(--color-primary, currentcolor);
  }
  .trigger:focus-visible {
    border-radius: var(--radius-sm, 0.25rem);
    outline: var(--focus-ring-width, 2px) solid
      var(--focus-ring-color, var(--color-primary, currentcolor));
    outline-offset: var(--focus-ring-offset, 2px);
  }
  .icon {
    display: inline-flex;
    inline-size: 16px;
    block-size: 16px;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 300;
    line-height: 1;
    transition: transform var(--duration-normal, 280ms)
      var(--ease-out-expo, ease);
  }
  .iconExpanded {
    transform: rotate(45deg);
  }
  .content {
    --expandable-focus-bleed: calc(
      var(--focus-ring-width, 2px) + var(--focus-ring-offset, 2px)
    );
    display: grid;
    grid-template-rows: 0fr;
    margin: calc(-1 * var(--expandable-focus-bleed));
    padding: var(--expandable-focus-bleed);
    overflow: hidden;
    transition: grid-template-rows var(--duration-normal, 280ms)
      var(--ease-out-cubic, ease);
  }
  .content[data-expanded="true"] {
    grid-template-rows: 1fr;
  }
  .inner {
    min-block-size: 0;
    overflow: hidden;
    padding-block-start: var(--space-layout-24, 1.5rem);
  }
  .inner::slotted(*) {
    margin-block: 0 1rem;
  }
  .inner::slotted(*:last-child) {
    margin-block-end: 0;
  }
  @media (prefers-reduced-motion: reduce) {
    .trigger,
    .icon,
    .content {
      transition: none;
    }
  }
`;

export class DtExpandableSectionElement extends DigitaltableteurElement {
  static observedAttributes = [
    "collapsed-label",
    "expanded-label",
    "default-expanded",
    "expanded",
  ];

  private internalExpanded = false;
  private defaultExpandedInitialized = false;
  private defaultExpandedDirty = false;
  private instanceId = 0;

  connectedCallback(): void {
    if (this.instanceId === 0) {
      DtExpandableSectionElement.sequence += 1;
      this.instanceId = DtExpandableSectionElement.sequence;
    }
    this.observeLightDom(() => this.render());
    if (!this.defaultExpandedInitialized) {
      this.defaultExpandedInitialized = true;
      this.internalExpanded = this.defaultExpanded;
    }
    this.render();
  }

  attributeChangedCallback(name: string): void {
    if (
      name === "default-expanded" &&
      !this.isControlled &&
      !this.defaultExpandedDirty
    ) {
      this.internalExpanded = this.defaultExpanded;
    }
    if (this.isConnected) this.render();
  }

  private static sequence = 0;

  get collapsedLabel(): string {
    return stringAttribute(this, "collapsed-label");
  }
  set collapsedLabel(value: string) {
    reflectAttribute(this, "collapsed-label", value || null);
  }

  get expandedLabel(): string {
    return stringAttribute(this, "expanded-label");
  }
  set expandedLabel(value: string) {
    reflectAttribute(this, "expanded-label", value || null);
  }

  get defaultExpanded(): boolean {
    return this.parseBooleanAttribute("default-expanded");
  }
  set defaultExpanded(value: boolean) {
    reflectAttribute(this, "default-expanded", value ? "true" : null);
  }

  get expanded(): boolean | undefined {
    if (!this.isControlled) return undefined;
    return this.parseBooleanAttribute("expanded");
  }
  set expanded(value: boolean | undefined) {
    if (value === undefined) this.removeAttribute("expanded");
    else reflectAttribute(this, "expanded", value ? "true" : "false");
    if (this.isConnected) this.render();
  }

  private get isControlled(): boolean {
    return this.hasAttribute("expanded");
  }

  private get isExpanded(): boolean {
    return this.isControlled
      ? this.parseBooleanAttribute("expanded")
      : this.internalExpanded;
  }

  private parseBooleanAttribute(name: string): boolean {
    const value = this.getAttribute(name);
    return value !== null && value !== "false";
  }

  private toggle(): void {
    const next = !this.isExpanded;
    if (!this.isControlled) {
      this.internalExpanded = next;
      this.defaultExpandedDirty = true;
    }
    this.dispatchEvent(
      new CustomEvent("expanded-change", {
        detail: { expanded: next },
        bubbles: true,
        composed: true,
      }),
    );
    if (!this.isControlled) this.render();
  }

  private render(): void {
    const expanded = this.isExpanded;
    const wasFocused =
      this.shadowRoot?.activeElement instanceof HTMLButtonElement;
    const root = this.ownerDocument.createElement("div");
    root.className = "container";
    root.setAttribute("part", "root");

    const trigger = this.ownerDocument.createElement("button");
    trigger.type = "button";
    trigger.className = "trigger";
    trigger.setAttribute("part", "trigger");
    trigger.id = this.triggerId();
    trigger.setAttribute("aria-expanded", String(expanded));
    trigger.setAttribute("aria-controls", this.panelId());
    let ignoreNextClick = false;
    trigger.addEventListener("keydown", (event) => {
      if (
        event.key !== "Enter" &&
        event.key !== " " &&
        event.key !== "Spacebar"
      ) {
        return;
      }
      event.preventDefault();
      ignoreNextClick = true;
      queueMicrotask(() => {
        ignoreNextClick = false;
      });
      this.toggle();
    });
    trigger.addEventListener("click", () => {
      if (ignoreNextClick) {
        ignoreNextClick = false;
        return;
      }
      this.toggle();
    });

    const icon = this.ownerDocument.createElement("span");
    icon.className = expanded ? "icon iconExpanded" : "icon";
    icon.setAttribute("part", "icon");
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "+";

    const label = this.ownerDocument.createElement("span");
    label.setAttribute("part", "label");
    label.textContent = expanded
      ? this.expandedLabel || this.collapsedLabel
      : this.collapsedLabel;

    trigger.append(icon, label);

    const content = this.ownerDocument.createElement("div");
    content.className = "content";
    content.setAttribute("part", "content-shell");
    content.dataset.expanded = String(expanded);
    const inner = this.ownerDocument.createElement("div");
    inner.className = "inner";
    inner.id = this.panelId();
    inner.setAttribute("part", "content");
    inner.setAttribute("role", "region");
    inner.setAttribute("aria-labelledby", this.triggerId());
    if (!expanded) {
      inner.setAttribute("aria-hidden", "true");
      inner.setAttribute("inert", "");
    }
    inner.append(this.ownerDocument.createElement("slot"));
    content.append(inner);

    root.append(trigger, content);
    this.replaceShadow(styles, root);

    if (wasFocused) {
      this.shadowRoot?.querySelector<HTMLButtonElement>("button")?.focus();
    }
  }

  private triggerId(): string {
    return `dt-expandable-trigger-${this.instanceId}`;
  }

  private panelId(): string {
    return `dt-expandable-panel-${this.instanceId}`;
  }
}
