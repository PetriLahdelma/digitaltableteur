/**
 * Canonical Figma design file for the Digitaltableteur design system.
 *
 * The DT design-system file is not published in Figma yet. Contracts use
 * `node-id=dt-<slug>` slugs so CI and Storybook stay consistent until real
 * frames and node ids exist — do not point at other projects (e.g. VertaaUX).
 */
import { componentNameToSlug } from "./figma-contract-utils.mjs";

export const FIGMA_FILE_KEY =
  process.env.FIGMA_FILE_KEY || "d8nFs8A5KcjbFr6KkwZV4H5K";
export const FIGMA_FILE_SLUG =
  process.env.FIGMA_FILE_SLUG || "Digitaltableteur-Design-System";

/** Dev-mode file URL (no component node until Figma library exists). */
export const FIGMA_TIER_FILE_URL = `https://www.figma.com/design/${FIGMA_FILE_KEY}/${FIGMA_FILE_SLUG}`;

export const FIGMA_TIER_PAGES = {
  atom: FIGMA_TIER_FILE_URL,
  molecule: FIGMA_TIER_FILE_URL,
  organism: FIGMA_TIER_FILE_URL,
  pattern: FIGMA_TIER_FILE_URL,
  template: FIGMA_TIER_FILE_URL,
};

/**
 * Honest scaffold URL for a contract (slug node-id, not a Figma API id).
 */
export function buildFigmaPlaceholderUrl(name) {
  const slug = componentNameToSlug(name);
  return `https://www.figma.com/design/${FIGMA_FILE_KEY}/${FIGMA_FILE_SLUG}?node-id=dt-${slug}`;
}

export function isRealFigmaNodeId(nodeId) {
  return typeof nodeId === "string" && /^\d+[:-]\d+$/.test(nodeId);
}

export function isDtPlaceholderNodeId(nodeId) {
  return typeof nodeId === "string" && /^dt-[a-z0-9-]+$/.test(nodeId);
}

export function tierForContract(contract) {
  const tier = contract.tier;
  if (tier === "pattern") return "organism";
  if (tier === "template") return "organism";
  return tier;
}
