import {
  DigitaltableteurElement,
  reflectAttribute,
  reflectBooleanAttribute,
} from "./base";

const styles = `
  :host { display: block; position: fixed; inset-inline: 0; inset-block-start: 0; z-index: var(--z-index-sticky, 50); block-size: var(--space-internal-4); background: var(--color-border-light); opacity: 0; transition: opacity var(--duration-normal) var(--ease-out-expo); }
  :host([data-visible="true"]) { opacity: 1; }
  .bar { block-size: 100%; background: var(--color-primary); transform-origin: inline-start; transition: transform 100ms var(--ease-out-expo); }
  .percentage { position: absolute; inset-block-start: 100%; inset-inline-end: var(--space-internal-8); margin-block-start: var(--space-internal-4); padding: var(--space-internal-2) var(--space-internal-8); border-radius: var(--radius-sm); background: var(--main-body-background-color); color: var(--secondary-text-color); font-family: var(--font-text); font-size: var(--font-size-text-s); }
  @media (prefers-reduced-motion: reduce) { :host, .bar { transition: none; } }
  @media (forced-colors: active) { :host { background: Canvas; border-block-end: 1px solid CanvasText; } .bar { background: Highlight; } }
`;

export class DtReadingProgressElement extends DigitaltableteurElement {
  static observedAttributes = [
    "target-selector",
    "show-percentage",
    "aria-label",
  ];
  private explicitTarget: HTMLElement | null = null;
  private progress = 0;
  private resizeObserver?: ResizeObserver;
  private readonly update = () => this.calculate();

  connectedCallback(): void {
    this.bind();
    queueMicrotask(() => this.bind());
  }
  attributeChangedCallback(): void {
    if (this.isConnected) this.bind();
  }
  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.ownerDocument.defaultView?.removeEventListener("scroll", this.update);
    this.ownerDocument.defaultView?.removeEventListener("resize", this.update);
    this.resizeObserver?.disconnect();
  }
  get target(): HTMLElement | null {
    return this.explicitTarget;
  }
  set target(value: HTMLElement | null) {
    this.explicitTarget = value;
    if (this.isConnected) this.bind();
  }
  get targetSelector(): string {
    return this.getAttribute("target-selector") || "";
  }
  set targetSelector(value: string) {
    reflectAttribute(this, "target-selector", value || null);
  }
  get showPercentage(): boolean {
    return this.hasAttribute("show-percentage");
  }
  set showPercentage(value: boolean) {
    reflectBooleanAttribute(this, "show-percentage", value);
  }

  private resolveTarget(): HTMLElement | null {
    if (this.explicitTarget) return this.explicitTarget;
    if (!this.targetSelector) return null;
    try {
      return this.ownerDocument.querySelector<HTMLElement>(this.targetSelector);
    } catch {
      return null;
    }
  }
  private bind(): void {
    const view = this.ownerDocument.defaultView;
    view?.removeEventListener("scroll", this.update);
    view?.removeEventListener("resize", this.update);
    this.resizeObserver?.disconnect();
    view?.addEventListener("scroll", this.update, { passive: true });
    view?.addEventListener("resize", this.update, { passive: true });
    const target = this.resolveTarget();
    const Observer = view?.ResizeObserver;
    if (target && Observer) {
      this.resizeObserver = new Observer(this.update);
      this.resizeObserver.observe(target);
    }
    this.calculate();
  }
  private calculate(): void {
    const target = this.resolveTarget();
    const view = this.ownerDocument.defaultView;
    if (!target || !view) {
      this.progress = 0;
      this.toggleAttribute("data-visible", false);
      this.render();
      return;
    }
    const rect = target.getBoundingClientRect();
    const scrolledInto = Math.max(0, view.innerHeight - rect.top);
    this.progress = Math.min(
      100,
      Math.max(0, rect.height > 0 ? (scrolledInto / rect.height) * 100 : 0),
    );
    this.setAttribute(
      "data-visible",
      String(rect.top < view.innerHeight * 0.8),
    );
    this.render();
  }
  private render(): void {
    this.setAttribute("role", "progressbar");
    this.setAttribute("aria-valuemin", "0");
    this.setAttribute("aria-valuemax", "100");
    this.setAttribute("aria-valuenow", String(Math.round(this.progress)));
    if (!this.hasAttribute("aria-label"))
      this.setAttribute("aria-label", "Reading progress");
    const root = this.ownerDocument.createElement("div");
    const bar = this.ownerDocument.createElement("div");
    bar.className = "bar";
    bar.setAttribute("part", "bar");
    bar.style.transform = `scaleX(${this.progress / 100})`;
    root.append(bar);
    if (this.showPercentage && this.progress > 0) {
      const percentage = this.ownerDocument.createElement("span");
      percentage.className = "percentage";
      percentage.setAttribute("part", "percentage");
      percentage.textContent = `${Math.round(this.progress)}%`;
      root.append(percentage);
    }
    this.replaceShadow(styles, root);
  }
}
