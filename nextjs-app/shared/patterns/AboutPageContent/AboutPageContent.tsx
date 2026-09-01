"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  UserCheck,
  Network,
  ClipboardCheck,
  RefreshCw,
  KeyRound,
} from "lucide-react";
import {
  SiNextdotjs,
  SiNpm,
  SiReact,
  SiStorybook,
  SiTypescript,
  SiWebcomponentsdotorg,
} from "react-icons/si";

import { DESIGN_SYSTEM_PACKAGE_VERSIONS } from "@/nextjs-app/shared/data/designSystemPackageVersions";
import { AboutHero } from "../AboutHero";
import { ValuesSection, type ValueItem } from "../ValuesSection";
import { StatsSection } from "../../patterns/StatsSection/StatsSection";
import { ManifestoSection, type ManifestoToken } from "../ManifestoSection";
import { CTASection } from "../CTASection";
import { SlideButton } from "../../components/SlideButton";
import {
  ReliablePartnerBadge,
  getReliablePartnerReportHref,
} from "../../components/ReliablePartnerBadge";
import DtLink from "../../components/Link";
import { Title } from "@digitaltableteur/react";
import styles from "./AboutPageContent.module.css";

const TECH_STACK = [
  { label: "React 19", Icon: SiReact },
  { label: "Web Components", Icon: SiWebcomponentsdotorg },
  { label: "TypeScript", Icon: SiTypescript },
  { label: "Next.js 16", Icon: SiNextdotjs },
  { label: "Storybook 10", Icon: SiStorybook },
  { label: "npm", Icon: SiNpm },
] as const;

const DESIGN_SYSTEM_PACKAGES = [
  {
    name: "@digitaltableteur/react",
    shortName: "react",
    version: DESIGN_SYSTEM_PACKAGE_VERSIONS.react,
  },
  {
    name: "@digitaltableteur/web-components",
    shortName: "web-components",
    version: DESIGN_SYSTEM_PACKAGE_VERSIONS["web-components"],
  },
  {
    name: "@digitaltableteur/tokens",
    shortName: "tokens",
    version: DESIGN_SYSTEM_PACKAGE_VERSIONS.tokens,
  },
  {
    name: "@digitaltableteur/tokens-css",
    shortName: "tokens-css",
    version: DESIGN_SYSTEM_PACKAGE_VERSIONS["tokens-css"],
  },
] as const;

/**
 * E-invoicing details, shown here because the footer drops its Billing column
 * below tablet (the four stacked columns ran 1.57 viewports tall). These three
 * fields exist nowhere else: /imprint carries the Business ID and VAT ID but
 * not the e-invoice route, and /contact carries the postal address and email.
 *
 * Labels and values are read from the same translation keys the footer uses,
 * deliberately — an operator ID duplicated across six locale files is an
 * operator ID that goes stale in five of them.
 */
const BILLING_DETAILS = [
  { labelKey: "footerBillingEInvoiceLabel", valueKey: "footerBillingEInvoice" },
  { labelKey: "footerBillingOperatorLabel", valueKey: "footerBillingOperator" },
  {
    labelKey: "footerBillingOperatorIdLabel",
    valueKey: "footerBillingOperatorId",
  },
] as const;

