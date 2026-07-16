import {
  DigitaltableteurElement,
  enumAttribute,
  reflectAttribute,
  reflectBooleanAttribute,
  stringAttribute,
} from "./base";

const TONES = ["neutral", "success", "error", "warning", "info"] as const;
const SIZES = ["sm", "md", "lg"] as const;
const POSITIONS = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
] as const;

export type DtToastTone = (typeof TONES)[number];
export type DtToastSize = (typeof SIZES)[number];
export type DtToastPosition = (typeof POSITIONS)[number];

const toneIcons: Partial<Record<DtToastTone, string>> = {
  success: "check-circle",
  error: "x-circle",
  warning: "warning",
  info: "info",
};

const styles = `
  :host { display: block; font-family: var(--font-text, var(--primary-body-font, sans-serif)); }
  :host([hidden]) { display: none; }
  .toast {
    display: flex;
    position: fixed;
    inset-block-end: var(--space-layout-24, 1.5rem);
    inset-inline-start: 50%;
    z-index: 1000;
    max-inline-size: min(28rem, calc(100vw - 3rem));
    padding: var(--space-internal-12, 0.75rem)
      var(--space-internal-16, 1rem);
    align-items: center;
    gap: var(--space-internal-8, 0.5rem);
    border-radius: var(--radius-md, 0.5rem);
    background: var(--color-primary, #1b1b1b);
    box-shadow: 0 2px 6px rgb(0 0 0 / 20%);
    color: var(--color-white, #fff);
    transform: translateX(-50%);
    transition:
      opacity var(--duration-fast, 160ms) var(--ease-out-cubic, ease-out),
      translate var(--duration-fast, 160ms) var(--ease-out-cubic, ease-out);
  }
  .hidden {
    pointer-events: none;
    opacity: 0;
    translate: 0 0.5rem;
  }
  .sm {
    padding: var(--space-internal-8, 0.5rem)
      var(--space-internal-12, 0.75rem);
    font-size: var(--font-size-button-s, 0.875rem);
  }
  .md { font-size: var(--font-size-button-m, 1rem); }
  .lg {
    padding: var(--space-internal-16, 1rem)
      var(--space-internal-24, 1.5rem);
    font-size: var(--font-size-button-l, 1.125rem);
  }
  .success { background: var(--color-success, #08783e); }
  .error { background: var(--color-error, #b42318); }
  .warning {
    background: var(--color-warning, #f4c430);
    color: var(--color-warning-text, #171717);
  }
  .info { background: var(--color-info, #1267a5); }
  .top-left {
    inset-block: var(--space-layout-24, 1.5rem) auto;
    inset-inline: var(--space-layout-24, 1.5rem) auto;
    transform: none;
  }
  .top-center {
    inset-block: var(--space-layout-24, 1.5rem) auto;
  }
  .top-right {
    inset-block: var(--space-layout-24, 1.5rem) auto;
    inset-inline: auto var(--space-layout-24, 1.5rem);
    transform: none;
  }
  .bottom-left {
    inset-inline: var(--space-layout-24, 1.5rem) auto;
    transform: none;
  }
  .bottom-right {
    inset-inline: auto var(--space-layout-24, 1.5rem);
    transform: none;
  }
  .inline {
    position: static;
    inset: auto;
    z-index: auto;
    transform: none;
  }
  .icon {
    display: inline-flex;
    inline-size: 1.25rem;
    block-size: 1.25rem;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    color: currentcolor;
  }
  .icon dt-icon { inline-size: 1.25rem; block-size: 1.25rem; }
  .message {
    min-inline-size: 0;
    flex: 1 1 auto;
    align-self: center;
    line-height: 1.4;
    overflow-wrap: anywhere;
  }
  @media (prefers-reduced-motion: reduce) {
    .toast { transition: none; }
    .hidden { translate: none; }
  }
  @media (forced-colors: active) {
    .toast {
      border: 1px solid CanvasText;
      background: Canvas;
      box-shadow: none;
      color: CanvasText;
      forced-color-adjust: none;
    }
  }
`;

export class DtToastElement extends DigitaltableteurElement {
  static observedAttributes = [
    "open",
    "tone",
    "position",
    "size",
    "message",
    "duration",
    "inline",
  ];

