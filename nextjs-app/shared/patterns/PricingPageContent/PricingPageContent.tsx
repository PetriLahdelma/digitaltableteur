"use client";

import type { ReactNode } from "react";
import { useTranslate } from "../../lib/translation";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";
import { cn } from "../../lib/cn";
import { Button, Icon, Text, Title } from "@digitaltableteur/react";
import { PricingCalculator } from "../PricingCalculator";
import { IconButton } from "../../components/IconButton";
import { VisuallyHidden } from "../../components/VisuallyHidden";
import { ReliablePartnerBadge } from "../../components/ReliablePartnerBadge";
import { ProcurementFaq } from "../ProcurementFaq";
import { TextReveal } from "../../components/animations/TextReveal";
import { FadeIn } from "../../components/animations/FadeIn";
import { NEXT_AVAILABLE_START } from "../../data/availability";
import styles from "./PricingPageContent.module.css";

type ComparisonRow = {
  usKey: string;
  themKey: string;
  usDefault: string;
  themDefault: string;
};

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    usKey: "pricingCompareUs1",
    themKey: "pricingCompareThem1",
    usDefault: "A senior practitioner directly on the work",
    themDefault: "A multi-role team",
  },
  {
    usKey: "pricingCompareUs2",
    themKey: "pricingCompareThem2",
    usDefault: "Low coordination overhead",
    themDefault: "More coordination capacity",
  },
  {
    usKey: "pricingCompareUs3",
    themKey: "pricingCompareThem3",
    usDefault: "A flexible specialist network",
    themDefault: "Dedicated staffing",
  },
  {
    usKey: "pricingCompareUs4",
    themKey: "pricingCompareThem4",
    usDefault: "Best for focused, systemic problems",
    themDefault: "Best for large parallel programs",
  },
];

type PackageItem = {
  titleKey: string;
  titleDefault: string;
  priceKey: string;
  priceDefault: string;
  durationKey: string;
  durationDefault: string;
  descriptionKey: string;
  descriptionDefault: string;
  ctaKey: string;
  ctaDefault: string;
  contactPackageId: string;
  donnyTarget: string;
  /** Offer page for this package (/engagements/<slug>). */
  detailsHref?: string;
  /** Overrides the default booking link, e.g. a quote request. */
  ctaHref?: string;
};

const PACKAGES: PackageItem[] = [
  {
    titleKey: "pricingPackageWorkshopTitle",
    titleDefault: "Design System Workshop",
    priceKey: "pricingPackageWorkshopPrice",
    priceDefault: "Quoted per workshop",
    durationKey: "pricingPackageWorkshopDuration",
    durationDefault: "2 days, with prep and analysis",
    descriptionKey: "pricingPackageWorkshopDescription",
    descriptionDefault:
      "Prep work, two facilitated days and a written analysis. The price depends on group size, travel and remote or on-site delivery.",
    ctaKey: "pricingPackageCtaWorkshop",
    ctaDefault: "Ask for a workshop quote",
    contactPackageId: "workshop",
    ctaHref: "/contact?mode=message&package=workshop",
    detailsHref: "/engagements/design-system-workshop",
    donnyTarget: "pricing.package.workshop",
  },
  {
    titleKey: "pricingPackageAuditTitle",
    titleDefault: "Design System Audit",
    priceKey: "pricingPackageAuditPrice",
    priceDefault: "€7–14k",
    durationKey: "pricingPackageAuditDuration",
    durationDefault: "2 weeks",
    descriptionKey: "pricingPackageAuditDescription",
    descriptionDefault:
      "An inventory, severity-ranked findings and a 90-day roadmap for the design system you already have.",
    ctaKey: "pricingPackageCtaAudit",
    ctaDefault: "Book a Design System Audit",
    contactPackageId: "design-system-audit",
    detailsHref: "/engagements/design-system-audit",
    donnyTarget: "pricing.package.designSystemAudit",
  },
  {
    titleKey: "pricingPackage3Title",
    titleDefault: "UX Sprint",
    priceKey: "pricingPackage3Price",
    priceDefault: "€7–14k",
    durationKey: "pricingPackage3Duration",
    durationDefault: "2 weeks",
    descriptionKey: "pricingPackage3Description",
    descriptionDefault:
      "A working prototype of the key flow, an eval plan to test it with users and a handoff your team can ship.",
    ctaKey: "pricingPackageCtaUxSprint",
    ctaDefault: "Book UX Sprint",
    contactPackageId: "ux-sprint",
    detailsHref: "/engagements/ux-sprint",
    donnyTarget: "pricing.package.uxSprint",
  },
  {
    titleKey: "pricingPackage2Title",
    titleDefault: "AI-Ready Ops",
    priceKey: "pricingPackage2Price",
    priceDefault: "€11–17k",
    durationKey: "pricingPackage2Duration",
    durationDefault: "3 weeks",
    descriptionKey: "pricingPackage2Description",
    descriptionDefault:
      "Design workflow setup, component governance, AI tooling hooks and a DesignOps playbook your team can run.",
    ctaKey: "pricingPackageCtaAiReady",
    ctaDefault: "Book AI-Ready Ops",
    contactPackageId: "ai-ready-designops",
    detailsHref: "/engagements/ai-ready-ops",
    donnyTarget: "pricing.package.aiReadyDesignOps",
  },
  {
    titleKey: "pricingPackage1Title",
    titleDefault: "Design System Lift-Off",
    priceKey: "pricingPackage1Price",
    priceDefault: "€14–20k",
    durationKey: "pricingPackage1Duration",
    durationDefault: "4 weeks",
    descriptionKey: "pricingPackage1Description",
    descriptionDefault:
      "Audit, tokens, core components, Storybook and an adoption playbook.",
    ctaKey: "pricingPackageCtaLiftOff",
    ctaDefault: "Book Design System Lift-Off",
    contactPackageId: "design-system-lift-off",
    detailsHref: "/engagements/design-system-lift-off",
    donnyTarget: "pricing.package.designSystemLiftOff",
  },
  {
    titleKey: "engagementPages.partnership.eyebrow",
    titleDefault: "Embedded partnership",
    priceKey: "engagementPages.partnership.price",
    priceDefault: "90 €/h",
    durationKey: "engagementPages.partnership.timeline",
    durationDefault: "6 or 12 months",
    descriptionKey: "pricingPackagePartnershipDescription",
    descriptionDefault:
      "A senior practitioner embedded in your team to run the design system and DesignOps over months, not weeks.",
    ctaKey: "pricingPackageCtaPartnership",
    ctaDefault: "Book a call about a partnership",
    contactPackageId: "embedded-partnership",
    detailsHref: "/engagements/embedded-partnership",
    donnyTarget: "pricing.package.embeddedPartnership",
  },
];

