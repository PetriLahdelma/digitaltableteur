/**
 * Canonical Figma design file for the Digitaltableteur design system.
 *
 * The DT design-system file is not published in Figma yet. Contracts use
 * `node-id=dt-<slug>` slugs so CI and Storybook stay consistent until real
 * frames and node ids exist — do not point at other projects (e.g. VertaaUX).
 */
import { componentNameToSlug } from "./figma-contract-utils.mjs";

/** DT-Site-stuff — site + design system library (tokens, components, routes). */
export const FIGMA_FILE_KEY =
  process.env.FIGMA_FILE_KEY || "PC2UPdYwm8qGt6ZTg0AakF";
export const FIGMA_FILE_SLUG =
  process.env.FIGMA_FILE_SLUG || "DT-Site-stuff";

/**
 * Whether the DT design-system library now exists in the canonical Figma file.
 *
 * Built + verified 2026-06: the in-scope components are real, deep-linkable
 * nodes in the file (see `FIGMA_NODE_IDS`) — though the file is not yet a
 * *published* Figma library. When true, contracts may carry real numeric
 * node-ids and the gates accept them; when false they require honest
 * `dt-<slug>` placeholders (the original "HONEST_FIGMA_DEBT" stance).
 * Override: `FIGMA_LIBRARY_EXISTS=false`.
 */
export const FIGMA_LIBRARY_EXISTS =
  (process.env.FIGMA_LIBRARY_EXISTS ?? "true") === "true";

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

/**
 * Verified Figma node ids in the canonical file (PC2UPdYwm8qGt6ZTg0AakF /
 * DT-Site-stuff). Each was resolved live against the named component/set.
 * Components without an entry fall back to the honest `dt-<slug>` placeholder
 * (e.g. Icon — the real "Icon" is the on-page Phosphor library, not a single
 * component node).
 */
export const FIGMA_NODE_IDS = {
  Button: "406:1569",
  Logo: "480:1588",
  Avatar: "369:8",
  Checkbox: "372:14",
  Radio: "372:27",
  Switch: "373:14",
  Inputs: "374:10",
  TextArea: "374:17",
  Badge: "400:1249",
  Title: "370:12",
  Text: "370:19",
  Label: "371:6",
  HelperText: "371:17",
  Link: "371:30",
  Progress: "369:15",
  Spinner: "368:16",
  Divider: "368:6",
  VisuallyHidden: "371:31",
  Card: "377:26",
  Modal: "384:13",
  AlertBanner: "394:41",
  Toast: "393:35",
  Tabs: "381:5",
  Accordion: "381:17",
  Breadcrumb: "381:31",
  Select: "383:23",
  CheckboxGroup: "383:24",
  RadioGroup: "383:36",
  FileUpload: "384:26",
  ContactForm: "470:2",
  NewsletterWaitlist: "471:21",
  ChatWidget: "473:25",
  SiteHeader: "476:2",
  SiteFooter: "477:6",
  CTASection: "502:20",
  NewsBulletin: "503:20",
};

/**
 * Figma URL for a contract: a real Dev-mode node link when the component has a
 * verified node id, otherwise the honest `dt-<slug>` placeholder.
 */
export function buildFigmaUrl(name) {
  const nodeId = FIGMA_NODE_IDS[name];
  if (FIGMA_LIBRARY_EXISTS && nodeId) {
    return `${FIGMA_TIER_FILE_URL}?node-id=${nodeId.replace(":", "-")}`;
  }
  return buildFigmaPlaceholderUrl(name);
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
