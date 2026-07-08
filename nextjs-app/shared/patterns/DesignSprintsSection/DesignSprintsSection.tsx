"use client";

import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Section } from "../../components/Section";
import { Container } from "../../components/Container";
import { FadeIn } from "../../components/animations/FadeIn";
import Icon from "../../components/Icon";
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
 * SprintButton - Animated pill button with icon that slides from left to right on hover
 */
function SprintButton({ label }: { label: string }) {
  return (
    <a
      href="/contact?service=design-sprint"
      data-donny-interest="design-sprint"
      className={cn(
        "group relative inline-flex items-center",
        "h-11 rounded-full",
        "bg-primary text-primary-foreground",
        "font-medium text-base",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "cursor-pointer"
      )}
    >
      <span
        className={cn(
          "relative z-10 whitespace-nowrap",
          "pl-11 pr-5 group-hover:pl-5 group-hover:pr-11",
          "transition-all duration-300 ease-out"
        )}
      >
        {label}
      </span>

      <span
        className={cn(
          "absolute top-1/2 -translate-y-1/2 z-20",
          "w-8 h-8",
          "left-1.5 group-hover:left-[calc(100%-2.375rem)]",
          "transition-[left] duration-[600ms] ease-out"
        )}
      >
        <span
          className={cn(
            "flex items-center justify-center",
            "w-8 h-8 rounded-full",
            styles.iconCircle
          )}
        >
          <Icon name="Lightning" size="sm" weight="fill" className="text-foreground" />
        </span>
      </span>
    </a>
  );
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
              <SprintButton label={t("homeDesignSprintsCta", "Start your sprint")} />
            </div>
          </FadeIn>
        </div>
      </Container>
    </Section>
  );
}

DesignSprintsSection.displayName = "DesignSprintsSection";