type AaasPackageItem = {
  titleKey: string;
  titleDefault: string;
  priceKey: string;
  priceDefault: string;
  durationKey: string;
  durationDefault: string;
  descriptionKey: string;
  descriptionDefault: string;
  ctaKey: string;
  ctaDefault: string;
  contactPackageId: string;
  /** Offer page for this package (/engagements/<slug>). */
  detailsHref?: string;
};

const AAAS_PACKAGES: AaasPackageItem[] = [
  {
    titleKey: "pricingAaasCopilotTitle",
    titleDefault: "DesignOps Pilot",
    priceKey: "pricingAaasCopilotPrice",
    priceDefault: "€5–8k / mo",
    durationKey: "pricingAaasCopilotDuration",
    durationDefault: "Ongoing",
    descriptionKey: "pricingAaasCopilotDescription",
    descriptionDefault:
      "A supervised agent that triages components, keeps tokens honest and drafts release notes your team approves.",
    ctaKey: "pricingAaasCopilotCta",
    ctaDefault: "Book DesignOps Pilot",
    contactPackageId: "designops-copilot",
    detailsHref: "/engagements/designops-pilot",
  },
  {
    titleKey: "pricingAaasAgentPilotTitle",
    titleDefault: "Agent Pilot",
    priceKey: "pricingAaasAgentPilotPrice",
    priceDefault: "€9–15k",
    durationKey: "pricingAaasAgentPilotDuration",
    durationDefault: "3 weeks",
    descriptionKey: "pricingAaasAgentPilotDescription",
    descriptionDefault:
      "Scope one workflow, ship a working agent with guardrails, evals and a handoff your team can run.",
    ctaKey: "pricingAaasAgentPilotCta",
    ctaDefault: "Book Agent Pilot",
    contactPackageId: "agent-pilot",
    detailsHref: "/engagements/agent-pilot",
  },
  {
    titleKey: "pricingAaasDsMcpTitle",
    titleDefault: "Design System MCP",
    priceKey: "pricingAaasDsMcpPrice",
    priceDefault: "€12–18k",
    durationKey: "pricingAaasDsMcpDuration",
    durationDefault: "4 weeks",
    descriptionKey: "pricingAaasDsMcpDescription",
    descriptionDefault:
      "Component contracts, an MCP server and an eval benchmark, so coding agents build with your design system instead of around it.",
    ctaKey: "pricingAaasDsMcpCta",
    ctaDefault: "Book Design System MCP",
    contactPackageId: "design-system-mcp",
    detailsHref: "/engagements/design-system-mcp",
  },
  {
    titleKey: "pricingAaasAgentWorkforceTitle",
    titleDefault: "Agent Workforce",
    priceKey: "pricingAaasAgentWorkforcePrice",
    priceDefault: "€20–32k",
    durationKey: "pricingAaasAgentWorkforceDuration",
    durationDefault: "6 weeks",
    descriptionKey: "pricingAaasAgentWorkforceDescription",
    descriptionDefault:
      "A crew of task-specific agents wired into your stack, with monitoring, fallbacks and a runbook your team owns.",
    ctaKey: "pricingAaasAgentWorkforceCta",
    ctaDefault: "Book Agent Workforce",
    contactPackageId: "agent-workforce",
    detailsHref: "/engagements/agent-workforce",
  },
];

