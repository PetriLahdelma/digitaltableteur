/**
 * The four engagement offer pages (/engagements/<slug>). Copy lives in the
 * locale files under `engagementPages.<id>`; this file holds what does not
 * translate: routes, contact links, the price source and the proof order.
 * Prices reuse the pricing page keys so a package price changes in one place.
 */

export type EngagementId = "audit" | "liftoff" | "aiops" | "partnership";

export interface EngagementConfig {
  id: EngagementId;
  /** Route segment under /engagements. */
  slug: string;
  /** Translation key holding the headline price. */
  priceKey: string;
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
    priceKey: "pricingPackage3Price",
    primaryHref: "/contact?mode=book&package=ux-sprint",
    secondaryHref: "/contact?mode=message&package=ux-sprint",
    investHref: "/pricing#calculator",
    proof: ["helsinki-design-system", "dsharp-design-system", "llm-component-schema"],
  },
  {
    id: "liftoff",
    slug: "design-system-lift-off",
    priceKey: "pricingPackage1Price",
    primaryHref: "/contact?mode=book&package=design-system-lift-off",
    secondaryHref: "/contact?mode=message&package=design-system-lift-off",
    investHref: "/pricing#calculator",
    proof: ["helsinki-design-system", "sap-build-apps", "dsharp-design-system"],
  },
  {
    id: "aiops",
    slug: "ai-ready-ops",
    priceKey: "pricingPackage2Price",
    primaryHref: "/contact?mode=book&package=ai-ready-designops",
    secondaryHref: "/contact?mode=message&package=ai-ready-designops",
    investHref: "/pricing#calculator",
    proof: ["dsharp-design-system", "llm-component-schema", "project-spine"],
  },
  {
    id: "partnership",
    slug: "embedded-partnership",
    priceKey: "engagementPages.partnership.price",
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

export function getEngagementPath(engagement: EngagementConfig): string {
  return `/engagements/${engagement.slug}`;
}
