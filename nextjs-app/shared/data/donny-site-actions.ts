/**
 * Donny site action registry — whitelisted routes, target IDs, and selectors.
 * Server tools and the client action bus must only reference entries here.
 */

export type DonnyHighlightMode = "underline" | "spotlight" | "pulse" | "focus";

export type DonnyTargetIntent =
  | "pricing"
  | "services"
  | "proof"
  | "contact"
  | "work"
  | "location";

export type DonnyTargetId =
  | "home.services"
  | "home.services.designSystems"
  | "home.designSprints"
  | "home.componentSchema"
  | "home.work"
  | "home.clients"
  | "home.contactCta"
  | "pricing.comparison"
  | "pricing.packages"
  | "pricing.package.uxSprint"
  | "pricing.package.aiReadyDesignOps"
  | "pricing.package.designSystemLiftOff"
  | "work.index"
  | "work.project.sapBuildApps"
  | "work.project.sapBuildApps.overview"
  | "work.project.sapBuildApps.proof"
  | "work.project.helsinkiDesignSystem"
  | "work.project.helsinkiDesignSystem.overview"
  | "work.project.helsinkiDesignSystem.proof"
  | "contact.form"
  | "contact.location";

export interface DonnyTarget {
  id: DonnyTargetId;
  route: string;
  selector: string;
  label: string;
  summary: string;
  allowedModes: DonnyHighlightMode[];
  intent: DonnyTargetIntent[];
  fallbackTargetId?: DonnyTargetId;
  /** Maps to CONSULTING_PACKAGES.id when applicable */
  packageId?: string;
  /** Maps to /work/{slug} when applicable */
  projectSlug?: string;
}

const ALL_HIGHLIGHT_MODES: DonnyHighlightMode[] = [
  "underline",
  "spotlight",
  "pulse",
  "focus",
];

const SECTION_MODES: DonnyHighlightMode[] = ["spotlight", "underline", "pulse"];
const CARD_MODES: DonnyHighlightMode[] = ["underline", "spotlight", "focus"];
const FORM_MODES: DonnyHighlightMode[] = ["focus", "spotlight", "underline"];

/** Build a static data-donny-target selector (never CSS-module hashes). */
export function donnyTargetSelector(targetId: DonnyTargetId): string {
  return `[data-donny-target="${targetId}"]`;
}

function target(
  entry: Omit<DonnyTarget, "selector"> & { selector?: string },
): DonnyTarget {
  return {
    ...entry,
    selector: entry.selector ?? donnyTargetSelector(entry.id),
  };
}