  private timer: ReturnType<typeof setTimeout> | null = null;
  private timerDuration: number | null = null;
  private closeDispatched = false;

  connectedCallback(): void {
    this.render();
    this.syncTimer();
  }

  disconnectedCallback(): void {
    this.clearTimer();
    this.closeDispatched = false;
    super.disconnectedCallback();
  }

  attributeChangedCallback(name: string, oldValue: string | null): void {
    if (name === "open" && !this.open) this.closeDispatched = false;
    if (name === "duration" && oldValue !== this.getAttribute("duration")) {
      this.closeDispatched = false;
    }
    if (this.isConnected) {
      this.render();
      this.syncTimer();
    }
  }

  get open(): boolean {
    return this.hasAttribute("open");
  }

  set open(value: boolean) {
    reflectBooleanAttribute(this, "open", value);
  }

  get tone(): DtToastTone {
    return enumAttribute(this, "tone", TONES, "neutral");
  }

  set tone(value: DtToastTone) {
    reflectAttribute(this, "tone", value);
  }

  get position(): DtToastPosition {
    return enumAttribute(this, "position", POSITIONS, "bottom-center");
  }

  set position(value: DtToastPosition) {
    reflectAttribute(this, "position", value);
  }

  get size(): DtToastSize {
    return enumAttribute(this, "size", SIZES, "md");
  }

  set size(value: DtToastSize) {
    reflectAttribute(this, "size", value);
  }

  get message(): string {
    return stringAttribute(this, "message");
  }

  set message(value: string) {
    reflectAttribute(this, "message", value || null);
  }

  get duration(): number {
    if (!this.hasAttribute("duration")) return 3000;
    const value = Number(this.getAttribute("duration"));
    return Number.isFinite(value) ? Math.max(0, value) : 3000;
  }

  set duration(value: number) {
    reflectAttribute(this, "duration", Number.isFinite(value) ? value : 3000);
  }

  get inline(): boolean {
    return this.hasAttribute("inline");
  }

  set inline(value: boolean) {
    reflectBooleanAttribute(this, "inline", value);
  }

  private clearTimer(): void {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = null;
    this.timerDuration = null;
  }

  private syncTimer(): void {
    if (!this.open || this.closeDispatched) {
      this.clearTimer();
      return;
    }
    if (this.timer !== null && this.timerDuration === this.duration) return;
    this.clearTimer();
    this.timerDuration = this.duration;
    this.timer = setTimeout(() => {
      this.timer = null;
      this.timerDuration = null;
      this.closeDispatched = true;
      this.dispatchEvent(
        new CustomEvent("close", {
          detail: { message: this.message },
          bubbles: true,
          composed: true,
        }),
      );
    }, this.duration);
  }

  private render(): void {
    const assertive = this.tone === "error" || this.tone === "warning";
    const toast = this.ownerDocument.createElement("div");
    toast.className = [
      "toast",
      this.size,
      this.tone === "neutral" ? "" : this.tone,
      this.inline ? "inline" : this.position,
      this.open ? "" : "hidden",
    ]
      .filter(Boolean)
      .join(" ");
    toast.setAttribute("part", `toast toast-${this.tone}`);
    toast.setAttribute("role", assertive ? "alert" : "status");
    toast.setAttribute("aria-live", assertive ? "assertive" : "polite");
    toast.setAttribute("aria-atomic", "true");

    const iconName = toneIcons[this.tone];
    if (iconName) {
      const iconWrapper = this.ownerDocument.createElement("span");
      iconWrapper.className = "icon";
      iconWrapper.setAttribute("part", "icon");
      iconWrapper.setAttribute("aria-hidden", "true");
      const icon = this.ownerDocument.createElement("dt-icon");
      icon.setAttribute("name", iconName);
      icon.setAttribute("size", "md");
      icon.setAttribute("decorative", "");
      iconWrapper.append(icon);
      toast.append(iconWrapper);
    }

    const message = this.ownerDocument.createElement("span");
    message.className = "message";
    message.setAttribute("part", "message");
    message.textContent = this.open ? this.message : "";
    toast.append(message);
    this.replaceShadow(styles, toast);
  }
}
