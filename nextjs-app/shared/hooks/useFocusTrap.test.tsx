import { createRef } from "react";
import { act, fireEvent, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useFocusTrap } from "./useFocusTrap";

let main: HTMLElement;
let container: HTMLDivElement;
let trigger: HTMLButtonElement;

beforeEach(() => {
  document.body.innerHTML = "";
  main = document.createElement("main");
  main.innerHTML = '<button id="bg">bg</button>';
  document.body.appendChild(main);

  trigger = document.createElement("button");
  trigger.id = "trigger";
  document.body.appendChild(trigger);
  trigger.focus();

  container = document.createElement("div");
  container.innerHTML = [
    '<button id="disabled" disabled>disabled</button>',
    '<span style="display: none"><button id="ancestor-hidden">ancestor hidden</button></span>',
    '<details><button id="closed-details">closed details</button></details>',
    '<button id="first">first</button>',
    '<button id="hidden" hidden>hidden</button>',
    '<button id="last">last</button>',
  ].join("");
  document.body.appendChild(container);
  vi.useFakeTimers();
  vi.stubGlobal(
    "requestAnimationFrame",
    (cb: FrameRequestCallback) =>
      setTimeout(() => cb(0), 0) as unknown as number,
  );
  vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("useFocusTrap", () => {
  it("marks main content inert while active and removes it on deactivate", () => {
    const ref = createRef<HTMLDivElement>();
    (ref as { current: HTMLDivElement }).current = container;
    const { rerender } = renderHook(({ active }) => useFocusTrap(ref, active), {
      initialProps: { active: true },
    });
    expect(main.hasAttribute("inert")).toBe(true);
    rerender({ active: false });
    expect(main.hasAttribute("inert")).toBe(false);
  });

  it("isolates every sibling branch between a portalled trap and the body", () => {
    const portalRoot = document.createElement("div");
    const siblingLayer = document.createElement("div");
    portalRoot.append(container, siblingLayer);
    document.body.appendChild(portalRoot);
    const ref = createRef<HTMLDivElement>();
    (ref as { current: HTMLDivElement }).current = container;

    const { rerender } = renderHook(({ active }) => useFocusTrap(ref, active), {
      initialProps: { active: true },
    });

    expect(main).toHaveAttribute("inert");
    expect(trigger).toHaveAttribute("inert");
    expect(siblingLayer).toHaveAttribute("inert");

    rerender({ active: false });
    expect(main).not.toHaveAttribute("inert");
    expect(trigger).not.toHaveAttribute("inert");
    expect(siblingLayer).not.toHaveAttribute("inert");
  });

  it("focuses the first enabled visible control and wraps in both directions", () => {
    const ref = createRef<HTMLDivElement>();
    (ref as { current: HTMLDivElement }).current = container;
    renderHook(() => useFocusTrap(ref, true));

    act(() => vi.runAllTimers());
    const first = container.querySelector<HTMLElement>("#first")!;
    const last = container.querySelector<HTMLElement>("#last")!;
    expect(document.activeElement).toBe(first);

    last.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(first);

    first.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it("pulls programmatic focus back inside the active trap", () => {
    const ref = createRef<HTMLDivElement>();
    (ref as { current: HTMLDivElement }).current = container;
    renderHook(() => useFocusTrap(ref, true));
    act(() => vi.runAllTimers());

    trigger.focus();
    expect(document.activeElement).toBe(container.querySelector("#first"));
  });

  it("focuses the container when it has no available controls", () => {
    container.innerHTML = "<button disabled>Unavailable</button>";
    const ref = createRef<HTMLDivElement>();
    (ref as { current: HTMLDivElement }).current = container;
    renderHook(() => useFocusTrap(ref, true));

    act(() => vi.runAllTimers());
    expect(document.activeElement).toBe(container);
    expect(container).toHaveAttribute("tabindex", "-1");
  });

  it("keeps the underlying trap isolated and restores it after a nested trap closes", () => {
    const outerRef = createRef<HTMLDivElement>();
    (outerRef as { current: HTMLDivElement }).current = container;
    const outer = renderHook(() => useFocusTrap(outerRef, true));
    act(() => vi.runAllTimers());
    const outerFirst = container.querySelector<HTMLElement>("#first")!;
    expect(document.activeElement).toBe(outerFirst);

    const nestedContainer = document.createElement("div");
    nestedContainer.innerHTML = '<button id="nested-first">nested</button>';
    document.body.appendChild(nestedContainer);
    const nestedRef = createRef<HTMLDivElement>();
    (nestedRef as { current: HTMLDivElement }).current = nestedContainer;
    const nested = renderHook(() => useFocusTrap(nestedRef, true));
    act(() => vi.runAllTimers());

    expect(container).toHaveAttribute("inert");
    expect(main).toHaveAttribute("inert");
    expect(document.activeElement).toBe(
      nestedContainer.querySelector("#nested-first"),
    );

    nested.unmount();
    expect(container).not.toHaveAttribute("inert");
    expect(main).toHaveAttribute("inert");
    expect(document.activeElement).toBe(outerFirst);

    outer.unmount();
    expect(main).not.toHaveAttribute("inert");
  });

  it("restores focus to the previously focused element on deactivate", () => {
    const ref = createRef<HTMLDivElement>();
    (ref as { current: HTMLDivElement }).current = container;
    const { rerender } = renderHook(({ active }) => useFocusTrap(ref, active), {
      initialProps: { active: true },
    });
    rerender({ active: false });
    expect(document.activeElement).toBe(trigger);
  });

  it("restores a valid programmatically focusable invoking element", () => {
    trigger.tabIndex = -1;
    const ref = createRef<HTMLDivElement>();
    (ref as { current: HTMLDivElement }).current = container;
    const { rerender } = renderHook(({ active }) => useFocusTrap(ref, active), {
      initialProps: { active: true },
    });

    rerender({ active: false });
    expect(document.activeElement).toBe(trigger);
  });

  it("does not restore focus to a removed invoking element", () => {
    const ref = createRef<HTMLDivElement>();
    (ref as { current: HTMLDivElement }).current = container;
    const { rerender } = renderHook(({ active }) => useFocusTrap(ref, active), {
      initialProps: { active: true },
    });
    trigger.remove();

    expect(() => rerender({ active: false })).not.toThrow();
    expect(document.activeElement).not.toBe(trigger);
  });
});
