/// <reference types="vite/client" />
/**
 * Browser-safe component-contract lookup for the Storybook docs frame.
 *
 * Storybook preview code runs in the BROWSER, so this module must not touch
 * `node:fs`. The contract map is built at bundle time with Vite's
 * `import.meta.glob` (eager), one call per search root (no brace expansion,
 * for broad Vite-version compatibility). Paths are relative to this file:
 * `.storybook/lib/` -> repo root is two levels up.
 */
import type { StoryContext } from "@storybook/react";

export type ContractBestPractice = {
  guidance: boolean;
  description: string;
};

export type ContractAnatomyItem = {
  name: string;
  required?: boolean;
  description?: string;
};

export type ContractThemingVar = {
  name: string;
  description: string;
  default: string;
};

export type ContractA11y = {
  keyboard?: string[];
  ariaRequirements?: string[];
  reducedMotion?: boolean;
  reviewed?: boolean;
  reviewedNote?: string;
  forcedColorsVerified?: boolean;
  accessibilityTreeVerified?: boolean;
  realBrowserForcedColorsVerified?: boolean;
  screenReaderVerified?: boolean;
  screenReaderNote?: string;
  motion?: string;
  announces?: string[];
};

export type ContractProp = {
  optional?: boolean;
  type?: string;
  values?: string[];
  description?: string;
};

/**
 * Structural view of a v2 contract, limited to the fields the docs blocks
 * read. Hand-typed from Button.contract.json (the content exemplar); not
 * codegen, on purpose: blocks must degrade gracefully on partial contracts.
 */
export type DtContract = {
  name: string;
  displayName?: string;
  status: "alpha" | "beta" | "stable" | "deprecated";
  deprecatedReason?: string;
  tier?: string;
  group?: string;
  description?: string;
  figma?: string | null;
  dense?: string;
  keywords?: string[];
  usage?: {
    description?: string;
    bestPractices?: ContractBestPractice[];
    anatomy?: ContractAnatomyItem[];
  };
  playground?: { defaults?: Record<string, unknown> };
  props?: Record<string, ContractProp>;
  composesWith?: string[];
  tokens?: Partial<
    Record<
      "colors" | "spacing" | "radii" | "shadows" | "zIndex" | "typography",
      string[]
    >
  >;
  theming?: { vars?: ContractThemingVar[] };
  a11y?: ContractA11y;
};

const contractModules: Record<string, DtContract> = {
  ...import.meta.glob<DtContract>(
    "../../nextjs-app/shared/components/**/*.contract.json",
    { eager: true, import: "default" },
  ),
  ...import.meta.glob<DtContract>(
    "../../nextjs-app/shared/patterns/**/*.contract.json",
    { eager: true, import: "default" },
  ),
  ...import.meta.glob<DtContract>(
    "../../nextjs-app/shared/templates/**/*.contract.json",
    { eager: true, import: "default" },
  ),
};

const contractByName = new Map<string, DtContract>();
for (const contract of Object.values(contractModules)) {
  if (typeof contract?.name === "string" && contract.name.length > 0) {
    contractByName.set(contract.name, contract);
  }
}

export function getContractByName(name: string): DtContract | null {
  return contractByName.get(name) ?? null;
}

/**
 * Component name for a story/docs context: prefer the component function's
 * name, fall back to the last story-title segment.
 */
export function componentNameFromDocsContext(
  context: Pick<StoryContext, "component" | "title">,
): string | null {
  const fromComponent =
    typeof context.component === "function"
      ? (context.component as { displayName?: string; name?: string })
          .displayName || (context.component as { name?: string }).name
      : null;
  const title = context.title ?? "";
  const segment = title.split("/").filter(Boolean).pop() ?? null;

  // Production Storybook builds minify function names, so `fn.name` is a
  // mangled single letter unless the component sets an explicit displayName.
  // Trust the component-derived name only when it resolves to a known
  // contract; otherwise prefer the title segment when THAT resolves. Keeps
  // non-contract components on the classic-autodocs fallback either way.
  if (
    fromComponent &&
    fromComponent !== "Component" &&
    contractByName.has(fromComponent)
  ) {
    return fromComponent;
  }
  if (segment && contractByName.has(segment)) return segment;
  if (fromComponent && fromComponent !== "Component") return fromComponent;
  return segment;
}

/**
 * Story titles for components whose docs pages the frame links to (Related
 * chips, landing gallery). Seeded with the platinum set; the Phase 2 PR B
 * sidebar regroup regenerates these to the category taxonomy.
 */
export const titleByComponentName: Record<string, string> = {
  Button: "Actions/Button",
  ButtonGroup: "Actions/ButtonGroup",
  FilterChip: "Actions/FilterChip",
  IconButton: "Actions/IconButton",
  Badge: "Content/Badge",
  Avatar: "Content/Avatar",
  AvatarGroup: "Content/AvatarGroup",
  Display: "Content/Display",
  EmptyState: "Content/EmptyState",
  Icon: "Content/Icon",
  Kbd: "Content/Kbd",
  Text: "Content/Text",
  Title: "Content/Title",
  List: "Content/List",
  AlertBanner: "Feedback/AlertBanner",
  Skeleton: "Feedback/Skeleton",
  Progress: "Feedback/Progress",
  Spinner: "Feedback/Spinner",
  StatusDot: "Feedback/StatusDot",
  Link: "Navigation/Link",
  NavLink: "Navigation/NavLink",
  SkipLink: "Navigation/SkipLink",
  Label: "Forms/Label",
  HelperText: "Forms/HelperText",
  FormField: "Forms/FormField",
  TextInput: "Forms/TextInput",
  TextArea: "Forms/TextArea",
  Checkbox: "Forms/Checkbox",
  CheckboxGroup: "Forms/CheckboxGroup",
  Radio: "Forms/Radio",
  RadioGroup: "Forms/RadioGroup",
  Select: "Forms/Select",
  SelectOption: "Forms/SelectOption",
  Switch: "Forms/Switch",
  Card: "Layout/Card",
  Center: "Layout/Center",
  Container: "Layout/Container",
  Divider: "Layout/Divider",
  FlexBox: "Layout/FlexBox",
  Grid: "Layout/Grid",
  AspectRatio: "Layout/AspectRatio",
  Section: "Layout/Section",
  Spacer: "Layout/Spacer",
  Stack: "Layout/Stack",
  VisuallyHidden: "Site/VisuallyHidden",
};

/** Storybook's title -> id slug (mirrors @storybook/csf sanitize rules). */
export function storyIdFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