export const DONNY_SITE_TARGETS: DonnyTarget[] = [
  target({
    id: "home.services",
    route: "/",
    label: "Services overview",
    summary:
      "What Digitaltableteur offers across product design, engineering, strategy, and applied AI.",
    allowedModes: SECTION_MODES,
    intent: ["services"],
    fallbackTargetId: "home.contactCta",
  }),
  target({
    id: "home.services.designSystems",
    route: "/",
    label: "Design systems service",
    summary:
      "Design systems that scale across marketing, product, and operations surfaces.",
    allowedModes: CARD_MODES,
    intent: ["services"],
    fallbackTargetId: "home.services",
  }),
  target({
    id: "home.designSprints",
    route: "/",
    label: "Design sprints",
    summary:
      "Focused sprint engagements to prototype, test, and hand off shippable work.",
    allowedModes: SECTION_MODES,
    intent: ["services"],
    fallbackTargetId: "home.services",
  }),
  target({
    id: "home.componentSchema",
    route: "/",
    label: "GenAI component schema",
    summary:
      "Component schema template for keeping AI-generated UI consistent and on-brand.",
    allowedModes: SECTION_MODES,
    intent: ["services", "proof"],
    fallbackTargetId: "home.services",
  }),
  target({
    id: "home.work",
    route: "/",
    label: "Selected work",
    summary: "Featured case studies and proof points from recent engagements.",
    allowedModes: SECTION_MODES,
    intent: ["work", "proof"],
    fallbackTargetId: "work.index",
  }),
  target({
    id: "home.clients",
    route: "/",
    label: "Selected clients",
    summary: "Organizations that trust Digitaltableteur for design and delivery.",
    allowedModes: ["spotlight", "underline"],
    intent: ["proof"],
    fallbackTargetId: "home.work",
  }),
  target({
    id: "home.contactCta",
    route: "/",
    label: "Contact call to action",
    summary: "Start a conversation about your project or engagement.",
    allowedModes: CARD_MODES,
    intent: ["contact"],
    fallbackTargetId: "contact.form",
  }),
  target({
    id: "pricing.comparison",
    route: "/pricing",
    label: "Agency comparison",
    summary:
      "How fixed-scope Digitaltableteur packages compare to traditional agency timelines and cost.",
    allowedModes: SECTION_MODES,
    intent: ["pricing"],
    fallbackTargetId: "pricing.packages",
  }),
  target({
    id: "pricing.packages",
    route: "/pricing",
    label: "Consulting packages",
    summary: "Fixed-scope packages with price ranges, duration, and deliverables.",
    allowedModes: SECTION_MODES,
    intent: ["pricing"],
    fallbackTargetId: "pricing.comparison",
  }),
  target({
    id: "pricing.package.uxSprint",
    route: "/pricing",
    label: "UX Sprint package",
    summary: "Two-week sprint: prototype, evaluation plan, and team handoff.",
    allowedModes: CARD_MODES,
    intent: ["pricing", "services"],
    packageId: "ux-sprint",
    fallbackTargetId: "pricing.packages",
  }),
  target({
    id: "pricing.package.aiReadyDesignOps",
    route: "/pricing",
    label: "AI-Ready Ops package",
    summary:
      "Three-week DesignOps setup with component governance and AI tooling hooks.",
    allowedModes: CARD_MODES,
    intent: ["pricing", "services"],
    packageId: "ai-ready-designops",
    fallbackTargetId: "pricing.packages",
  }),
  target({
    id: "pricing.package.designSystemLiftOff",
    route: "/pricing",
    label: "Design System Lift-Off package",
    summary:
      "Four-week design system foundation: audit, tokens, core components, Storybook, adoption playbook.",
    allowedModes: CARD_MODES,
    intent: ["pricing", "services"],
    packageId: "design-system-lift-off",
    fallbackTargetId: "pricing.packages",
  }),
  target({
    id: "work.index",
    route: "/work",
    label: "Work index",
    summary: "Portfolio of design systems, product, and brand engagements.",
    allowedModes: SECTION_MODES,
    intent: ["work", "proof"],
    fallbackTargetId: "home.work",
  }),
  target({
    id: "work.project.sapBuildApps",
    route: "/work/sap-build-apps",
    label: "SAP Build Apps",
    summary: "Enterprise design system for SAP Build Apps low-code platform.",
    allowedModes: SECTION_MODES,
    intent: ["work", "proof"],
    projectSlug: "sap-build-apps",
    fallbackTargetId: "work.index",
  }),
  target({
    id: "work.project.sapBuildApps.overview",
    route: "/work/sap-build-apps",
    label: "SAP Build Apps overview",
    summary: "Project context, scope, and approach for the SAP Build Apps engagement.",
    allowedModes: CARD_MODES,
    intent: ["work", "proof"],
    projectSlug: "sap-build-apps",
    fallbackTargetId: "work.project.sapBuildApps",
  }),
  target({
    id: "work.project.sapBuildApps.proof",
    route: "/work/sap-build-apps",
    label: "SAP Build Apps proof",
    summary: "Outcomes, scale, and evidence from the SAP Build Apps design system work.",
    allowedModes: CARD_MODES,
    intent: ["work", "proof"],
    projectSlug: "sap-build-apps",
    fallbackTargetId: "work.project.sapBuildApps",
  }),
  target({
    id: "work.project.helsinkiDesignSystem",
    route: "/work/helsinki-design-system",
    label: "Helsinki Design System",
    summary: "Public-sector design system with accessibility and React implementation.",
    allowedModes: SECTION_MODES,
    intent: ["work", "proof"],
    projectSlug: "helsinki-design-system",
    fallbackTargetId: "work.index",
  }),
  target({
    id: "work.project.helsinkiDesignSystem.overview",
    route: "/work/helsinki-design-system",
    label: "Helsinki Design System overview",
    summary: "Project context and approach for the Helsinki Design System engagement.",
    allowedModes: CARD_MODES,
    intent: ["work", "proof"],
    projectSlug: "helsinki-design-system",
    fallbackTargetId: "work.project.helsinkiDesignSystem",
  }),
  target({
    id: "work.project.helsinkiDesignSystem.proof",
    route: "/work/helsinki-design-system",
    label: "Helsinki Design System proof",
    summary: "Accessibility and adoption outcomes from the Helsinki Design System work.",
    allowedModes: CARD_MODES,
    intent: ["work", "proof"],
    projectSlug: "helsinki-design-system",
    fallbackTargetId: "work.project.helsinkiDesignSystem",
  }),
  target({
    id: "contact.form",
    route: "/contact",
    label: "Contact form",
    summary: "Send a project inquiry; all fields are reviewed before submission.",
    allowedModes: FORM_MODES,
    intent: ["contact"],
  }),
  target({
    id: "contact.location",
    route: "/contact",
    label: "Studio location",
    summary: "Remote-first studio operating across Helsinki and Los Angeles time zones.",
    allowedModes: ["spotlight", "underline"],
    intent: ["contact", "location"],
    fallbackTargetId: "contact.form",
  }),
];

