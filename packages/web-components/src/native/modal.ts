import {
  DigitaltableteurElement,
  hasNamedSlot,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";

const SEVERITIES = ["success", "error", "warning", "info"] as const;
const DISMISS_REASONS = ["api", "backdrop", "close-button", "escape"] as const;

export type DtModalSeverity = (typeof SEVERITIES)[number];
export type DtModalDismissReason = (typeof DISMISS_REASONS)[number];

const severityIcon: Record<DtModalSeverity, { name: string; color: string }> = {
  success: { name: "check-circle", color: "var(--color-success)" },
  error: { name: "x-circle", color: "var(--color-error)" },
  warning: { name: "warning", color: "var(--color-warning-contrast)" },
  info: { name: "info", color: "var(--color-info)" },
};

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable='true']",
].join(",");

const styles = `
  :host {
    position: fixed;
    inset: 0;
    z-index: 5000;
    display: none;
  }
  :host([open]) {
    display: block;
  }
  :host([hidden]) {
    display: none;
  }
  .overlay {
    box-sizing: border-box;
    display: flex;
    inline-size: 100%;
    block-size: 100%;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: var(--modal-overlay-bg, rgb(0 0 0 / 50%));
  }
  .panel {
    box-sizing: border-box;
    display: flex;
    inline-size: min(90vw, var(--size-width-lg, 56.25rem));
    max-inline-size: min(90vw, var(--size-width-lg, 56.25rem));
    max-block-size: 90vh;
    flex-direction: column;
    overflow: hidden;
    border-radius: var(--radius-lg);
    background: var(--main-body-background-color, var(--color-white));
    color: var(--color-primary);
    box-shadow: var(--modal-shadow, 0 4px 8px rgb(0 0 0 / 20%));
  }
  .panel.success {
    border-block-start: 4px solid var(--color-success);
    max-inline-size: min(90vw, 30rem);
  }
  .panel.error {
    border-block-start: 4px solid var(--color-error);
    max-inline-size: min(90vw, 30rem);
  }
  .panel.warning {
    border-block-start: 4px solid var(--color-warning);
    max-inline-size: min(90vw, 30rem);
  }
  .panel.info {
    border-block-start: 4px solid var(--color-info);
    max-inline-size: min(90vw, 30rem);
  }
  .header,
  .content,
  .footer {
    background: var(--main-body-background-color, var(--color-white));
  }
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-internal-12, 0.75rem);
    padding: var(--space-internal-24, 1.5rem);
  }
  .headerMain {
    display: flex;
    min-inline-size: 0;
    flex: 1;
    align-items: center;
    gap: var(--space-internal-8, 0.5rem);
  }
  .icon {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    line-height: 0;
  }
  .icon ::slotted(*),
  .icon dt-icon,
  .closeButton dt-icon {
    inline-size: 2rem;
    block-size: 2rem;
  }
  .title {
    margin: 0;
    font-family: var(--secondary-heading-font);
    font-size: var(--font-size-title-xs, 1.25rem);
    line-height: var(--line-height-tight, 1.2);
    color: var(--color-primary);
  }
  .menu {
    display: inline-flex;
    align-items: center;
    gap: var(--space-internal-8, 0.5rem);
  }
  .closeButton {
    display: inline-flex;
    inline-size: 2rem;
    block-size: 2rem;
    flex: none;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--color-primary);
    cursor: pointer;
  }
  .closeButton:focus-visible,
  .defaultAction:focus-visible,
  .panel:focus-visible {
    outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--color-primary));
    outline-offset: var(--focus-ring-offset, 2px);
  }
  .description {
    margin: 0;
    padding-inline: var(--space-internal-24, 1.5rem);
    color: inherit;
    font-family: var(--font-text);
    font-size: var(--font-size-text-s, 0.875rem);
    line-height: var(--line-height-normal, 1.5);
  }
  .content {
    display: flex;
    min-block-size: 0;
    flex-direction: column;
    gap: var(--space-internal-12, 0.75rem);
    overflow: auto;
    padding: 0 var(--space-internal-24, 1.5rem) var(--space-internal-8, 0.5rem);
    font-family: var(--font-text);
    color: inherit;
  }
  .footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-internal-8, 0.5rem);
    padding: var(--space-internal-24, 1.5rem);
  }
  .defaultAction {
    display: inline-flex;
    min-block-size: 2.5rem;
    align-items: center;
    justify-content: center;
    padding: var(--space-internal-8, 0.5rem) var(--space-internal-16, 1rem);
    border: 0;
    border-radius: var(--radius-lg);
    background: var(--color-primary);
    color: var(--color-white);
    font: inherit;
    font-family: var(--primary-body-font);
    font-size: var(--font-size-button-m, 1rem);
    cursor: pointer;
  }
  .srOnly {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }
  @media (hover: hover) and (pointer: fine) {
    .defaultAction:hover {
      filter: brightness(0.94);
    }
    .closeButton:hover {
      background: color-mix(in srgb, var(--color-primary) 10%, transparent);
    }
  }
  @media (width <= 768px) {
    .overlay {
      align-items: flex-end;
      padding: 0.75rem;
    }
    .panel,
    .panel.success,
    .panel.error,
    .panel.warning,
    .panel.info {
      inline-size: 100%;
      max-inline-size: 100%;
      max-block-size: min(90vh, 48rem);
    }
    .header {
      padding: 1.5rem 1rem 0.75rem;
    }
    .description {
      padding-inline: 1rem;
    }
    .content {
      padding-inline: 1rem;
      padding-block-end: 0.75rem;
    }
    .footer {
      padding: 0.75rem 1rem 1.5rem;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .defaultAction,
    .closeButton {
      transition: none;
    }
  }
  @media (forced-colors: active) {
    .overlay {
      background: Canvas;
    }
    .panel {
      border: 2px solid CanvasText;
      box-shadow: none;
      forced-color-adjust: none;
    }
    .panel.success,
    .panel.error,
    .panel.warning,
    .panel.info {
      border-block-start-color: Highlight;
    }
    .defaultAction {
      background: ButtonFace;
      color: ButtonText;
      border: 1px solid ButtonText;
    }
  }
`;