/**
 * E-invoicing details. They live on Pricing rather than About because this is
 * the page about the commercial terms: what it costs, how to book, how to
 * invoice. On About they sat directly above the "made with" tech colophon,
 * where company payment data and package versions read as two unrelated
 * fact-blocks stacked on each other.
 *
 * The footer still carries these from tablet up but drops the column on
 * phones, so this is the mobile route to them. Labels and values read from
 * the footer's own translation keys deliberately — an operator ID duplicated
 * across six locale files is an operator ID that goes stale in five of them.
 */
const BILLING_DETAILS = [
  {
    labelKey: "footerBillingEInvoiceLabel",
    valueKey: "footerBillingEInvoice",
    copyable: true,
  },
  // The operator is a company name, not an identifier keyed into a form, so it
  // gets no copy control.
  {
    labelKey: "footerBillingOperatorLabel",
    valueKey: "footerBillingOperator",
    copyable: false,
  },
  {
    labelKey: "footerBillingOperatorIdLabel",
    valueKey: "footerBillingOperatorId",
    copyable: true,
  },
] as const;

function packageContactHref(packageId: string): string {
  const params = new URLSearchParams({
    mode: "book",
    package: packageId,
  });
  return `/contact?${params.toString()}`;
}

function ComparisonList({
  variant,
  title,
  rows,
}: {
  variant: "us" | "them";
  title: string;
  rows: ComparisonRow[];
}) {
  const t = useTranslate();
  const isUs = variant === "us";

  return (
    <div
      className={cn(
        styles.comparisonColumn,
        isUs ? styles.comparisonColumnUs : styles.comparisonColumnThem,
      )}
    >
      <Title level={2} size="s" className={styles.comparisonTitle}>
        {title}
      </Title>
      <ul className={styles.comparisonList}>
        {rows.map((row) => {
          const text = t(isUs ? row.usKey : row.themKey, {
            defaultValue: isUs ? row.usDefault : row.themDefault,
          });
          return (
            <li key={row.usKey} className={styles.comparisonItem}>
              <span
                className={cn(
                  styles.comparisonIcon,
                  isUs ? styles.comparisonIconUs : styles.comparisonIconThem,
                )}
                aria-hidden
              >
                {/* Two operating models, each with its strengths: the same
                    neutral marker on both sides, not a tick versus a cross. */}
                <Icon
                  name="Plus"
                  size="sm"
                  weight="bold"
                  color="currentColor"
                  decorative
                />
              </span>
              <Text
                as="span"
                size="m"
                lineHeight="normal"
                className={isUs ? styles.comparisonTextUs : styles.comparisonTextThem}
              >
                {text}
              </Text>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PackageCard({
  pkg,
  className,
  donnyTarget,
}: {
  pkg: PackageItem | AaasPackageItem;
  className?: string;
  donnyTarget?: string;
}) {
  const t = useTranslate();
  const title = t(pkg.titleKey, pkg.titleDefault);

  return (
    <li
      // The package id doubles as the deep-link anchor (/pricing#ux-sprint)
      // used by the homepage engagement cards.
      id={pkg.contactPackageId}
      className={cn(styles.packageCard, className)}
      {...(donnyTarget ? { "data-donny-target": donnyTarget } : {})}
    >
      <div className={styles.packageHeader}>
        <Title level={3} size="s">
          {title}
        </Title>
        <Text as="p" size="m" className={styles.packagePrice}>
          {t(pkg.priceKey, pkg.priceDefault)}
        </Text>
      </div>
      <Text as="p" size="s" className={styles.packageDuration}>
        {t(pkg.durationKey, pkg.durationDefault)}
      </Text>
      <Text as="p" size="m" className={styles.packageDescription}>
        {t(pkg.descriptionKey, pkg.descriptionDefault)}
      </Text>
      <div className={styles.packageCta}>
        {"detailsHref" in pkg && pkg.detailsHref ? (
          <Button
            href={pkg.detailsHref}
            variant="secondary"
            size="md"
            // Name starts with the visible label (WCAG 2.5.3); a hidden
            // ": title" span read as "Read more : title" (stray space).
            accessibleName={`${t("pricingPackageReadMore", "Read more")}: ${title}`}
          >
            {t("pricingPackageReadMore", "Read more")}
          </Button>
        ) : null}
        <Button
          href={
            ("ctaHref" in pkg && pkg.ctaHref) ||
            packageContactHref(pkg.contactPackageId)
          }
          variant="primary"
          size="md"
        >
          {t(pkg.ctaKey, pkg.ctaDefault)}
        </Button>
      </div>
    </li>
  );
}

export interface PricingPageContentProps {
  /** Optional wrapper class. */
  className?: string;
  /**
   * Decorative layer on the hero field, under the text. Drags on it pass
   * through the text layer.
   */
  heroBackground?: ReactNode;
}

/**
 * PricingPageContent — productized offers, agency comparison, and deliverables.
 */
export function PricingPageContent({ className, heroBackground }: PricingPageContentProps) {
  const t = useTranslate();
  const { copiedKey: copiedField, copy: copyField } = useCopyToClipboard();

  return (
    <div className={cn(styles.page, className)}>
      <section className={styles.heroBleed} aria-labelledby="pricing-hero-title">
        <div className={styles.heroBleedOverlay} aria-hidden="true">
          {heroBackground}
        </div>
        <div className={cn(styles.heroBleedContent, heroBackground && styles.heroBleedContentPassThrough)}>
          <Title
            level={1}
            size="xl"
            lineHeight="tight"
            className={styles.heroTitle}
            id="pricing-hero-title"
          >
            <TextReveal as="span" type="words" animation="fade" duration={0.8} stagger={0.06}>
              {t("pricingHeroTitle", "Transparent price tags.")}
            </TextReveal>
          </Title>
          <FadeIn direction="up" delay={0.5} distance={30}>
            <Text size="l" className={styles.heroSubtitle}>
              {t("pricingHeroSubtitle")}
            </Text>
          </FadeIn>
          <FadeIn direction="up" delay={0.7} distance={30}>
            <div className={styles.heroActions}>
              <Button href="#calculator" variant="primary" surface="onBrand" size="lg">
                {t("pricingHeroCalculatorCta", "Calculator")}
              </Button>
              <Button href="#packages" variant="secondary" surface="onBrand" size="lg">
                {t("pricingHeroPackagesCta", "Packages")}
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      <div className={styles.container}>
        <section
          className={styles.value}
          data-donny-target="pricing.comparison"
          aria-label={`${t("pricingComparisonUsTitle", "Digitaltableteur")} / ${t("pricingComparisonThemTitle", "Large delivery team")}`}
        >
          <div className={styles.comparisonGrid}>
            <ComparisonList
              variant="us"
              title={t("pricingComparisonUsTitle", "Digitaltableteur")}
              rows={COMPARISON_ROWS}
            />
            <ComparisonList
              variant="them"
              title={t("pricingComparisonThemTitle", "Large delivery team")}
              rows={COMPARISON_ROWS}
            />
          </div>
        </section>
      </div>

      <section
        className={styles.testimonial}
        aria-label={t("pricingTestimonialLabel", "In short")}
      >
        <div className={styles.testimonialContainer}>
          {/* A statement of the offer, not a client quote: no attribution
              exists, so it is not presented as one. */}
          <div className={styles.testimonialInner}>
            <Text
              as="p"
              size="l"
              lineHeight="relaxed"
              className={styles.testimonialQuote}
            >
              {t(
                "pricingTestimonialQuote",
                "A usable design system, with contracts, components, tokens and an adoption plan, in weeks rather than quarters.",
              )}
            </Text>
          </div>
        </div>
      </section>

      <div className={styles.container}>
        <div
          id="calculator"
          className={styles.calculatorSection}
          data-donny-target="pricing.calculator"
        >
          <PricingCalculator selectionFromUrl />
        </div>

        <section
          className={styles.deliverables}
          aria-labelledby="pricing-deliverables-title"
        >
          <Title
            level={2}
            size="l"
            lineHeight="tight"
            className={styles.deliverablesTitle}
            id="pricing-deliverables-title"
          >
            {t(
              "pricingDeliverablesTitle",
              "No guesswork. No scope creep. Scope, price and timeline agreed up front, from €7k.",
            )}
          </Title>

          <div
            id="packages"
            className={styles.packagesSection}
            data-donny-target="pricing.packages"
          >
            <Title
              level={3}
              size="s"
              lineHeight="tight"
              className={styles.packagesHeading}
              id="pricing-packages-title"
            >
              {t("pricingPackagesTitle", "Packages")}
            </Title>
            <Text as="p" size="s" className={styles.packagesAvailability}>
              {t("nextAvailableStart", {
                start: NEXT_AVAILABLE_START,
                defaultValue: "Next available start: {{start}}",
              })}
            </Text>

            <ul
              className={styles.packageList}
              aria-labelledby="pricing-packages-title"
            >
              {PACKAGES.map((pkg) => (
                <PackageCard
                  key={pkg.titleKey}
                  pkg={pkg}
                  donnyTarget={pkg.donnyTarget}
                />
              ))}
            </ul>
          </div>

          <div className={styles.aaasSection} data-donny-target="pricing.aaas">
            <div className={styles.aaasHeading}>
              <Title
                level={3}
                size="s"
                lineHeight="tight"
                className={styles.packagesHeading}
                id="pricing-aaas-title"
              >
                {t("pricingAaasTitle", "Agent track")}
              </Title>
              <span className={styles.newBadge} aria-hidden="true">
                {t("contactInquiryBookTabNew", "NEW!")}
              </span>
            </div>
            <Text as="p" size="m" className={styles.aaasSummary}>
              {t(
                "pricingAaasSummary",
                "Autonomous DesignOps packages. Agents that do the work, supervised by your team.",
              )}
            </Text>
            <ul
              className={styles.packageList}
              aria-labelledby="pricing-aaas-title"
            >
              {AAAS_PACKAGES.map((pkg) => (
                <PackageCard key={pkg.titleKey} pkg={pkg} />
              ))}
            </ul>
          </div>

          <div className={styles.ctaRow}>
            <Button href="/contact?mode=book" variant="primary" size="lg">
              {t("pricingCtaPrimary", "Book a call")}
            </Button>
            <Button href="/work" variant="secondary" size="lg">
              {t("pricingCtaSecondary", "See the work")}
            </Button>
          </div>

          {/* Invoicing route and the certification that says the obligations
              behind it are in order — one block, because they answer the same
              question: what it is like to have us as a supplier. */}
          <div className={styles.billingRow}>
            <Title level={3} size="s" className={styles.billingTitle}>
              {t("footerBillingTitle")}
            </Title>
            <dl className={styles.billingList}>
              {BILLING_DETAILS.map(({ labelKey, valueKey, copyable }) => {
                const value = t(valueKey);
                const copied = copiedField === valueKey;
                return (
                  <div key={labelKey} className={styles.billingItem}>
                    <dt className={styles.billingLabel}>{t(labelKey)}</dt>
                    <dd className={styles.billingValue}>
                      <span className={styles.billingValueText}>{value}</span>
                      {copyable ? (
                        <IconButton
                          size="sm"
                          variant="tertiary"
                          className={styles.copyControl}
                          onClick={() => copyField(valueKey, value)}
                          label={
                            copied
                              ? t("pricingBillingCopied", "Copied")
                              : t("pricingBillingCopy", "Copy {{field}}", {
                                  field: t(labelKey),
                                })
                          }
                          icon={
                            <Icon
                              name={copied ? "check-fat" : "copy-simple"}
                              size="sm"
                              decorative
                            />
                          }
                        />
                      ) : null}
                    </dd>
                  </div>
                );
              })}
            </dl>

            {/* Announces the copy for assistive tech: the icon swap and the
                relabelled button are visual-only signals. The live region has
                to be the wrapper, not the hidden span, so the announcement
                fires on text change rather than on the region appearing. */}
            <div aria-live="polite">
              <VisuallyHidden>
                {copiedField ? t("pricingBillingCopied", "Copied") : ""}
              </VisuallyHidden>
            </div>

            <div className={styles.trustRow}>
              <ReliablePartnerBadge size="md" />
              <Text as="p" size="s" className={styles.trustRowText}>
                {t(
                  "pricingTrustNote",
                  "Digitaltableteur is a Vastuu Group Reliable Partner: tax, pension and employer obligations continuously verified.",
                )}
              </Text>
            </div>
          </div>

          <ProcurementFaq className={styles.procurement} />
        </section>
      </div>
    </div>
  );
}

PricingPageContent.displayName = "PricingPageContent";
