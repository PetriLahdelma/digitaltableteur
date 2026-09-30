"use client";

import { useTranslation } from "react-i18next";
import Title from "@dt/Title";
import { Section } from "../../components/Section";
import { Container } from "../../components/Container";
import { FadeIn } from "../../components/animations/FadeIn";
import { SlideButton } from "../../components/SlideButton";
import { Link as RouterLink } from "../../lib/linkComponent";
import styles from "./DesignSprintsSection.module.css";

export interface DesignSprintsSectionProps {
  /** Section id for anchor linking */
  id?: string;
  /** Donny site action target id */
  donnyTarget?: string;
  /** Custom className */
  className?: string;
}

interface EngagementModel {
  /** Stable id (not translated); picks the pricing-page destination. */
  id: string;
  title: string;
  duration: string;
  detail: string;
}

/**
 * Where each engagement card leads on /pricing. The three fixed-scope offers
 * land on their own package card; the embedded partnership is the calculator's
 * partnership tier (6 or 12 months at 4+ days/week), so it arrives with that
 * selection already made.
 */
export const ENGAGEMENT_HREFS: Record<string, string> = {
  "ux-sprint": "/pricing#ux-sprint",
  "ai-ready-ops": "/pricing#ai-ready-designops",
  "design-system-lift-off": "/pricing#design-system-lift-off",
  "embedded-partnership": "/pricing?duration=6m&days=4#calculator",
};

/**
 * DesignSprintsSection - Homepage band presenting the engagement models (UX
 * Sprint, AI-Ready Ops, Design System Lift-Off, embedded partnership), each
 * matching a package on the pricing page. Keeps its historical name and
 * #design-sprints anchor because links and Donny targets point at them.
 */
export function DesignSprintsSection({
  id = "design-sprints",
  donnyTarget = "home.designSprints",
  className,
}: DesignSprintsSectionProps) {
  const { t } = useTranslation();

  const models = t("homeEngagementModels", {
    returnObjects: true,
    defaultValue: [],
  }) as EngagementModel[];

  return (
    <Section
      id={id}
      data-donny-target={donnyTarget}
      spacing="lg"
      background="accent"
      className={className}
    >
      <Container size="lg">
        <div className={styles.layout}>
          <div className={styles.intro}>
            <FadeIn direction="up" delay={0} distance={20}>
              <Title as="h2" unstyled className={styles.title}>
                {t(
                  "homeDesignSprintsTitle",
                  "Focused engagements, senior delivery",
                )}
              </Title>
            </FadeIn>

            <FadeIn direction="up" delay={0.1} distance={20}>
              <p className={styles.description}>
                {t(
                  "homeDesignSprintsDescription",
                  "Start with the problem in front of you. Every engagement is led hands-on, with a network of specialists added as the work needs them.",
                )}
              </p>
            </FadeIn>
          </div>

          <ul className={styles.benefitsGrid}>
            {models.map((model, index) => (
              <FadeIn
                key={model.id ?? model.title}
                as="li"
                direction="left"
                delay={0.1 + index * 0.08}
                distance={30}
                className={styles.benefitCard}
              >
                <span className={styles.engagementHeader}>
                  {ENGAGEMENT_HREFS[model.id] ? (
                    // Stretched link: the title is the accessible name and the
                    // ::after overlay makes the whole card the hit area.
                    <RouterLink
                      href={ENGAGEMENT_HREFS[model.id]}
                      className={`${styles.benefitLabel} ${styles.cardLink}`}
                    >
                      {model.title}
                    </RouterLink>
                  ) : (
                    <span className={styles.benefitLabel}>{model.title}</span>
                  )}
                  <span className={styles.engagementDuration}>
                    {model.duration}
                  </span>
                </span>
                <span className={styles.engagementDetail}>{model.detail}</span>
              </FadeIn>
            ))}
          </ul>

          <FadeIn direction="up" delay={0.4} distance={20}>
            <div className={styles.ctaRow}>
              <SlideButton
                label={t("homeDesignSprintsCta", "See engagements and pricing")}
                href="/pricing"
                icon="Lightning"
                data-donny-interest="design-sprint"
              />
            </div>
          </FadeIn>
        </div>
      </Container>
    </Section>
  );
}

DesignSprintsSection.displayName = "DesignSprintsSection";
