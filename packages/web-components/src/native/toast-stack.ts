import {
  DigitaltableteurElement,
  enumAttribute,
  reflectAttribute,
} from "./base";
import {
  DtToastElement,
  type DtToastPosition,
  type DtToastSize,
  type DtToastTone,
} from "./toast";

const POSITIONS = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
] as const satisfies readonly DtToastPosition[];
const TONES = ["neutral", "success", "error", "warning", "info"] as const;
const SIZES = ["sm", "md", "lg"] as const;

export type DtToastStackPosition = (typeof POSITIONS)[number];
export type DtToastStackTone = DtToastTone;
export type DtToastStackSize = DtToastSize;

export interface DtToastStackItem {
  id: string;
  message: string;
  tone?: DtToastStackTone;
  duration?: number;
  size?: DtToastStackSize;
}

const styles = `
  :host {
    display: block;
    position: fixed;
    inset-inline: 0;
    inset-block-end: var(--space-layout-24, 1.5rem);
    z-index: 1000;
    margin-inline: auto;
    inline-size: fit-content;
    pointer-events: none;
    font-family: var(--font-text, var(--primary-body-font, sans-serif));
  }
  :host([hidden]) { display: none; }
  :host([position="top-left"]) {
    inset: var(--space-layout-24, 1.5rem) auto auto
      var(--space-layout-24, 1.5rem);
    margin: 0;
    inline-size: auto;
  }
  :host([position="top-center"]) {
    inset: var(--space-layout-24, 1.5rem) 0 auto;
    margin-inline: auto;
    inline-size: fit-content;
  }
  :host([position="top-right"]) {
    inset: var(--space-layout-24, 1.5rem)
      var(--space-layout-24, 1.5rem) auto auto;
    margin: 0;
    inline-size: auto;
  }
  :host([position="bottom-left"]) {
    inset: auto auto var(--space-layout-24, 1.5rem)
      var(--space-layout-24, 1.5rem);
    margin: 0;
    inline-size: auto;
  }
  :host([position="bottom-right"]) {
    inset: auto var(--space-layout-24, 1.5rem)
      var(--space-layout-24, 1.5rem) auto;
    margin: 0;
    inline-size: auto;
  }
  .stack {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-internal-8, 0.5rem);
  }
  :host([position="top-left"]) .stack,
  :host([position="top-center"]) .stack,
  :host([position="top-right"]) .stack {
    flex-direction: column-reverse;
  }
  :host([position="top-left"]) .stack,
  :host([position="bottom-left"]) .stack { align-items: flex-start; }
  :host([position="top-right"]) .stack,
  :host([position="bottom-right"]) .stack { align-items: flex-end; }
  dt-toast { pointer-events: auto; }
`;

function cloneItem(item: DtToastStackItem): DtToastStackItem {
  return { ...item };
}

function isTone(value: unknown): value is DtToastStackTone {
  return TONES.includes(value as DtToastStackTone);
}

function isSize(value: unknown): value is DtToastStackSize {
  return SIZES.includes(value as DtToastStackSize);
}

export class DtToastStackElement extends DigitaltableteurElement {
  static observedAttributes = ["toasts", "position", "max"];

  private assignedToasts: DtToastStackItem[] | null = null;
  private stack: HTMLDivElement | null = null;
  private readonly renderedToasts = new Map<string, DtToastElement>();

  connectedCallback(): void {
    this.ensureRoot();
    this.reconcile();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
  }

  attributeChangedCallback(name: string): void {
    if (name === "toasts") this.assignedToasts = null;
    if (this.isConnected && name !== "position") this.reconcile();
  }

  get toasts(): DtToastStackItem[] {
    return (this.assignedToasts ?? this.parseToasts()).map(cloneItem);
  }

  set toasts(value: DtToastStackItem[]) {
    this.assignedToasts = value.map(cloneItem);
    if (this.isConnected) this.reconcile();
  }

  get position(): DtToastStackPosition {
    return enumAttribute(this, "position", POSITIONS, "bottom-center");
  }

  set position(value: DtToastStackPosition) {
    reflectAttribute(this, "position", value);
  }

  get max(): number {
    if (!this.hasAttribute("max")) return 5;
    const value = Number(this.getAttribute("max"));
    return Number.isFinite(value) ? Math.max(1, Math.trunc(value)) : 5;
  }

  set max(value: number) {
    reflectAttribute(this, "max", Number.isFinite(value) ? value : 5);
  }

  private ensureRoot(): void {
    if (this.stack?.isConnected) return;
    const stack = this.ownerDocument.createElement("div");
    stack.className = "stack";
    stack.setAttribute("part", "stack");
    this.stack = stack;
    this.replaceShadow(styles, stack);
  }

  private parseToasts(): DtToastStackItem[] {
    const source = this.getAttribute("toasts");
    if (!source) return [];
    try {
      const parsed: unknown = JSON.parse(source);
      if (!Array.isArray(parsed)) return [];
      return parsed.flatMap((entry) => {
        if (!entry || typeof entry !== "object") return [];
        const item = entry as Record<string, unknown>;
        if (typeof item.id !== "string" || typeof item.message !== "string") {
          return [];
        }
        const duration =
          typeof item.duration === "number" && Number.isFinite(item.duration)
            ? item.duration
            : undefined;
        return [
          {
            id: item.id,
            message: item.message,
            tone: isTone(item.tone) ? item.tone : undefined,
            duration,
            size: isSize(item.size) ? item.size : undefined,
          },
        ];
      });
    } catch {
      return [];
    }
  }

  private createToast(item: DtToastStackItem): DtToastElement {
    const toast = this.ownerDocument.createElement(
      "dt-toast",
    ) as DtToastElement;
    toast.dataset.toastId = item.id;
    toast.addEventListener("close", (event) => {
      event.stopPropagation();
      const current = this.toasts.find((candidate) => candidate.id === item.id);
      this.dispatchEvent(
        new CustomEvent("dismiss", {
          detail: {
            id: item.id,
            toast: cloneItem(current ?? item),
          },
          bubbles: true,
          composed: true,
        }),
      );
    });
    return toast;
  }

  private configureToast(
    element: DtToastElement,
    item: DtToastStackItem,
  ): void {
    element.message = item.message;
    element.tone = item.tone ?? "neutral";
    element.size = item.size ?? "md";
    element.duration = item.duration ?? 3000;
    element.inline = true;
    element.open = true;
  }

  private reconcile(): void {
    this.ensureRoot();
    if (!this.stack) return;
    const visibleToasts = this.toasts.slice(-this.max);
    const visibleIds = new Set(visibleToasts.map((toast) => toast.id));

    for (const [id, element] of this.renderedToasts) {
      if (visibleIds.has(id)) continue;
      element.remove();
      this.renderedToasts.delete(id);
    }

    visibleToasts.forEach((item, index) => {
      let element = this.renderedToasts.get(item.id);
      if (!element) {
        element = this.createToast(item);
        this.renderedToasts.set(item.id, element);
      }
      this.configureToast(element, item);
      const currentAtIndex = this.stack?.children.item(index) ?? null;
      if (currentAtIndex !== element) {
        this.stack?.insertBefore(element, currentAtIndex);
      }
    });
  }
}
