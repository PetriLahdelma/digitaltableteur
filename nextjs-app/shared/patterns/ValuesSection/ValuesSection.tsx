"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Section } from "../../components/Section";
import { Container } from "../../components/Container";
import { FadeIn } from "../../components/animations/FadeIn";
import { ValueCard } from "../../components/ValueCard";
import Title from "@dt/Title";

export interface ValueItem {
  /** Icon element */
  icon: ReactNode;
  /** Value title */
  title: string;
  /** Value description */
  description: string;
}

export interface ValuesSectionProps {
  /** Section title */
  title: string;
  /** Optional subtitle/intro text */
  subtitle?: string;
  /** Array of values to display */
  values: ValueItem[];
  /** Card variant */
  cardVariant?: "default" | "bordered" | "elevated";
  /** Background variant */
  background?: "default" | "muted" | "accent";
  /** Custom className */
  className?: string;
}

const backgroundClasses: Record<NonNullable<ValuesSectionProps["background"]>, string> = {
  default: "bg-background",
  muted: "bg-muted/30",
  accent: "bg-primary/5",
};

export function ValuesSection({
  title,
  subtitle,
  values,
  cardVariant = "bordered",
  background = "default",
  className,
}: ValuesSectionProps) {
  return (
    <Section
      spacing="lg"
      background="default"
      className={cn(backgroundClasses[background], className)}
    >
      <Container size="lg">
        {/* Section header */}
        <div className="text-center mb-12">
          <FadeIn direction="up" delay={0} distance={20}>
            <Title
              level={2}
              className={cn(
                "font-display font-bold",
                "text-2xl tablet:text-3xl desktop:text-4xl",
                "text-foreground mb-4",
              )}
            >
              {title}
            </Title>
          </FadeIn>

          {subtitle && (
            <FadeIn direction="up" delay={0.1} distance={20}>
              <p
                className={cn(
                  "font-body text-lg",
                  "text-muted-foreground",
                  "max-w-2xl mx-auto"
                )}
              >
                {subtitle}
              </p>
            </FadeIn>
          )}
        </div>

        {/* Values grid */}
        <div
          className={cn(
            "grid gap-6",
            "grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3"
          )}
        >
          {values.map((value, index) => (
            <FadeIn
              key={value.title}
              direction="up"
              delay={0.2 + index * 0.1}
              distance={30}
            >
              <ValueCard
                icon={value.icon}
                title={value.title}
                description={value.description}
                variant={cardVariant}
              />
            </FadeIn>
          ))}
        </div>
      </Container>
    </Section>
  );
}

ValuesSection.displayName = "ValuesSection";
