import { afterEach, describe, expect, it, vi } from "vitest";
import { ACTIVE_CLASS, enhanceDocsToc } from "./docsToc";

function mount() {
  document.body.innerHTML = `
    <aside class="sbdocs-toc--custom"><nav>
      <a class="toc-link" href="#dt-docs-usage">Usage</a>
      <a class="toc-link" href="#dt-docs-props">Props</a>
    </nav></aside>
    <h2 id="dt-docs-usage">Usage</h2>
    <h2 id="dt-docs-props">Props</h2>`;
  return enhanceDocsToc(document);
}

let cleanup: () => void = () => {};
afterEach(() => cleanup());

describe("enhanceDocsToc", () => {
  it("scrolls inside the docs instead of letting the link navigate the parent window", () => {
    cleanup = mount();
    const heading = document.getElementById("dt-docs-props")!;
    heading.scrollIntoView = vi.fn();
    const link = document.querySelector<HTMLAnchorElement>('a[href="#dt-docs-props"]')!;
    const event = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
    link.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(heading.scrollIntoView).toHaveBeenCalled();
    expect(document.activeElement).toBe(heading);
    expect(link.classList.contains(ACTIVE_CLASS)).toBe(true);
    expect(link.getAttribute("aria-current")).toBe("location");
    expect(window.location.hash).toBe("#dt-docs-props");
  });

  it("leaves modified clicks alone so open-in-new-tab still works", () => {
    cleanup = mount();
    const link = document.querySelector<HTMLAnchorElement>('a[href="#dt-docs-props"]')!;
    const event = new MouseEvent("click", { bubbles: true, cancelable: true, metaKey: true });
    link.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });
});
