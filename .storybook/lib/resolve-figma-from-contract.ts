import type { StoryContext } from "@storybook/react";
import {
  componentNameFromDocsContext,
  getContractByName,
} from "./contracts";

/**
 * Resolves the Figma design URL for a story from its component contract.
 * Contract loading and name resolution live in `./contracts` (shared with
 * the docs frame); this module only shapes the Design addon parameters.
 */
export function resolveDesignParameters(
  context: StoryContext,
): { type: "figma"; url: string } | undefined {
  const explicit = context.parameters?.design as
    | { type?: string; url?: string }
    | undefined;
  if (explicit?.url && typeof explicit.url === "string") {
    return { type: "figma", url: explicit.url };
  }

  const name = componentNameFromDocsContext(context);
  if (!name) return undefined;

  const figma = getContractByName(name)?.figma;
  if (typeof figma !== "string" || !figma.startsWith("http")) {
    return undefined;
  }

  return { type: "figma", url: figma };
}