let modalId = 0;

function isFocusable(control: HTMLElement): boolean {
  if (control.matches(":disabled")) return false;
  if (control.getAttribute("aria-hidden") === "true") return false;
  if (control.tabIndex < 0 && !control.matches("a[href], button, input, select, textarea")) {
    return false;
  }
  return !control.hasAttribute("hidden");
}

function findFocusable(root: ParentNode): HTMLElement[] {
  const nodes = [...root.querySelectorAll<HTMLElement>(focusableSelector)];
  return nodes.filter(isFocusable);
}

export class DtModalElement extends DigitaltableteurElement {
  static observedAttributes = [
    "open",
    "default-open",
    "controlled",
    "title",
    "description",
    "severity",
    "show-close-icon",
    "close-button-label",
    "close-icon-name",
    "dismiss-on-backdrop",
    "show-footer",
  ];

  private dialogId = ++modalId;
  private lastOpen = false;
  private overlay: HTMLDivElement | null = null;
  private panel: HTMLDivElement | null = null;
  private closeButton: HTMLButtonElement | null = null;
  private defaultAction: HTMLButtonElement | null = null;
  private previousFocus: HTMLElement | null = null;
  private previousBodyOverflow: string | null = null;

  connectedCallback(): void {
    if (!this.hasAttribute("open") && this.defaultOpen && !this.controlled) {
      this.setAttribute("open", "");
    }
    this.render();
    this.syncVisibility(false);
    this.lastOpen = this.open;
    this.observeLightDom(() => {
      this.render();
      if (this.open) queueMicrotask(() => this.placeInitialFocus(false));
    });
  }