const TARGET_BY_ID = new Map<DonnyTargetId, DonnyTarget>(
  DONNY_SITE_TARGETS.map((entry) => [entry.id, entry]),
);

const STATIC_SELECTOR_PATTERN =
  /^\[data-donny-target="[^"]+"\]$|^#[a-z][a-z0-9-]*$/i;

/** Reject external, protocol-relative, and javascript: routes. */
export function isSafeDonnyRoute(route: string): boolean {
  if (!route.startsWith("/")) return false;
  if (route.startsWith("//")) return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(route)) return false;
  if (/^\/[a-z][a-z0-9+.-]*:/i.test(route)) return false;
  return true;
}

export function isStaticDonnySelector(selector: string): boolean {
  return STATIC_SELECTOR_PATTERN.test(selector.trim());
}

export function getDonnyTarget(id: DonnyTargetId): DonnyTarget | undefined {
  return TARGET_BY_ID.get(id);
}

export function getDonnyTargetOrThrow(id: DonnyTargetId): DonnyTarget {
  const targetEntry = getDonnyTarget(id);
  if (!targetEntry) {
    throw new Error(`Unknown Donny target: ${id}`);
  }
  return targetEntry;
}

export function getDonnyTargetsByRoute(route: string): DonnyTarget[] {
  const normalized = route.split("?")[0]?.split("#")[0] ?? route;
  return DONNY_SITE_TARGETS.filter((entry) => entry.route === normalized);
}

export function getDonnyTargetsByIntent(intent: DonnyTargetIntent): DonnyTarget[] {
  return DONNY_SITE_TARGETS.filter((entry) => entry.intent.includes(intent));
}

export function isDonnyTargetId(value: string): value is DonnyTargetId {
  return TARGET_BY_ID.has(value as DonnyTargetId);
}

export function getDonnyTargetByPackageId(packageId: string): DonnyTarget | undefined {
  return DONNY_SITE_TARGETS.find((entry) => entry.packageId === packageId);
}

export function getDonnyTargetByProjectSlug(slug: string): DonnyTarget | undefined {
  return DONNY_SITE_TARGETS.find(
    (entry) =>
      entry.projectSlug === slug &&
      !entry.id.endsWith(".overview") &&
      !entry.id.endsWith(".proof"),
  );
}

const PROJECT_SLUG_TO_ROOT: Partial<Record<string, DonnyTargetId>> = {
  "sap-build-apps": "work.project.sapBuildApps",
  "helsinki-design-system": "work.project.helsinkiDesignSystem",
};

export function getDonnyProjectTargetId(
  slug: string,
  section: "root" | "overview" | "proof" = "root",
): DonnyTargetId | undefined {
  const root = PROJECT_SLUG_TO_ROOT[slug];
  if (!root) return undefined;
  if (section === "root") return root;
  if (section === "overview") return `${root}.overview` as DonnyTargetId;
  return `${root}.proof` as DonnyTargetId;
}

