import React, { useCallback, useLayoutEffect, useRef } from "react";
import { expect } from "storybook/test";
import "../../../../packages/web-components/src/register";

export type AttributeValue = string | number | boolean | null | undefined;

export const nativeStoryParameters = {
  layout: "centered",
  implementation: "web-component",
  a11y: { test: "error" },
} as const;

export function NativeElement({
  tagName,
  attributes = {},
  slot,
  children,
  elementRef,
  onClick,
}: {
  tagName: string;
  attributes?: Record<string, AttributeValue>;
  slot?: string;
  children?: React.ReactNode;
  elementRef?: React.Ref<HTMLElement>;
  onClick?: React.MouseEventHandler<HTMLElement>;
}) {
  const ref = useRef<HTMLElement>(null);
  const appliedAttributes = useRef(new Set<string>());
  const setRef = useCallback(
    (element: HTMLElement | null) => {
      ref.current = element;
      if (typeof elementRef === "function") elementRef(element);
      else if (elementRef) elementRef.current = element;
    },
    [elementRef],
  );

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    for (const name of appliedAttributes.current) element.removeAttribute(name);
    appliedAttributes.current.clear();

    for (const [name, value] of Object.entries(attributes)) {
      if (value === false || value === null || value === undefined) continue;
      element.setAttribute(name, value === true ? "" : String(value));
      appliedAttributes.current.add(name);
    }
  }, [attributes]);

  return React.createElement(
    tagName,
    { ref: setRef, slot, onClick },
    children,
  );
}

export function Row({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem",
      }}
    >
      {children}
    </div>
  );
}

export function Stack({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{ display: "grid", gap: "1rem", inlineSize: "min(34rem, 90vw)" }}
    >
      {children}
    </div>
  );
}

export function Stage({
  children,
  width,
  height,
}: {
  children: React.ReactNode;
  width?: string;
  height?: string;
}) {
  return (
    <div style={{ width, height, maxWidth: "90vw", padding: "1rem" }}>
      {children}
    </div>
  );
}

/**
 * Token-styled semantic <button> for slotted trigger slots. Menus write
 * aria-haspopup/aria-expanded onto the slotted element itself, so triggers
 * must stay real buttons (a dt-button host would strand those attributes
 * outside its shadow control); this keeps them presentable without losing
 * that wiring.
 */
export function TriggerButton({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { slot?: string }) {
  return (
    <button
      type="button"
      style={{
        font: "inherit",
        fontWeight: 600,
        padding: "0.5rem 1.25rem",
        border: "1px solid var(--color-primary, #111)",
        borderRadius: "var(--radius-md, 0.5rem)",
        background: "var(--color-white, #fff)",
        color: "var(--color-primary, #111)",
        cursor: "pointer",
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

export function assertNative(
  tagName: string,
  scope: "canvas" | "document" = "canvas",
) {
  return async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = scope === "document" ? document : canvasElement;
    const element = root.querySelector(tagName);
    expect(customElements.get(tagName)).toBeDefined();
    expect(element?.shadowRoot).toBeTruthy();
  };
}

export const exampleStory = { tags: ["example"] } as const;
export const forcedColorsStory = {
  tags: ["example"],
  globals: { forcedColors: "active" },
} as const;