export interface AboutPageContentProps {
  /** Show CTA section at bottom */
  showCTA?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * AboutPageContent component.
 */
export function AboutPageContent({
  showCTA = true,
  className,
}: AboutPageContentProps) {
  const { t, i18n } = useTranslation();

  // Value items for the expertise section
  const values: ValueItem[] = useMemo(
    () => [
      {
        icon: (
          <span
            aria-hidden="true"
            className="font-display text-6xl font-semibold leading-none tracking-normal tablet:text-7xl"
          >
            01
          </span>
        ),
        iconClassName: cn(
          "mb-6 h-auto w-auto justify-start rounded-none bg-transparent",
          "text-foreground group-hover:bg-transparent",
        ),
        title: t("aboutValueDesignTitle"),
        description: t("aboutValueDesignDescription"),
      },
      {
        icon: (
          <span
            aria-hidden="true"
            className="font-display text-6xl font-semibold leading-none tracking-normal tablet:text-7xl"
          >
            02
          </span>
        ),
        iconClassName: cn(
          "mb-6 h-auto w-auto justify-start rounded-none bg-transparent",
          "text-foreground group-hover:bg-transparent",
        ),
        title: t("aboutValueDevelopmentTitle"),
        description: t("aboutValueDevelopmentDescription"),
      },
      {
        icon: (
          <span
            aria-hidden="true"
            className="font-display text-6xl font-semibold leading-none tracking-normal tablet:text-7xl"
          >
            03
          </span>
        ),
        iconClassName: cn(
          "mb-6 h-auto w-auto justify-start rounded-none bg-transparent",
          "text-foreground group-hover:bg-transparent",
        ),
        title: t("aboutValueCollaborationTitle"),
        description: t("aboutValueCollaborationDescription"),
      },
      {
        icon: (
          <span
            aria-hidden="true"
            className="font-display text-6xl font-semibold leading-none tracking-normal tablet:text-7xl"
          >
            04
          </span>
        ),
        iconClassName: cn(
          "mb-6 h-auto w-auto justify-start rounded-none bg-transparent",
          "text-foreground group-hover:bg-transparent",
        ),
        title: t("aboutValueAITitle"),
        description: t("aboutValueAIDescription"),
      },
      {
        icon: (
          <span
            aria-hidden="true"
            className="font-display text-6xl font-semibold leading-none tracking-normal tablet:text-7xl"
          >
            05
          </span>
        ),
        iconClassName: cn(
          "mb-6 h-auto w-auto justify-start rounded-none bg-transparent",
          "text-foreground group-hover:bg-transparent",
        ),
        title: t("aboutValueSystemsTitle"),
        description: t("aboutValueSystemsDescription"),
      },
      {
        icon: (
          <span
            aria-hidden="true"
            className="font-display text-6xl font-semibold leading-none tracking-normal tablet:text-7xl"
          >
            06
          </span>
        ),
        iconClassName: cn(
          "mb-6 h-auto w-auto justify-start rounded-none bg-transparent",
          "text-foreground group-hover:bg-transparent",
        ),
        title: t("aboutValueCraftTitle"),
        description: t("aboutValueCraftDescription"),
      },
    ],
    [t, i18n.language],
  );

  // "How we deliver at scale" — addresses enterprise-buyer concerns
  // (continuity, governance, ownership) beyond a single-person dependency.
  const deliveryValues: ValueItem[] = useMemo(
    () => [
      {
        icon: <UserCheck className="w-6 h-6" />,
        title: t("aboutDeliverySeniorTitle"),
        description: t("aboutDeliverySeniorDescription"),
      },
      {
        icon: <Network className="w-6 h-6" />,
        title: t("aboutDeliveryNetworkTitle"),
        description: t("aboutDeliveryNetworkDescription"),
      },
      {
        icon: <ClipboardCheck className="w-6 h-6" />,
        title: t("aboutDeliveryGovernanceTitle"),
        description: t("aboutDeliveryGovernanceDescription"),
      },
      {
        icon: <RefreshCw className="w-6 h-6" />,
        title: t("aboutDeliveryContinuityTitle"),
        description: t("aboutDeliveryContinuityDescription"),
      },
      {
        icon: <KeyRound className="w-6 h-6" />,
        title: t("aboutDeliveryOwnershipTitle"),
        description: t("aboutDeliveryOwnershipDescription"),
      },
    ],
    [t, i18n.language],
  );

  // Operating model — folds the "how we work" story into the current About page
  // instead of creating a separate generic process page.
  const operatingValues: ValueItem[] = useMemo(
    () => [
      {
        icon: (
          <span
            aria-hidden="true"
            className="font-display text-4xl font-semibold leading-none tracking-normal"
          >
            01
          </span>
        ),
        iconClassName: cn(
          "mb-5 h-auto w-auto justify-start rounded-none bg-transparent",
          "text-foreground group-hover:bg-transparent",
        ),
        title: t("aboutOperatingDiagnoseTitle"),
        description: t("aboutOperatingDiagnoseDescription"),
      },
      {
        icon: (
          <span
            aria-hidden="true"
            className="font-display text-4xl font-semibold leading-none tracking-normal"
          >
            02
          </span>
        ),
        iconClassName: cn(
          "mb-5 h-auto w-auto justify-start rounded-none bg-transparent",
          "text-foreground group-hover:bg-transparent",
        ),
        title: t("aboutOperatingShapeTitle"),
        description: t("aboutOperatingShapeDescription"),
      },
      {
        icon: (
          <span
            aria-hidden="true"
            className="font-display text-4xl font-semibold leading-none tracking-normal"
          >
            03
          </span>
        ),
        iconClassName: cn(
          "mb-5 h-auto w-auto justify-start rounded-none bg-transparent",
          "text-foreground group-hover:bg-transparent",
        ),
        title: t("aboutOperatingBuildTitle"),
        description: t("aboutOperatingBuildDescription"),
      },
      {
        icon: (
          <span
            aria-hidden="true"
            className="font-display text-4xl font-semibold leading-none tracking-normal"
          >
            04
          </span>
        ),
        iconClassName: cn(
          "mb-5 h-auto w-auto justify-start rounded-none bg-transparent",
          "text-foreground group-hover:bg-transparent",
        ),
        title: t("aboutOperatingScaleTitle"),
        description: t("aboutOperatingScaleDescription"),
      },
    ],
    [t, i18n.language],
  );

  // Manifesto tokens (intro + highlightable phrases)
  const manifestoTokens: ManifestoToken[] = useMemo(
    () => [
      { text: t("aboutManifestoIntro"), highlightable: false },
      { text: t("aboutManifestoPhrase1"), highlightable: true },
      { text: t("aboutManifestoPhrase2"), highlightable: true },
      { text: t("aboutManifestoPhrase3"), highlightable: true },
      { text: t("aboutManifestoPhrase4"), highlightable: true },
      { text: t("aboutManifestoPhrase5"), highlightable: true },
      { text: t("aboutManifestoPhrase6"), highlightable: true },
      { text: t("aboutManifestoPhrase7"), highlightable: true },
      { text: t("aboutManifestoPhrase8"), highlightable: true },
      { text: t("aboutManifestoPhrase9"), highlightable: true },
      { text: t("aboutManifestoPhrase10"), highlightable: true },
      { text: t("aboutManifestoPhrase11"), highlightable: true },
    ],
    [t, i18n.language],
  );

  return (
    <div className={cn("min-h-screen", className)}>
      {/* Hero Section */}
      <AboutHero
        title={t("aboutHeroTitle")}
        subtitle={t("aboutHeroSubtitle")}
        background="gradient"
        showScrollIndicator
      />

      {/* Values/Expertise Section */}
      <ValuesSection
        title={t("aboutValuesTitle")}
        subtitle={t("aboutValuesSubtitle")}
        values={values}
        cardVariant="bordered"
        background="muted"
        columns="two"
      />

      {/* Stats Section */}
      <StatsSection
        stats={[
          {
            value: 20,
            suffix: "+",
            label: t("statsYearsExperience", "Years of experience"),
            duration: 2,
          },
          {
            value: 8,
            suffix: "K+",
            label: t("statsComponentsBuilt", "Design system components built"),
            duration: 2.5,
          },
          {
            value: 300,
            suffix: "+",
            label: t("statsProjectsDelivered", "Projects delivered"),
            duration: 2,
          },
        ]}
        background="primary"
      />

      {/* How we deliver at scale */}
      <ValuesSection
        title={t("aboutDeliveryTitle")}
        subtitle={t("aboutDeliverySubtitle")}
        values={deliveryValues}
        cardVariant="bordered"
        background="default"
      />

      {/* Reliable Partner trust band */}
      <section
        className={styles.trustBand}
        aria-labelledby="about-trust-title"
      >
        <div className={styles.trustBandInner}>
          <ReliablePartnerBadge size="lg" />
          <div className={styles.trustBandText}>
            <p id="about-trust-title" className={styles.trustBandTitle}>
              {t(
                "reliablePartnerHeading",
                "A Vastuu Group Reliable Partner",
              )}
            </p>
            <p className={styles.trustBandBody}>
              {t(
                "reliablePartnerBody",
                "Tax, pension and employer obligations are continuously verified through Vastuu Group's Reliable Partner programme, as required by the Finnish Contractor's Obligations Act.",
              )}
            </p>
            <p className={styles.trustBandLink}>
              <DtLink
                href={getReliablePartnerReportHref(i18n.language || "en")}
                target="_blank"
                rel="noopener noreferrer"
                underline="always"
                size="sm"
              >
                {t(
                  "reliablePartnerVerify",
                  "Open the Reliable Partner report (PDF)",
                )}
              </DtLink>
            </p>
          </div>
        </div>
      </section>

      {/* Strategy to scale */}
      <ValuesSection
        title={t("aboutOperatingTitle")}
        subtitle={t("aboutOperatingSubtitle")}
        values={operatingValues}
        cardVariant="bordered"
        background="muted"
        columns="two"
      />

      {/* Manifesto Section */}
      <ManifestoSection
        title={t("aboutManifestoTitle")}
        tokens={manifestoTokens}
        interval={2400}
        separator="✕"
        background="transparent"
      />

      {/* See the work CTA */}
      <div className={styles.seeWorkCta}>
        <SlideButton
          label={t("aboutSeeWorkCta", "See the work")}
          href="/work"
          icon="ArrowRight"
        />
      </div>

      <section
        className={styles.billingSection}
        aria-labelledby="about-billing-title"
      >
        <div className={styles.billingInner}>
          <Title
            level={2}
            size="s"
            id="about-billing-title"
            className={styles.billingTitle}
          >
            {t("footerBillingTitle")}
          </Title>
          <dl className={styles.billingList}>
            {BILLING_DETAILS.map(({ labelKey, valueKey }) => (
              <div key={labelKey} className={styles.billingItem}>
                <dt className={styles.billingLabel}>{t(labelKey)}</dt>
                <dd className={styles.billingValue}>{t(valueKey)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section
        className={styles.versioningSection}
        aria-labelledby="about-versioning-title"
      >
        <div className={styles.versioningInner}>
          <h2 id="about-versioning-title" className={styles.visuallyHidden}>
            {t("aboutVersioningTitle")}
          </h2>

          <p className={styles.madeWith}>{t("aboutMadeWith", "This site is made with")}</p>

          <ul
            className={styles.stackLogos}
            aria-label={t("aboutVersioningStackLabel")}
          >
            {TECH_STACK.map(({ label, Icon }) => (
              <li
                key={label}
                className={styles.stackLogo}
                title={label}
                aria-label={label}
              >
                <Icon aria-hidden="true" />
              </li>
            ))}
          </ul>

          <dl className={styles.packageList}>
            {DESIGN_SYSTEM_PACKAGES.map((pkg) => (
              <div
                key={pkg.name}
                className={styles.packageItem}
                aria-label={`${pkg.name} ${pkg.version}`}
                title={`${pkg.name} ${pkg.version}`}
              >
                <dt className={styles.packageLabel}>{pkg.shortName}</dt>
                <dd className={styles.packageVersionWrapper}>
                  <pre className={styles.packageVersion}>{pkg.version}</pre>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA Section */}
      {showCTA && (
        <CTASection
          title={t("aboutCTATitle")}
          description={t("aboutCTADescription")}
          primaryAction={{
            label: t("aboutCTAPrimaryLabel"),
            href: "/contact",
          }}
          secondaryAction={{
            label: t("aboutCTASecondaryLabel"),
            href: "/work",
          }}
          background="primary"
          align="center"
        />
      )}
    </div>
  );
}

AboutPageContent.displayName = "AboutPageContent";