  disconnectedCallback(): void {
    this.detachOpenListeners();
    this.unlockScroll();
    super.disconnectedCallback();
  }

  attributeChangedCallback(name: string): void {
    if (!this.isConnected) return;
    this.render();
    if (name === "open") {
      this.syncVisibility(this.lastOpen);
      this.lastOpen = this.open;
    } else if (this.open) {
      queueMicrotask(() => this.placeInitialFocus(false));
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

  get title(): string {
    return stringAttribute(this, "title");
  }

  set title(value: string) {
    reflectAttribute(this, "title", value || null);
  }

  get description(): string {
    return stringAttribute(this, "description");
  }

  set description(value: string) {
    reflectAttribute(this, "description", value || null);
  }

  get severity(): DtModalSeverity | "" {
    const value = this.getAttribute("severity");
    return SEVERITIES.includes(value as DtModalSeverity)
      ? (value as DtModalSeverity)
      : "";
  }

  set severity(value: DtModalSeverity | "") {
    reflectAttribute(this, "severity", value || null);
  }

  get showCloseIcon(): boolean {
    return this.hasAttribute("show-close-icon");
  }

  set showCloseIcon(value: boolean) {
    reflectBooleanAttribute(this, "show-close-icon", value);
  }

  get closeButtonLabel(): string {
    return stringAttribute(this, "close-button-label") || "Close dialog";
  }

  set closeButtonLabel(value: string) {
    reflectAttribute(this, "close-button-label", value || null);
  }

  get closeIconName(): string {
    return stringAttribute(this, "close-icon-name") || "x";
  }

  set closeIconName(value: string) {
    reflectAttribute(this, "close-icon-name", value || null);
  }

  get dismissOnBackdrop(): boolean {
    return this.getAttribute("dismiss-on-backdrop") !== "false";
  }

  set dismissOnBackdrop(value: boolean) {
    reflectAttribute(this, "dismiss-on-backdrop", value ? "true" : "false");
  }

  get showFooter(): boolean {
    return this.getAttribute("show-footer") !== "false";
  }

  set showFooter(value: boolean) {
    reflectAttribute(this, "show-footer", value ? "true" : "false");
  }

  show(): void {
    this.setOpenState(true, "api", true);
  }

  close(reason: DtModalDismissReason = "api"): void {
    this.setOpenState(false, reason, true);
  }

  toggle(force?: boolean): void {
    this.setOpenState(force ?? !this.open, "api", true);
  }

  private titleId(): string {
    return `dt-modal-title-${this.dialogId}`;
  }

  private descriptionId(): string {
    return `dt-modal-description-${this.dialogId}`;
  }

  private setOpenState(
    value: boolean,
    reason: DtModalDismissReason,
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

  private requestDismiss(reason: Exclude<DtModalDismissReason, "api">): void {
    const approved = this.dispatchEvent(
      new CustomEvent("dismiss-request", {
        detail: { reason },
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
    if (!approved || this.controlled) return;
    this.setOpenState(false, reason, true);
  }

  private syncVisibility(previousOpen: boolean): void {
    if (this.open === previousOpen) return;
    if (this.open) this.handleOpen();
    else this.handleClose();
  }

  private handleOpen(): void {
    const active = this.ownerDocument.activeElement;
    this.previousFocus =
      active instanceof HTMLElement && !this.contains(active) ? active : null;
    this.attachOpenListeners();
    this.lockScroll();
    queueMicrotask(() => this.placeInitialFocus(true));
  }

  private handleClose(): void {
    this.detachOpenListeners();
    this.unlockScroll();
    queueMicrotask(() => {
      if (this.previousFocus?.isConnected) this.previousFocus.focus();
      this.previousFocus = null;
    });
  }

  private lockScroll(): void {
    const body = this.ownerDocument.body;
    if (this.previousBodyOverflow !== null) return;
    this.previousBodyOverflow = body.style.overflow;
    body.style.overflow = "hidden";
  }

  private unlockScroll(): void {
    if (this.previousBodyOverflow === null) return;
    this.ownerDocument.body.style.overflow = this.previousBodyOverflow;
    this.previousBodyOverflow = null;
  }

  private attachOpenListeners(): void {
    const view = this.ownerDocument.defaultView;
    view?.addEventListener("keydown", this.handleDocumentKeydown, true);
  }

  private detachOpenListeners(): void {
    const view = this.ownerDocument.defaultView;
    view?.removeEventListener("keydown", this.handleDocumentKeydown, true);
  }

  private isWithinModal(target: EventTarget | null): boolean {
    if (!target) return false;
    if (target === this) return true;
    if (target instanceof Node && this.contains(target)) return true;
    return this.shadowRoot?.contains(target as Node) ?? false;
  }

  private allFocusableElements(): HTMLElement[] {
    const elements: HTMLElement[] = [];
    if (this.closeButton) elements.push(this.closeButton);
    for (const slotName of ["menu", "", "footer"] as const) {
      const roots = [...this.children].filter(
        (child): child is HTMLElement =>
          child instanceof HTMLElement &&
          (slotName === ""
            ? !child.hasAttribute("slot")
            : child.getAttribute("slot") === slotName),
      );
      for (const root of roots) {
        if (isFocusable(root)) elements.push(root);
        elements.push(...findFocusable(root));
      }
    }
    if (
      this.defaultAction &&
      !hasNamedSlot(this, "footer") &&
      this.showFooter
    ) {
      elements.push(this.defaultAction);
    }
    const seen = new Set<HTMLElement>();
    return elements.filter((element) => {
      if (seen.has(element)) return false;
      seen.add(element);
      return isFocusable(element);
    });
  }

  private placeInitialFocus(opening: boolean): void {
    if (!this.open) return;
    const autofocus =
      this.querySelector<HTMLElement>("[autofocus]") ??
      this.shadowRoot?.querySelector<HTMLElement>("[autofocus]");
    const focusables = this.allFocusableElements();
    const target =
      autofocus ??
      focusables[0] ??
      this.panel;
    if (!target) return;
    if (opening || !this.isWithinModal(this.ownerDocument.activeElement)) {
      target.focus();
    }
  }

  private readonly handleDocumentKeydown = (event: KeyboardEvent): void => {
    if (!this.open) return;
    if (event.key === "Escape") {
      event.preventDefault();
      this.requestDismiss("escape");
      return;
    }
    if (event.key !== "Tab") return;
    const focusables = this.allFocusableElements();
    if (focusables.length === 0) {
      event.preventDefault();
      this.panel?.focus();
      return;
    }

    const active =
      (this.shadowRoot?.activeElement as HTMLElement | null) ??
      (this.ownerDocument.activeElement as HTMLElement | null);
    const index = active ? focusables.indexOf(active) : -1;
    if (event.shiftKey) {
      if (index <= 0 || !this.isWithinModal(active)) {
        event.preventDefault();
        focusables.at(-1)?.focus();
      }
      return;
    }
    if (index === -1 || index === focusables.length - 1) {
      event.preventDefault();
      focusables[0]?.focus();
    }
  };

  private render(): void {
    const container = this.ownerDocument.createElement("div");

    const overlay = this.ownerDocument.createElement("div");
    overlay.className = "overlay";
    overlay.setAttribute("part", "overlay");
    overlay.hidden = !this.open;
    overlay.addEventListener("click", (event) => {
      if (event.target !== overlay || !this.dismissOnBackdrop) return;
      this.requestDismiss("backdrop");
    });

    const panel = this.ownerDocument.createElement("div");
    panel.className = ["panel", this.severity].filter(Boolean).join(" ");
    panel.setAttribute("part", "panel");
    panel.tabIndex = -1;
    panel.setAttribute(
      "role",
      this.severity === "error" || this.severity === "warning"
        ? "alertdialog"
        : "dialog",
    );
    panel.setAttribute("aria-modal", "true");
    if (this.title) panel.setAttribute("aria-labelledby", this.titleId());
    else panel.setAttribute("aria-label", this.getAttribute("aria-label") || "Dialog");
    if (this.description) panel.setAttribute("aria-describedby", this.descriptionId());

    const hasHeader =
      Boolean(this.title) ||
      this.showCloseIcon ||
      hasNamedSlot(this, "menu") ||
      hasNamedSlot(this, "icon") ||
      Boolean(this.severity);
    if (hasHeader) {
      const header = this.ownerDocument.createElement("div");
      header.className = "header";
      header.setAttribute("part", "header");

      const main = this.ownerDocument.createElement("div");
      main.className = "headerMain";

      if (hasNamedSlot(this, "icon")) {
        const icon = this.ownerDocument.createElement("span");
        icon.className = "icon";
        const slot = this.ownerDocument.createElement("slot");
        slot.name = "icon";
        icon.append(slot);
        main.append(icon);
      } else if (this.severity) {
        const icon = this.ownerDocument.createElement("span");
        icon.className = "icon";
        const semantic = severityIcon[this.severity];
        icon.innerHTML = `<dt-icon name="${semantic.name}" size="lg" color="${semantic.color}" decorative></dt-icon>`;
        main.append(icon);
      }

      if (this.title) {
        const title = this.ownerDocument.createElement("h2");
        title.className = "title";
        title.id = this.titleId();
        title.textContent = this.title;
        main.append(title);
      }

      header.append(main);

      if (hasNamedSlot(this, "menu")) {
        const menu = this.ownerDocument.createElement("div");
        menu.className = "menu";
        const slot = this.ownerDocument.createElement("slot");
        slot.name = "menu";
        menu.append(slot);
        header.append(menu);
      }

      if (this.showCloseIcon) {
        const closeButton = this.ownerDocument.createElement("button");
        closeButton.type = "button";
        closeButton.className = "closeButton";
        closeButton.setAttribute("part", "close-button");
        closeButton.setAttribute("aria-label", this.closeButtonLabel);
        closeButton.innerHTML = `<dt-icon name="${this.closeIconName}" size="md" decorative></dt-icon>`;
        closeButton.addEventListener("click", () =>
          this.requestDismiss("close-button"),
        );
        header.append(closeButton);
        this.closeButton = closeButton;
      } else {
        this.closeButton = null;
      }

      panel.append(header);
    } else {
      this.closeButton = null;
    }

    if (this.description) {
      const description = this.ownerDocument.createElement("p");
      description.className = "description";
      description.id = this.descriptionId();
      description.textContent = this.description;
      panel.append(description);
    }

    const content = this.ownerDocument.createElement("div");
    content.className = "content";
    content.setAttribute("part", "content");
    const bodySlot = this.ownerDocument.createElement("slot");
    content.append(bodySlot);
    panel.append(content);

    this.defaultAction = null;
    if (this.showFooter) {
      const footer = this.ownerDocument.createElement("div");
      footer.className = "footer";
      footer.setAttribute("part", "footer");
      if (hasNamedSlot(this, "footer")) {
        const slot = this.ownerDocument.createElement("slot");
        slot.name = "footer";
        footer.append(slot);
      } else {
        const action = this.ownerDocument.createElement("button");
        action.type = "button";
        action.className = "defaultAction";
        action.textContent = "OK";
        action.addEventListener("click", () =>
          this.requestDismiss("close-button"),
        );
        footer.append(action);
        this.defaultAction = action;
      }
      panel.append(footer);
    }

    overlay.append(panel);
    container.append(overlay);

    this.overlay = overlay;
    this.panel = panel;
    this.replaceShadow(styles, container);
  }
}
