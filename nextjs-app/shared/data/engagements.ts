/**
 * The four engagement offer pages (/engagements/<slug>) and the contact
 * form's package field. Copy lives in the locale files under
 * `engagementPages.<id>`; this file holds what does not translate: routes,
 * contact links, the name, price and duration sources, the project types a
 * package implies and the proof order. Names, prices and durations reuse the
 * pricing page keys so a package changes in one place.
 */

export type EngagementId = "audit" | "liftoff" | "aiops" | "partnership";

export interface EngagementConfig {
  id: EngagementId;
  /** Route segment under /engagements. */
  slug: string;
  /** Package id used in contact links (`?package=`) and the contact form. */
  packageId: string;
  /** Translation key holding the package name. */
  nameKey: string;
  /** Translation key holding the headline price. */
  priceKey: string;
  /** Translation key holding the duration. */
  durationKey: string;
  /** Contact form project types the package pre-selects (still editable). */
  projectTypes: readonly string[];
  /** Primary CTA target (booking). */
  primaryHref: string;
  /** Secondary CTA target. */
  secondaryHref: string;
  /** Target of the investment card link. */
  investHref: string;
  /** Published work slugs (/work/<slug>), in display order. */
  proof: readonly string[];
}

export const ENGAGEMENTS: readonly EngagementConfig[] = [
  {
    id: "audit",
    slug: "design-system-audit",
    // The audit is booked as the UX Sprint package (content/pseo/catalog.json).
    packageId: "ux-sprint",
    nameKey: "pricingPackage3Title",
    priceKey: "pricingPackage3Price",
    durationKey: "pricingPackage3Duration",
    projectTypes: ["ds-audit"],
    primaryHref: "/contact?mode=book&package=ux-sprint",
    secondaryHref: "/contact?mode=message&package=ux-sprint",
    investHref: "/pricing#calculator",
    proof: ["helsinki-design-system", "dsharp-design-system", "llm-component-schema"],
  },
  {
    id: "liftoff",
    slug: "design-system-lift-off",
    packageId: "design-system-lift-off",
    nameKey: "pricingPackage1Title",
    priceKey: "pricingPackage1Price",
    durationKey: "pricingPackage1Duration",
    projectTypes: ["component-library", "tokens-theming"],
    primaryHref: "/contact?mode=book&package=design-system-lift-off",
    secondaryHref: "/contact?mode=message&package=design-system-lift-off",
    investHref: "/pricing#calculator",
    proof: ["helsinki-design-system", "sap-build-apps", "dsharp-design-system"],
  },
  {
    id: "aiops",
    slug: "ai-ready-ops",
    packageId: "ai-ready-designops",
    nameKey: "pricingPackage2Title",
    priceKey: "pricingPackage2Price",
    durationKey: "pricingPackage2Duration",
    projectTypes: ["ai-designops"],
    primaryHref: "/contact?mode=book&package=ai-ready-designops",
    secondaryHref: "/contact?mode=message&package=ai-ready-designops",
    investHref: "/pricing#calculator",
    proof: ["dsharp-design-system", "llm-component-schema", "project-spine"],
  },
  {
    id: "partnership",
    slug: "embedded-partnership",
    packageId: "embedded-partnership",
    nameKey: "engagementPages.partnership.eyebrow",
    priceKey: "engagementPages.partnership.price",
    durationKey: "engagementPages.partnership.timeline",
    projectTypes: [],
    primaryHref: "/contact?mode=book",
    // The calculator's partnership tier: 6 months at 4 days a week.
    secondaryHref: "/pricing?duration=6m&days=4#calculator",
    investHref: "/pricing?duration=6m&days=4#calculator",
    proof: ["sap-build-apps", "dsharp-design-system", "helsinki-design-system"],
  },
];

export function getEngagementBySlug(slug: string): EngagementConfig | undefined {
  return ENGAGEMENTS.find((engagement) => engagement.slug === slug);
}

export function getEngagementByPackageId(
  packageId: string | null | undefined,
): EngagementConfig | undefined {
  if (!packageId) return undefined;
  return ENGAGEMENTS.find((engagement) => engagement.packageId === packageId);
}

export function getEngagementPath(engagement: EngagementConfig): string {
  return `/engagements/${engagement.slug}`;
}
