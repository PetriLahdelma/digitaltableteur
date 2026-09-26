"use client";

import { useTranslation } from "react-i18next";
import { Section } from "../../components/Section";
import { Container } from "../../components/Container";
import { FadeIn } from "../../components/animations/FadeIn";
import { SlideButton } from "../../components/SlideButton";
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
  title: string;
  duration: string;
  detail: string;
}

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
              <h2 className={styles.title}>
                {t("homeDesignSprintsTitle", "Focused engagements, senior delivery")}
              </h2>
            </FadeIn>

            <FadeIn direction="up" delay={0.1} distance={20}>
              <p className={styles.description}>
                {t(
                  "homeDesignSprintsDescription",
                  "Start with the problem in front of you. Every engagement is led hands-on by Petri, with specialists from our network added as the work needs them, and each one can grow into the next.",
                )}
              </p>
            </FadeIn>
          </div>

          <ul className={styles.benefitsGrid}>
            {models.map((model, index) => (
              <FadeIn
                key={model.title}
                as="li"
                direction="left"
                delay={0.1 + index * 0.08}
                distance={30}
                className={styles.benefitCard}
              >
                <span className={styles.engagementHeader}>
                  <span className={styles.benefitLabel}>{model.title}</span>
                  <span className={styles.engagementDuration}>{model.duration}</span>
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
