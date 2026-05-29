import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { StoryContext } from "@storybook/react";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const SEARCH_ROOTS = [
  join(REPO_ROOT, "nextjs-app/shared/components"),
  join(REPO_ROOT, "nextjs-app/shared/patterns"),
  join(REPO_ROOT, "nextjs-app/shared/templates"),
];

const cache = new Map<string, string | null>();

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

function findContractPath(name: string): string | null {
  for (const base of SEARCH_ROOTS) {
    const direct = join(base, name, `${name}.contract.json`);
    if (existsSync(direct)) return direct;

    const walk = (dir: string): string | null => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
          const nested = walk(full);
          if (nested) return nested;
          continue;
        }
        if (entry.name === `${name}.contract.json`) return full;
      }
      return null;
    };

    if (existsSync(base)) {
      const nested = walk(base);
      if (nested) return nested;
    }
  }
  return null;
}

function readFigmaUrl(name: string): string | null {
  if (cache.has(name)) return cache.get(name) ?? null;

  const contractPath = findContractPath(name);
  if (contractPath) {
    try {
      const contract = JSON.parse(readFileSync(contractPath, "utf8")) as {
        figma?: unknown;
      };
      const figma =
        typeof contract.figma === "string" && contract.figma.startsWith("http")
          ? contract.figma
          : null;
      cache.set(name, figma);
      return figma;
    } catch {
      cache.set(name, null);
      return null;
    }
  }

  cache.set(name, null);
  return null;
}

/** Storybook Design addon parameters sourced from the component contract. */
export function resolveDesignParameters(context: StoryContext): {
  type: "figma";
  url: string;
} | undefined {
  const explicit = context.parameters?.design as
    | { type?: string; url?: string }
    | undefined;
  if (explicit?.url && typeof explicit.url === "string") {
    return {
      type: "figma",
      url: explicit.url,
    };
  }

  const name = componentNameFromContext(context);
  if (!name) return undefined;

  const url = readFigmaUrl(name);
  if (!url) return undefined;

  return { type: "figma", url };
}
