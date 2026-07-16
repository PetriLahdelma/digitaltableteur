const HTMLElementBase = (globalThis.HTMLElement ??
  class {}) as typeof HTMLElement;

export abstract class DigitaltableteurElement extends HTMLElementBase {
  private lightDomObserver?: MutationObserver;

  constructor() {
    super();
    if (typeof this.attachShadow === "function" && !this.shadowRoot) {
      this.attachShadow({ mode: "open", delegatesFocus: true });
    }
  }

  protected replaceShadow(css: string, content: Node): void {
    const root = this.shadowRoot;
    if (!root) return;

    const style = this.ownerDocument.createElement("style");
    style.textContent = css;
    root.replaceChildren(style, content);
  }

  protected observeLightDom(callback: () => void): void {
    const Observer = this.ownerDocument.defaultView?.MutationObserver;
    if (!Observer) return;

    this.lightDomObserver?.disconnect();
    this.lightDomObserver = new Observer(callback);
    this.lightDomObserver.observe(this, {
      attributes: true,
      attributeFilter: ["slot"],
      characterData: true,
      childList: true,
      subtree: true,
    });
  }

  disconnectedCallback(): void {
    this.lightDomObserver?.disconnect();
  }
}

export function stringAttribute(
  element: Element,
  name: string,
  fallback = "",
): string {
  return element.getAttribute(name) ?? fallback;
}

const SAFE_HREF_PARSE_BASE = "https://example.invalid";
const SAFE_HREF_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

/**
 * Neutralizes consumer-supplied hrefs: relative paths pass through,
 * absolute URLs must be http(s)/mailto/tel, protocol-relative and
 * javascript:-style schemes collapse to "#".
 */
export function safeHref(value: string): string {
  const href = value.trim();
  if (!href || href.startsWith("//")) return "#";
  if (
    href.startsWith("/") ||
    href.startsWith("./") ||
    href.startsWith("../") ||
    href.startsWith("?") ||
    href.startsWith("#")
  ) {
    return href;
  }
  try {
    return SAFE_HREF_PROTOCOLS.has(
      new URL(href, SAFE_HREF_PARSE_BASE).protocol,
    )
      ? href
      : "#";
  } catch {
    return "#";
  }
}

export function hasDefaultSlotContent(element: Element): boolean {
  return [...element.childNodes].some((node) => {
    if (node.nodeType === 1 && (node as Element).hasAttribute("slot")) {
      return false;
    }
    return node.nodeType !== 3 || Boolean(node.textContent?.trim());
  });
}

export function hasNamedSlot(element: Element, name: string): boolean {
  return Boolean(element.querySelector(`:scope > [slot="${name}"]`));
}

export function enumAttribute<T extends string>(
  element: Element,
  name: string,
  allowed: readonly T[],
  fallback: T,
): T {
  const value = element.getAttribute(name);
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export function numberAttribute(
  element: Element,
  name: string,
  fallback: number,
): number {
  const value = Number(element.getAttribute(name));
  return Number.isFinite(value) ? value : fallback;
}

export function reflectAttribute(
  element: Element,
  name: string,
  value: string | number | null,
): void {
  if (value === null) element.removeAttribute(name);
  else element.setAttribute(name, String(value));
}

export function reflectBooleanAttribute(
  element: Element,
  name: string,
  value: boolean,
): void {
  element.toggleAttribute(name, value);
}

export function attachFormInternals(
  element: HTMLElement,
): ElementInternals | null {
  if (typeof element.attachInternals !== "function") return null;
  const internals = element.attachInternals();
  return typeof internals.setFormValue === "function" &&
    typeof internals.setValidity === "function"
    ? internals
    : null;
}
