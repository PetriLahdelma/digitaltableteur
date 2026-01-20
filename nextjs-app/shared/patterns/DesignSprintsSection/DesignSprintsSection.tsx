"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Section } from "../../components/Section";
import { Container } from "../../components/Container";
import { FadeIn } from "../../components/animations/FadeIn";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export interface DesignSprintsSectionProps {
  /** Section id for anchor linking */
  id?: string;
  /** Custom className */
  className?: string;
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
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: "repeat(2, 1fr)",
              }}
            >
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
              <div className="flex justify-center pt-4">
                <Button
                  size="lg"
                  asChild
                  className="min-w-[180px]"
                >
                  <a href="/contact" data-donny-interest="design-sprint">
                    {t("homeDesignSprintsCta", "Start your sprint")}
                  </a>
                </Button>
              </div>
            </FadeIn>
          </div>
        </div>
      </Container>
    </Section>
  );
}

DesignSprintsSection.displayName = "DesignSprintsSection";
