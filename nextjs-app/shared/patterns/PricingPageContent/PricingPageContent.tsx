"use client";

import Image from "next/image";
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
    donnyTarget: "pricing.package.uxSprint",
  },
  {
    titleKey: "pricingPackage2Title",
    titleDefault: "AI-Ready DesignOps",
    priceKey: "pricingPackage2Price",
    priceDefault: "€11–17k",
    durationKey: "pricingPackage2Duration",
    durationDefault: "3 weeks",
    descriptionKey: "pricingPackage2Description",
    descriptionDefault:
      "Design workflow setup, component governance, AI tooling hooks and a DesignOps playbook your team can run.",
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
    donnyTarget: "pricing.package.designSystemLiftOff",
  },
];

export interface PricingPageContentProps {
  className?: string;
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
        isUs ? styles.comparisonColumnUs : styles.comparisonColumnThem
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
                  isUs ? styles.comparisonIconUs : styles.comparisonIconThem
                )}
                aria-hidden
              >
                <Icon
                  name={isUs ? "Plus" : "X"}
                  size="sm"
                  weight="bold"
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

/**
 * PricingPageContent — productized offers, agency comparison, and deliverables.
 */
export function PricingPageContent({ className }: PricingPageContentProps) {
  const { t } = useTranslation();

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
              "Design Systems. Digital branding. UX/UI."
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
                "Why wrestle with bloated agency retainers when you can get a usable design system including contracts, components, tokens and an adoption plan in weeks?"
              )}
            </Text>
          </blockquote>
        </div>
      </section>

      <div className={styles.container}>
      <section className={styles.deliverables} aria-labelledby="pricing-deliverables-title">
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
            "No guesswork. No scope creep. Just stellar design work, lightning fast, from €8k."
          )}
        </Title>

        <div className={styles.packagesSection} data-donny-target="pricing.packages">
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
            <li
              key={pkg.titleKey}
              className={styles.packageCard}
              data-donny-target={pkg.donnyTarget}
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
            </li>
          ))}
        </ul>
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
