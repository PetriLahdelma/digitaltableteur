"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import Button from "@dt/Button";
import Icon from "@dt/Icon";
import Text from "@dt/Text";
import Title from "@dt/Title";
import styles from "./PricingPageContent.module.css";

const PRICING_HERO_IMAGE = "/images/pricing/dsharp3-hero.png";

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
    usDefault: "Fixed packages from €8k",
    themDefault: "€80k–€300k+ scopes",
  },
  {
    usKey: "pricingCompareUs2",
    themKey: "pricingCompareThem2",
    usDefault: "2–4 weeks to first shippable product",
    themDefault: "3–9 months (or more)",
  },
  {
    usKey: "pricingCompareUs3",
    themKey: "pricingCompareThem3",
    usDefault: "One focused engagement at a time",
    themDefault: "Many parallel workstreams",
  },
  {
    usKey: "pricingCompareUs4",
    themKey: "pricingCompareThem4",
    usDefault: "Senior Design Lead",
    themDefault: "Junior-heavy delivery teams",
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
  proofKey: string;
  proofDefault: string;
  ctaKey: string;
  ctaDefault: string;
  contactPackageId: string;
  donnyTarget: string;
};

const PACKAGES: PackageItem[] = [
  {
    titleKey: "pricingPackage3Title",
    titleDefault: "UX Sprint",
    priceKey: "pricingPackage3Price",
    priceDefault: "€8–14k",
    durationKey: "pricingPackage3Duration",
    durationDefault: "2 weeks",
    descriptionKey: "pricingPackage3Description",
    descriptionDefault:
      "Prototype, eval plan and handoff your team can ship.",
    proofKey: "pricingPackageProofUxSprint",
    proofDefault:
      "2-week prototype with eval plan — see UX Sprint patterns in our work.",
    ctaKey: "pricingPackageCtaUxSprint",
    ctaDefault: "Book UX Sprint",
    contactPackageId: "ux-sprint",
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
    proofKey: "pricingPackageProofAiReady",
    proofDefault:
      "Agent-ready tokens and governance — see AI DesignOps case studies.",
    ctaKey: "pricingPackageCtaAiReady",
    ctaDefault: "Book AI-Ready Ops",
    contactPackageId: "ai-ready-designops",
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
    proofKey: "pricingPackageProofLiftOff",
    proofDefault:
      "Storybook + adoption playbook — see design system deliveries.",
    ctaKey: "pricingPackageCtaLiftOff",
    ctaDefault: "Book Design System Lift-Off",
    contactPackageId: "design-system-lift-off",
    donnyTarget: "pricing.package.designSystemLiftOff",
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
};

const AAAS_PACKAGES: AaasPackageItem[] = [
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
  },
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
  },
];

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
  const { t } = useTranslation();
  const isUs = variant === "us";

  return (
    <div
      className={cn(
        styles.comparisonColumn,
        isUs ? styles.comparisonColumnUs : styles.comparisonColumnThem,
      )}
    >
      <Title level={2} size="S" terminals="sans" className={styles.comparisonTitle}>
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
                <Icon
                  name={isUs ? "Plus" : "X"}
                  size="sm"
                  weight="bold"
                  color="var(--color-white)"
                  decorative
                />
              </span>
              <Text
                as="span"
                size="M"
                lineHeight="normal"
                terminals="sans"
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
  const { t } = useTranslation();
  const hasProof = "proofKey" in pkg;

  return (
    <li
      className={cn(styles.packageCard, className)}
      {...(donnyTarget ? { "data-donny-target": donnyTarget } : {})}
    >
      <div className={styles.packageHeader}>
        <Title level={3} size="S" terminals="sans">
          {t(pkg.titleKey, pkg.titleDefault)}
        </Title>
        <Text as="p" size="M" terminals="sans" className={styles.packagePrice}>
          {t(pkg.priceKey, pkg.priceDefault)}
        </Text>
      </div>
      <Text as="p" size="S" terminals="sans" className={styles.packageDuration}>
        {t(pkg.durationKey, pkg.durationDefault)}
      </Text>
      <Text as="p" size="M" terminals="sans" className={styles.packageDescription}>
        {t(pkg.descriptionKey, pkg.descriptionDefault)}
      </Text>
      {hasProof ? (
        <Text as="p" size="S" terminals="sans" className={styles.packageProof}>
          {t(pkg.proofKey, pkg.proofDefault)}
        </Text>
      ) : null}
      <div className={styles.packageCta}>
        <Button
          href={packageContactHref(pkg.contactPackageId)}
          variant="primary"
          size="m"
        >
          {t(pkg.ctaKey, pkg.ctaDefault)}
        </Button>
      </div>
    </li>
  );
}

export interface PricingPageContentProps {
  className?: string;
}

/**
 * PricingPageContent — productized offers, agency comparison, and deliverables.
 */
