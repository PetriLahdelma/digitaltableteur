import React from "react";
import type { CodeBlockFixtureNode } from "./codeBlockFixtures";

const toStyleObject = (style: unknown) => {
  if (!style || typeof style !== "string") return undefined;
  const output: Record<string, string> = {};
  style.split(";").forEach((declaration) => {
    const [property, value] = declaration.split(":");
    if (!property || !value) return;
    const trimmedProperty = property.trim();
    const trimmedValue = value.trim();
    if (!trimmedProperty || !trimmedValue) return;
    const key = trimmedProperty.startsWith("--")
      ? trimmedProperty
      : trimmedProperty.replace(/-([a-z])/g, (_, char: string) =>
          char.toUpperCase(),
        );
    output[key] = trimmedValue;
  });
  return Object.keys(output).length > 0 ? output : undefined;
};

const normalizeProps = (props: Record<string, unknown> | undefined) => {
  if (!props) return {};
  const output: Record<string, unknown> = {};
  Object.entries(props).forEach(([key, value]) => {
    if (key === "className") {
      output.className = Array.isArray(value) ? value.join(" ") : value;
      return;
    }
    if (key === "style") {
      output.style = toStyleObject(value);
      return;
    }
    if (key === "tabindex") {
      const parsed =
        typeof value === "string" ? Number.parseInt(value, 10) : value;
      output.tabIndex = Number.isFinite(parsed as number) ? parsed : 0;
      return;
    }
    output[key] = value;
  });
  return output;
};

export const renderCodeBlockFixtureNode = (
  node: CodeBlockFixtureNode,
  key = "fixture",
): React.ReactNode => {
  if (typeof node === "string") return node;
  if (!node || node.type !== "element") return null;

  const props = normalizeProps(node.properties);
  const children = (node.children ?? []).map((child, index) =>
    renderCodeBlockFixtureNode(child, `${key}-${index}`),
  );

  return React.createElement(node.tagName, { ...props, key }, ...children);
};
