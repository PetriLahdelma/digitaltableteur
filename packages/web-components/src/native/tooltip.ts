import {
  DigitaltableteurElement,
  enumAttribute,
  hasNamedSlot,
  numberAttribute,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";

const PLACEMENTS = ["top", "right", "bottom", "left"] as const;

export type DtTooltipPlacement = (typeof PLACEMENTS)[number];

const styles = `
  :host {
    display: inline-block;
    vertical-align: middle;
  }
  :host([hidden]) {
    display: none;
  }
  .trigger {
    display: inline-flex;
    inline-size: fit-content;
    block-size: fit-content;
  }
  .content {
    position: fixed;
    z-index: 6000;
    max-inline-size: 20rem;
    padding: var(--space-internal-8, 0.5rem) var(--space-internal-12, 0.75rem);
    border-radius: var(--radius-md);
    background: var(--color-primary);
    color: var(--main-body-background-color, var(--color-white));
    box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
    font-family: var(--font-text);
    font-size: var(--font-size-text-s, 0.875rem);
    line-height: var(--line-height-normal, 1.5);
    pointer-events: none;
    transform-origin: center;
  }
  .content[data-state="open"] {
    animation: tooltipIn var(--duration-fast, 150ms) var(--ease-out-cubic, ease-out);
  }
  .content[data-state="closed"] {
    animation: tooltipOut var(--duration-instant, 75ms) var(--ease-out-cubic, ease-out);
  }
  .arrow {
    position: absolute;
    inline-size: 0.75rem;
    block-size: 0.75rem;
    background: inherit;
    transform: rotate(45deg);
  }
  .content[data-placement="top"] .arrow {
    inset-block-end: -0.35rem;
    inset-inline-start: calc(50% - 0.375rem);
  }
  .content[data-placement="bottom"] .arrow {
    inset-block-start: -0.35rem;
    inset-inline-start: calc(50% - 0.375rem);
  }
  .content[data-placement="left"] .arrow {
    inset-inline-end: -0.35rem;
    inset-block-start: calc(50% - 0.375rem);
  }
  .content[data-placement="right"] .arrow {
    inset-inline-start: -0.35rem;
    inset-block-start: calc(50% - 0.375rem);
  }
  @keyframes tooltipIn {
    from {
      opacity: 0;
      transform: scale(0.96);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  @keyframes tooltipOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .content[data-state="open"],
    .content[data-state="closed"] {
      animation: none;
    }
  }
  @media (forced-colors: active) {
    .content {
      border: 1px solid CanvasText;
      background: Canvas;
      color: CanvasText;
      forced-color-adjust: none;
      box-shadow: none;
    }
  }
`;

let tooltipId = 0;

export class DtTooltipElement extends DigitaltableteurElement {
  static observedAttributes = [
    "open",
    "default-open",
    "controlled",
    "placement",
    "delay",
    "offset",
    "content",
    "disabled",
  ];

  private instanceId = ++tooltipId;
  private triggerElement: HTMLElement | null = null;
  private descriptionElement: HTMLSpanElement | null = null;
  private contentElement: HTMLDivElement | null = null;
  private openTimer: number | null = null;
  private hoverActive = false;
  private focusActive = false;
  private managedDescriptionBy: string | null = null;
  private lastOpen = false;

  connectedCallback(): void {
    if (!this.hasAttribute("open") && this.defaultOpen && !this.controlled) {
      this.setAttribute("open", "");
    }
    this.ensureDescriptionElement();
    this.render();
    this.syncTriggerElement();
    this.syncOpen(this.lastOpen);
    this.lastOpen = this.open;
    this.observeLightDom(() => {
      this.ensureDescriptionElement();
      this.render();
      this.syncTriggerElement();
      if (this.open) this.positionTooltip();
      this.syncAccessibleDescription();
    });
  }

  disconnectedCallback(): void {
    this.cancelOpenTimer();
    this.detachTriggerListeners(this.triggerElement);
    this.restoreTriggerDescription();
    this.descriptionElement?.remove();
    const view = this.ownerDocument.defaultView;
    view?.removeEventListener("resize", this.handleViewportChange);
    view?.removeEventListener("scroll", this.handleViewportChange, true);
    view?.removeEventListener("keydown", this.handleDocumentKeydown, true);
    super.disconnectedCallback();
  }

  attributeChangedCallback(name: string): void {
    if (!this.isConnected) return;
    this.ensureDescriptionElement();
    this.render();
    this.syncTriggerElement();
    if (name === "open") {
      this.syncOpen(this.lastOpen);
      this.lastOpen = this.open;
    } else if (this.open) {
      this.positionTooltip();
      this.syncAccessibleDescription();
    }
  }

  get open(): boolean {
    return this.hasAttribute("open");
  }

  set open(value: boolean) {
    this.setOpenState(value, "api", true);
  }

  get defaultOpen(): boolean {
    return this.hasAttribute("default-open");
  }

  set defaultOpen(value: boolean) {
    reflectBooleanAttribute(this, "default-open", value);
  }

  get controlled(): boolean {
    return this.hasAttribute("controlled");
  }

  set controlled(value: boolean) {
    reflectBooleanAttribute(this, "controlled", value);
  }

  get placement(): DtTooltipPlacement {
    return enumAttribute(this, "placement", PLACEMENTS, "top");
  }

  set placement(value: DtTooltipPlacement) {
    reflectAttribute(this, "placement", value);
  }

  get delay(): number {
    return numberAttribute(this, "delay", 200);
  }

  set delay(value: number) {
    reflectAttribute(this, "delay", Math.max(0, value));
  }

  get offset(): number {
    return numberAttribute(this, "offset", 4);
  }

  set offset(value: number) {
    reflectAttribute(this, "offset", Math.max(0, value));
  }

  get content(): string {
    return stringAttribute(this, "content");
  }

  set content(value: string) {
    reflectAttribute(this, "content", value || null);
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(value: boolean) {
    reflectBooleanAttribute(this, "disabled", value);
  }

  show(): void {
    this.setOpenState(true, "api", true);
  }

  hide(): void {
    this.setOpenState(false, "api", true);
  }

  toggle(force?: boolean): void {
    this.setOpenState(force ?? !this.open, "api", true);
  }

  private tooltipId(): string {
    return `dt-tooltip-${this.instanceId}`;
  }

  private tooltipText(): string {
    if (this.content) return this.content;
    const slotContent = [...this.children].find(
      (child) => child instanceof HTMLElement && child.slot === "content",
    );
    return slotContent?.textContent?.trim() ?? "";
  }

  private triggerCandidate(): HTMLElement | null {
    const slot = this.shadowRoot?.querySelector<HTMLSlotElement>(
      "slot:not([name])",
    );
    const assigned = slot?.assignedElements({ flatten: true }) ?? [];
    return (assigned.find(
      (element: Element) =>
        element instanceof HTMLElement && element.slot !== "content",
    ) as HTMLElement | undefined) ?? null;
  }

  private ensureDescriptionElement(): void {
    if (!this.descriptionElement) {
      const description = this.ownerDocument.createElement("span");
      description.id = this.tooltipId();
      description.slot = "__dt-tooltip-description";
      description.hidden = true;
      description.setAttribute("aria-hidden", "true");
      this.descriptionElement = description;
      this.append(description);
    }
    this.descriptionElement.textContent = this.tooltipText();
  }

  private setOpenState(
    value: boolean,
    reason: string,
    emit: boolean,
  ): void {
    if (this.open === value) return;
    this.toggleAttribute("open", value);
    if (emit) {
      this.dispatchEvent(
        new CustomEvent("open-change", {
          detail: { open: value, reason },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  private requestOpen(reason: "hover" | "focus"): void {
    if (this.disabled) return;
    if (this.controlled) {
      this.dispatchEvent(
        new CustomEvent("open-request", {
          detail: { reason },
          bubbles: true,
          composed: true,
        }),
      );
      return;
    }
    this.setOpenState(true, reason, true);
  }

  private requestDismiss(reason: "blur" | "escape" | "hover-leave"): void {
    if (this.controlled) {
      this.dispatchEvent(
        new CustomEvent("dismiss-request", {
          detail: { reason },
          bubbles: true,
          composed: true,
        }),
      );
      return;
    }
    this.setOpenState(false, reason, true);
  }

  private cancelOpenTimer(): void {
    const view = this.ownerDocument.defaultView;
    if (this.openTimer === null || !view) return;
    view.clearTimeout(this.openTimer);
    this.openTimer = null;
  }

  private scheduleOpen(reason: "hover" | "focus"): void {
    this.cancelOpenTimer();
    if (this.open || this.disabled) return;
    const view = this.ownerDocument.defaultView;
    if (!view) return;
    this.openTimer = view.setTimeout(() => {
      this.openTimer = null;
      this.requestOpen(reason);
    }, this.delay);
  }

  private syncOpen(previousOpen: boolean): void {
    if (this.open === previousOpen) return;
    const view = this.ownerDocument.defaultView;
    if (this.open) {
      this.contentElement?.removeAttribute("hidden");
      this.contentElement?.setAttribute("data-state", "open");
      this.syncAccessibleDescription();
      queueMicrotask(() => this.positionTooltip());
      view?.addEventListener("resize", this.handleViewportChange);
      view?.addEventListener("scroll", this.handleViewportChange, true);
      view?.addEventListener("keydown", this.handleDocumentKeydown, true);
    } else {
      this.contentElement?.setAttribute("data-state", "closed");
      this.contentElement?.setAttribute("hidden", "");
      this.syncAccessibleDescription();
      view?.removeEventListener("resize", this.handleViewportChange);
      view?.removeEventListener("scroll", this.handleViewportChange, true);
      view?.removeEventListener("keydown", this.handleDocumentKeydown, true);
    }
  }

  private restoreTriggerDescription(): void {
    if (!this.triggerElement) return;
    if (this.managedDescriptionBy === null) {
      this.triggerElement.removeAttribute("aria-describedby");
    } else {
      this.triggerElement.setAttribute("aria-describedby", this.managedDescriptionBy);
    }
    this.managedDescriptionBy = null;
  }

  private syncAccessibleDescription(): void {
    if (!this.triggerElement || !this.descriptionElement) return;
    const text = this.tooltipText();
    this.descriptionElement.textContent = text;
    this.restoreTriggerDescription();
    if (!text) return;

    const current = this.triggerElement.getAttribute("aria-describedby");
    this.managedDescriptionBy = current;
    const ids = new Set((current ?? "").split(/\s+/).filter(Boolean));
    ids.add(this.descriptionElement.id);
    this.triggerElement.setAttribute(
      "aria-describedby",
      [...ids].join(" "),
    );
  }

  private attachTriggerListeners(trigger: HTMLElement | null): void {
    if (!trigger) return;
    trigger.addEventListener("pointerenter", this.handlePointerEnter);
    trigger.addEventListener("pointerleave", this.handlePointerLeave);
    trigger.addEventListener("focus", this.handleFocusIn);
    trigger.addEventListener("blur", this.handleFocusOut);
  }

  private detachTriggerListeners(trigger: HTMLElement | null): void {
    if (!trigger) return;
    trigger.removeEventListener("pointerenter", this.handlePointerEnter);
    trigger.removeEventListener("pointerleave", this.handlePointerLeave);
    trigger.removeEventListener("focus", this.handleFocusIn);
    trigger.removeEventListener("blur", this.handleFocusOut);
  }

  private syncTriggerElement(): void {
    const nextTrigger = this.triggerCandidate();
    if (nextTrigger === this.triggerElement) return;
    this.restoreTriggerDescription();
    this.detachTriggerListeners(this.triggerElement);
    this.triggerElement = nextTrigger;
    this.attachTriggerListeners(this.triggerElement);
    this.syncAccessibleDescription();
  }

  private positionTooltip(): void {
    if (!this.open || !this.triggerElement || !this.contentElement) return;

    const triggerRect = this.triggerElement.getBoundingClientRect();
    const tooltipRect = this.contentElement.getBoundingClientRect();
    const spacing = this.offset;
    const viewportWidth =
      this.ownerDocument.documentElement?.clientWidth ?? triggerRect.right + tooltipRect.width;
    const viewportHeight =
      this.ownerDocument.documentElement?.clientHeight ?? triggerRect.bottom + tooltipRect.height;

    const preferred = this.placement;
    const candidates = [
      preferred,
      ...PLACEMENTS.filter((placement) => placement !== preferred),
    ];
    let resolved: DtTooltipPlacement = preferred;

    for (const candidate of candidates) {
      if (
        (candidate === "top" &&
          triggerRect.top >= tooltipRect.height + spacing) ||
        (candidate === "bottom" &&
          viewportHeight - triggerRect.bottom >= tooltipRect.height + spacing) ||
        (candidate === "left" &&
          triggerRect.left >= tooltipRect.width + spacing) ||
        (candidate === "right" &&
          viewportWidth - triggerRect.right >= tooltipRect.width + spacing)
      ) {
        resolved = candidate;
        break;
      }
    }

    let top = 0;
    let left = 0;
    if (resolved === "top" || resolved === "bottom") {
      left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
      left = Math.min(
        Math.max(8, left),
        Math.max(8, viewportWidth - tooltipRect.width - 8),
      );
      top =
        resolved === "top"
          ? triggerRect.top - tooltipRect.height - spacing
          : triggerRect.bottom + spacing;
    } else {
      top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
      top = Math.min(
        Math.max(8, top),
        Math.max(8, viewportHeight - tooltipRect.height - 8),
      );
      left =
        resolved === "left"
          ? triggerRect.left - tooltipRect.width - spacing
          : triggerRect.right + spacing;
    }

    this.contentElement.style.top = `${Math.max(8, top)}px`;
    this.contentElement.style.left = `${Math.max(8, left)}px`;
    this.contentElement.setAttribute("data-placement", resolved);
  }

  private readonly handlePointerEnter = (): void => {
    this.hoverActive = true;
    this.scheduleOpen("hover");
  };

  private readonly handlePointerLeave = (): void => {
    this.hoverActive = false;
    this.cancelOpenTimer();
    if (!this.focusActive) this.requestDismiss("hover-leave");
  };

  private readonly handleFocusIn = (): void => {
    this.focusActive = true;
    this.scheduleOpen("focus");
  };

  private readonly handleFocusOut = (event: FocusEvent): void => {
    const next = event.relatedTarget;
    if (next instanceof Node && this.triggerElement?.contains(next)) return;
    this.focusActive = false;
    this.cancelOpenTimer();
    if (!this.hoverActive) this.requestDismiss("blur");
  };

  private readonly handleDocumentKeydown = (event: KeyboardEvent): void => {
    if (!this.open || event.key !== "Escape") return;
    event.preventDefault();
    this.requestDismiss("escape");
  };

  private readonly handleViewportChange = (): void => {
    this.positionTooltip();
  };

  private render(): void {
    const root = this.ownerDocument.createElement("div");

    const trigger = this.ownerDocument.createElement("span");
    trigger.className = "trigger";
    const triggerSlot = this.ownerDocument.createElement("slot");
    trigger.append(triggerSlot);
    root.append(trigger);

    const content = this.ownerDocument.createElement("div");
    content.className = "content";
    content.id = `${this.tooltipId()}-bubble`;
    content.setAttribute("part", "content");
    content.setAttribute("role", "tooltip");
    content.setAttribute("data-placement", this.placement);
    content.setAttribute("data-state", this.open ? "open" : "closed");
    content.hidden = !this.open;

    const contentSlot = this.ownerDocument.createElement("slot");
    contentSlot.name = "content";
    if (!hasNamedSlot(this, "content")) {
      contentSlot.textContent = this.content;
    }
    content.append(contentSlot);

    const arrow = this.ownerDocument.createElement("span");
    arrow.className = "arrow";
    arrow.setAttribute("aria-hidden", "true");
    content.append(arrow);

    root.append(content);
    this.contentElement = content;
    this.replaceShadow(styles, root);
  }
}
