import React, { useLayoutEffect, useRef } from "react";
import { expect } from "storybook/test";
import "../../../../packages/web-components/src/register";

export type AttributeValue = string | number | boolean | null | undefined;

export const nativeStoryParameters = {
  layout: "centered",
  contractStatus: "stable",
  implementation: "web-component",
  wip: { disabled: true },
  a11y: { test: "error" },
} as const;

export function NativeElement({
  tagName,
  attributes = {},
  slot,
  children,
}: {
  tagName: string;
  attributes?: Record<string, AttributeValue>;
  slot?: string;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const appliedAttributes = useRef(new Set<string>());

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

  return React.createElement(tagName, { ref, slot }, children);
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

export function assertNative(tagName: string) {
  return async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const element = canvasElement.querySelector(tagName);
    expect(customElements.get(tagName)).toBeDefined();
    expect(element?.shadowRoot).toBeTruthy();
  };
}

export const exampleStory = { tags: ["example"] } as const;
export const forcedColorsStory = {
  tags: ["example"],
  globals: { forcedColors: "active" },
} as const;
