/// <reference types="vite/client" />
import type { StoryContext } from "@storybook/react";

/**
 * Resolves the Figma design URL for a story from its component contract.
 *
 * Storybook preview code runs in the BROWSER, so this module must not touch
 * `node:fs`. We build the component-name -> Figma-URL map at build time with
 * Vite's `import.meta.glob` (eager), which inlines the contract JSON into the
 * bundle. Looking up the map at runtime is then fully browser-safe.
 */

type ContractModule = {
  name?: unknown;
  figma?: unknown;
};

// Vite requires static, literal glob patterns. One call per search root (no
// brace expansion, for broad Vite-version compatibility). Paths are relative
// to this file: `.storybook/lib/` -> repo root is two levels up.
const contractModules: Record<string, ContractModule> = {
  ...import.meta.glob<ContractModule>(
    "../../nextjs-app/shared/components/**/*.contract.json",
    { eager: true, import: "default" },
  ),
  ...import.meta.glob<ContractModule>(
    "../../nextjs-app/shared/patterns/**/*.contract.json",
    { eager: true, import: "default" },
  ),
  ...import.meta.glob<ContractModule>(
    "../../nextjs-app/shared/templates/**/*.contract.json",
    { eager: true, import: "default" },
  ),
};

const figmaByName = new Map<string, string>();
for (const contract of Object.values(contractModules)) {
  const name = typeof contract?.name === "string" ? contract.name : null;
  const figma =
    typeof contract?.figma === "string" && contract.figma.startsWith("http")
      ? contract.figma
      : null;
  if (name && figma) figmaByName.set(name, figma);
}

function componentNameFromContext(context: StoryContext): string | null {
  const fromComponent =
    typeof context.component === "function"
      ? context.component.displayName || context.component.name
      : null;
  if (fromComponent && fromComponent !== "Component") return fromComponent;

  const title = context.title ?? "";
  const segment = title.split("/").filter(Boolean).pop();
  return segment ?? null;
}

/** Storybook Design addon parameters sourced from the component contract. */
export function resolveDesignParameters(
  context: StoryContext,
): { type: "figma"; url: string } | undefined {
  const explicit = context.parameters?.design as
    | { type?: string; url?: string }
    | undefined;
  if (explicit?.url && typeof explicit.url === "string") {
    return { type: "figma", url: explicit.url };
  }

  const name = componentNameFromContext(context);
  if (!name) return undefined;

  const url = figmaByName.get(name);
  if (!url) return undefined;

  return { type: "figma", url };
}
