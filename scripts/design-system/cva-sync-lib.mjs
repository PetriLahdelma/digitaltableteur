/**
 * Eligibility rules for syncing variant axes into contract.json.
 */
import { readFileSync, existsSync } from "node:fs";

function normalizeVariantValue(value) {
  return String(value).replace(/^["']+|["']+$/g, "");
}

export const VARIANT_PROP_NAMES = new Set([
  "variant",
  "surface",
  "size",
  "severity",
  "tone",
  "orientation",
  "align",
  "density",
  "terminals",
  "layout",
  "mode",
]);

/**
 * @param {string} tsxPath
 * @param {string | null} variantsFnName e.g. "badgeVariants"
 */
export function isCvaInvokedInSource(tsxPath, variantsFnName) {
  if (!existsSync(tsxPath)) return false;
  const source = readFileSync(tsxPath, "utf8");
  if (variantsFnName) {
    return new RegExp(`\\b${variantsFnName}\\s*\\(`).test(source);
  }
  return /(?<!export\s)\w+Variants\s*\(\s*\{/.test(source);
}

/**
 * @param {Record<string, { values: string[] }>} cvaVariants
 * @param {Record<string, { values?: string[] }>} props
 */
export function cvaAlignsWithProps(cvaVariants, props) {
  for (const [axis, def] of Object.entries(cvaVariants)) {
    const prop = props?.[axis];
    if (!prop?.values?.length) {
      if (prop?.type?.includes("number") && def.values.length) continue;
      return false;
    }
    const propSet = new Set(prop.values.map(normalizeVariantValue));
    if (!def.values.every((v) => propSet.has(normalizeVariantValue(v)))) return false;
  }
  return Object.keys(cvaVariants).length > 0;
}

/** Explicit allowlist: prop-driven styling without root CVA invocation. */
const PROP_SOURCED_AXES = {
  Button: ["variant", "surface", "severity", "size"],
  Text: ["size", "terminals"],
  Card: ["variant", "size"],
  Title: ["size", "terminals"],
  Checkbox: ["size"],
  Switch: ["size"],
  AlertBanner: ["tone"],
};

/**
 * Prop-derived variant axes allowed into contracts (propSourced: true).
 * @param {string} componentName
 * @param {object} agentBlock
 */
function propSourcedAxis(agentBlock, axis) {
  const def = agentBlock?.variants?.[axis];
  const prop = agentBlock?.props?.[axis];
  if (!def?.values?.length || !prop?.values?.length) return null;
  const propSet = new Set(prop.values.map(normalizeVariantValue));
  if (!def.values.every((v) => propSet.has(normalizeVariantValue(v)))) return null;
  return {
    values: def.values.map(normalizeVariantValue),
    default: normalizeVariantValue(def.default ?? def.values[0]),
    propSourced: true,
  };
}

export function getPropSourcedVariants(componentName, agentBlock) {
  const out = {};
  const allowed = PROP_SOURCED_AXES[componentName] ?? [];

  for (const axis of allowed) {
    const entry = propSourcedAxis(agentBlock, axis);
    if (entry) out[axis] = entry;
  }

  // Auto-detect prop-driven axes present in agent blocks (no per-component allowlist required).
  for (const axis of VARIANT_PROP_NAMES) {
    if (out[axis]) continue;
    const entry = propSourcedAxis(agentBlock, axis);
    if (entry) out[axis] = entry;
  }

  return out;
}

/**
 * @param {string} componentName
 * @param {object} agentBlock
 * @param {string} tsxPath
 * @param {string | null} variantsFnName
 */
export function getSyncableVariants(componentName, agentBlock, tsxPath, variantsFnName) {
  const props = agentBlock?.props ?? {};
  const cvaVariants = agentBlock?.cvaVariants ?? {};
  const merged = {};

  if (Object.keys(cvaVariants).length && isCvaInvokedInSource(tsxPath, variantsFnName)) {
    if (cvaAlignsWithProps(cvaVariants, props)) {
      for (const [axis, def] of Object.entries(cvaVariants)) {
        merged[axis] = {
          values: def.values.map(normalizeVariantValue),
          default: normalizeVariantValue(def.default ?? def.values[0]),
        };
      }
    }
  }

  for (const [axis, def] of Object.entries(getPropSourcedVariants(componentName, agentBlock))) {
    merged[axis] = def;
  }

  return merged;
}