/** Compact registry shape for model-facing tools. */
export function getDonnyTargetCatalog(): Array<{
  id: DonnyTargetId;
  route: string;
  label: string;
  summary: string;
  allowedModes: DonnyHighlightMode[];
}> {
  return DONNY_SITE_TARGETS.map(({ id, route, label, summary, allowedModes }) => ({
    id,
    route,
    label,
    summary,
    allowedModes,
  }));
}

export function validateDonnySiteRegistry(): string[] {
  const errors: string[] = [];
  const seenIds = new Set<string>();

  for (const entry of DONNY_SITE_TARGETS) {
    if (seenIds.has(entry.id)) {
      errors.push(`Duplicate target id: ${entry.id}`);
    }
    seenIds.add(entry.id);

    if (!isSafeDonnyRoute(entry.route)) {
      errors.push(`Unsafe route for ${entry.id}: ${entry.route}`);
    }

    if (!entry.selector.trim()) {
      errors.push(`Empty selector for ${entry.id}`);
    }

    if (!isStaticDonnySelector(entry.selector)) {
      errors.push(`Non-static selector for ${entry.id}: ${entry.selector}`);
    }

    if (entry.fallbackTargetId && !getDonnyTarget(entry.fallbackTargetId)) {
      errors.push(
        `Invalid fallbackTargetId for ${entry.id}: ${entry.fallbackTargetId}`,
      );
    }

    if (entry.allowedModes.length === 0) {
      errors.push(`No allowedModes for ${entry.id}`);
    }

    for (const mode of entry.allowedModes) {
      if (!ALL_HIGHLIGHT_MODES.includes(mode)) {
        errors.push(`Invalid highlight mode on ${entry.id}: ${mode}`);
      }
    }
  }

  return errors;
}

const NAVIGATION_HASH_TARGETS: Record<string, DonnyTargetId> = {
  services: "home.services",
  "design-sprints": "home.designSprints",
  "design-sprint": "home.designSprints",
  "contact-cta": "home.contactCta",
  "contact-form": "contact.form",
  "pricing-packages-title": "pricing.packages",
  packages: "pricing.packages",
  comparison: "pricing.comparison",
};

const ROUTE_DEFAULT_TARGETS: Partial<Record<string, DonnyTargetId>> = {
  "/": "home.services",
  "/pricing": "pricing.packages",
  "/work": "work.index",
  "/contact": "contact.form",
};

function normalizeNavigationPath(route: string): string {
  return route.split("?")[0]?.split("#")[0] ?? route;
}

/** Map studio.navigateTo URLs to registry targets for client navigation. */
export function resolveDonnyTargetFromNavigationUrl(
  url: string,
): { targetId: DonnyTargetId; route: string } | null {
  const trimmed = url.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return null;
  }

  const hashIndex = trimmed.indexOf("#");
  const pathPart = hashIndex >= 0 ? trimmed.slice(0, hashIndex) : trimmed;
  const hash =
    hashIndex >= 0 ? trimmed.slice(hashIndex + 1).trim().toLowerCase() : "";
  const path = normalizeNavigationPath(pathPart || "/");

  if (hash && NAVIGATION_HASH_TARGETS[hash]) {
    return { targetId: NAVIGATION_HASH_TARGETS[hash], route: path };
  }

  const workMatch = path.match(/^\/work\/([^/]+)$/);
  if (workMatch?.[1]) {
    const targetId = getDonnyProjectTargetId(workMatch[1], "root");
    if (targetId) {
      return { targetId, route: path };
    }
  }

  const routeDefault = ROUTE_DEFAULT_TARGETS[path];
  if (routeDefault) {
    return { targetId: routeDefault, route: path };
  }

  const onRoute = getDonnyTargetsByRoute(path);
  if (onRoute.length === 1) {
    return { targetId: onRoute[0].id, route: path };
  }

  if (onRoute.length > 1) {
    const sectionTarget = onRoute.find(
      (entry) => !entry.packageId && !entry.projectSlug,
    );
    if (sectionTarget) {
      return { targetId: sectionTarget.id, route: path };
    }
  }

  return null;
}