export function PricingPageContent({ className }: PricingPageContentProps) {
  const { t } = useTranslation();
  const aaasPanelId = useId();
  const aaasHeadingId = useId();
  const [aaasOpen, setAaasOpen] = useState(false);

  return (
    <div className={cn(styles.page, className)}>
      <section className={styles.heroBleed} aria-labelledby="pricing-hero-title">
        <Image
          src={PRICING_HERO_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.heroBleedImage}
        />
        <div className={styles.heroBleedOverlay} aria-hidden="true" />
        <div className={styles.heroBleedContent}>
          <Title
            level={1}
            size="XL"
            terminals="sans"
            lineHeight="tight"
            className={styles.heroTitle}
            id="pricing-hero-title"
          >
            {t(
              "pricingHeroTitleLead",
              "Design Systems. Digital branding. UX/UI.",
            )}{" "}
            <span className={styles.heroTitleClosing}>
              {t("pricingHeroTitleClosing", "One clear investment.")}
            </span>
          </Title>
        </div>
      </section>

      <div className={styles.container}>
        <section
          className={styles.value}
          data-donny-target="pricing.comparison"
          aria-label={`${t("pricingComparisonUsTitle", "Digitaltableteur")} / ${t("pricingComparisonThemTitle", "Traditional agency")}`}
        >
          <div className={styles.comparisonGrid}>
            <ComparisonList
              variant="us"
              title={t("pricingComparisonUsTitle", "Digitaltableteur")}
              rows={COMPARISON_ROWS}
            />
            <ComparisonList
              variant="them"
              title={t("pricingComparisonThemTitle", "Traditional agency")}
              rows={COMPARISON_ROWS}
            />
          </div>
        </section>
      </div>

      <section
        className={styles.testimonial}
        aria-label={t("pricingTestimonialLabel", "Client perspective")}
      >
        <div className={styles.testimonialContainer}>
          <blockquote className={styles.testimonialInner}>
            <Text
              as="p"
              size="L"
              lineHeight="relaxed"
              terminals="serif"
              className={styles.testimonialQuote}
            >
              {t(
                "pricingTestimonialQuote",
                "Why wrestle with bloated agency retainers when you can get a usable design system including contracts, components, tokens and an adoption plan in weeks?",
              )}
            </Text>
          </blockquote>
        </div>
      </section>

      <div className={styles.container}>
        <section
          className={styles.deliverables}
          aria-labelledby="pricing-deliverables-title"
        >
          <Title
            level={2}
            size="L"
            terminals="sans"
            lineHeight="tight"
            className={styles.deliverablesTitle}
            id="pricing-deliverables-title"
          >
            {t(
              "pricingDeliverablesTitle",
              "No guesswork. No scope creep. Just stellar design work, lightning fast, from €8k.",
            )}
          </Title>

          <div
            className={styles.packagesSection}
            data-donny-target="pricing.packages"
          >
            <Title
              level={3}
              size="S"
              terminals="sans"
              lineHeight="tight"
              className={styles.packagesHeading}
              id="pricing-packages-title"
            >
              {t("pricingPackagesTitle", "Packages")}
            </Title>

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
            <button
              type="button"
              className={styles.aaasTrigger}
              aria-expanded={aaasOpen}
              aria-controls={aaasPanelId}
              onClick={() => setAaasOpen((open) => !open)}
            >
              <span className={styles.aaasCaretWrap} aria-hidden>
                <Icon
                  name="caret-right"
                  size="md"
                  weight="bold"
                  decorative
                  className={cn(
                    styles.aaasCaretIcon,
                    aaasOpen && styles.aaasCaretOpen,
                  )}
                />
              </span>
              <span className={styles.aaasTriggerHeading}>
                <span id={aaasHeadingId} className={styles.aaasTriggerTitle}>
                  {t("pricingAaasTitle", "AaaS (Agents as a Service)")}
                </span>
                <span className={styles.newBadge} aria-hidden="true">
                  {t("contactInquiryBookTabNew", "NEW!")}
                </span>
              </span>
            </button>

            <div
              id={aaasPanelId}
              className={styles.aaasPanel}
              role="region"
              aria-labelledby={aaasHeadingId}
              hidden={!aaasOpen}
            >
              <Text as="p" size="M" terminals="sans" className={styles.aaasSummary}>
                {t(
                  "pricingAaasSummary",
                  "Autonomous DesignOps packages. Agents that do the work, supervised by your team.",
                )}
              </Text>
              <ul className={styles.packageList}>
                {AAAS_PACKAGES.map((pkg) => (
                  <PackageCard key={pkg.titleKey} pkg={pkg} />
                ))}
              </ul>
            </div>
          </div>

          <div className={styles.ctaRow}>
            <Button href="/contact?mode=book" variant="primary" size="lg">
              {t("pricingCtaPrimary", "Book a call")}
            </Button>
            <Button href="/work" variant="secondary" size="lg">
              {t("pricingCtaSecondary", "See our work")}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

PricingPageContent.displayName = "PricingPageContent";
