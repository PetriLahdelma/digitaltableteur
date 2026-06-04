import type { IconProps } from "@phosphor-icons/react";
import type { ComponentType } from "react";
import * as PhosphorIcons from "@phosphor-icons/react";

type PhosphorIconComponent = ComponentType<IconProps>;

const phosphorByName = PhosphorIcons as Record<string, PhosphorIconComponent | unknown>;

/** Full Phosphor set for Storybook Icon Browser only (not the curated @dt/Icon registry). */
export function resolveBrowserPhosphorIcon(
  name: string,
): PhosphorIconComponent | null {
  const candidate = phosphorByName[name];
  if (candidate == null || typeof candidate !== "object") {
    return null;
  }
  return candidate as PhosphorIconComponent;
}

export function filterBrowsableIconNames(names: readonly string[]): string[] {
  return names.filter((name) => resolveBrowserPhosphorIcon(name) !== null);
}
