"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
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
      {/* Text */}
      <span
        className={cn(
          "relative z-10 whitespace-nowrap",
          "pl-11 pr-5 group-hover:pl-5 group-hover:pr-11",
          "transition-all duration-300 ease-out"
        )}
      >
        {label}
      </span>

      {/* Icon circle - wrapper handles position, inner circle handles rotation */}
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
 * 
 * Features:
 * - Compelling headline and description about fast, quality design
 * - Grid of benefits with check icons
 * - CTA to get started
 */
export function DesignSprintsSection({
  id = "design-sprints",
  className,
}: DesignSprintsSectionProps) {
  const { t } = useTranslation();

  // Get benefits array from translations
  const benefits = t("homeDesignSprintsBenefits", {
    returnObjects: true,
    defaultValue: [],
  }) as string[];

  return (
    <Section
      id={id}
      spacing="lg"
      background="accent"
      className={className}
    >
      <Container size="lg">
        <div className="grid gap-12 desktop:grid-cols-2 desktop:gap-16 items-center">
          {/* Content column */}
          <div className="space-y-6">
            <FadeIn direction="up" delay={0} distance={20}>
              <h2
                className={cn(
                  "font-display font-bold",
                  "text-3xl tablet:text-4xl desktop:text-5xl",
                  "text-foreground leading-tight"
                )}
              >
                {t("homeDesignSprintsTitle", "Exceptional design, without the wait")}
              </h2>
            </FadeIn>

            <FadeIn direction="up" delay={0.1} distance={20}>
              <p
                className={cn(
                  "font-body text-lg tablet:text-xl",
                  "text-muted-foreground leading-relaxed",
                  "max-w-xl"
                )}
              >
                {t(
                  "homeDesignSprintsDescription",
                  "We believe world-class design shouldn't take months. That's why we created Design Sprints—polished, timeless branding delivered in just two weeks."
                )}
              </p>
            </FadeIn>

          </div>

          {/* Benefits column - 2x2 grid with CTA below */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <FadeIn
                  key={benefit}
                  direction="left"
                  delay={0.1 + index * 0.08}
                  distance={30}
                >
                  <div
                    className={cn(
                      "flex items-center gap-4",
                      "p-4 rounded-lg",
                      "bg-background/60 backdrop-blur-sm",
                      "border border-border/50",
                      "transition-all duration-200",
                      "hover:bg-background/80 hover:border-border"
                    )}
                  >
                    <div
                      className={cn(
                        "flex-shrink-0",
                        "w-8 h-8 rounded-full",
                        "bg-primary/10 text-primary",
                        "flex items-center justify-center"
                      )}
                    >
                      <Check className="w-4 h-4" />
                    </div>
                    <span
                      className={cn(
                        "font-body font-medium",
                        "text-base tablet:text-lg",
                        "text-foreground"
                      )}
                    >
                      {benefit}
                    </span>
                  </div>
                </FadeIn>
              ))}
            </div>

            <FadeIn direction="up" delay={0.4} distance={20}>
              <div className="flex justify-center pt-8">
                <SprintButton label={t("homeDesignSprintsCta", "Start your sprint")} />
              </div>
            </FadeIn>
          </div>
        </div>
      </Container>
    </Section>
  );
}

DesignSprintsSection.displayName = "DesignSprintsSection";
