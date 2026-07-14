const HTMLElementBase = (globalThis.HTMLElement ?? class {}) as typeof HTMLElement;

export abstract class DigitaltableteurElement extends HTMLElementBase {
  constructor() {
    super();
    if (typeof this.attachShadow === "function" && !this.shadowRoot) {
      this.attachShadow({ mode: "open" });
    }
  }

  protected replaceShadow(css: string, content: Node): void {
    const root = this.shadowRoot;
    if (!root) return;

    const style = this.ownerDocument.createElement("style");
    style.textContent = css;
    root.replaceChildren(style, content);
  }
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
