"use client";

import { useTranslation } from "react-i18next";
import { Section } from "../../components/Section";
import { Container } from "../../components/Container";
import { FadeIn } from "../../components/animations/FadeIn";
import { SlideButton } from "../../components/SlideButton";
import { Check } from "lucide-react";
import styles from "./DesignSprintsSection.module.css";

export interface DesignSprintsSectionProps {
  /** Section id for anchor linking */
  id?: string;
  /** Donny site action target id */
  donnyTarget?: string;
  /** Custom className */
  className?: string;
}

/**
 * DesignSprintsSection - Showcases the rapid brand design sprint offering
 */
export function DesignSprintsSection({
  id = "design-sprints",
  donnyTarget = "home.designSprints",
  className,
}: DesignSprintsSectionProps) {
  const { t } = useTranslation();

  const benefits = t("homeDesignSprintsBenefits", {
    returnObjects: true,
    defaultValue: [],
  }) as string[];

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
                {t("homeDesignSprintsTitle", "Exceptional design, without the wait")}
              </h2>
            </FadeIn>

            <FadeIn direction="up" delay={0.1} distance={20}>
              <p className={styles.description}>
                {t(
                  "homeDesignSprintsDescription",
                  "We believe world-class design shouldn't take months. That's why we created Design Sprints—polished, timeless branding delivered in just two weeks."
                )}
              </p>
            </FadeIn>
          </div>

          <div className={styles.benefitsGrid}>
            {benefits.map((benefit, index) => (
              <FadeIn
                key={benefit}
                direction="left"
                delay={0.1 + index * 0.08}
                distance={30}
              >
                <div className={styles.benefitCard}>
                  <div className={styles.benefitIcon}>
                    <Check className="w-4 h-4" />
                  </div>
                  <span className={styles.benefitLabel}>{benefit}</span>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn direction="up" delay={0.4} distance={20}>
            <div className={styles.ctaRow}>
              <SlideButton
                label={t("homeDesignSprintsCta", "Start your sprint")}
                href="/contact?service=design-sprint"
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
