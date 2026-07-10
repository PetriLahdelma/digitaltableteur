import { createRef } from "react";
import { renderHook } from "@testing-library/react";
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
  container.innerHTML = '<button id="first">first</button>';
  document.body.appendChild(container);
  vi.useFakeTimers();
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) =>
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

  it("restores focus to the previously focused element on deactivate", () => {
    const ref = createRef<HTMLDivElement>();
    (ref as { current: HTMLDivElement }).current = container;
    const { rerender } = renderHook(({ active }) => useFocusTrap(ref, active), {
      initialProps: { active: true },
    });
    rerender({ active: false });
    expect(document.activeElement).toBe(trigger);
  });
});
