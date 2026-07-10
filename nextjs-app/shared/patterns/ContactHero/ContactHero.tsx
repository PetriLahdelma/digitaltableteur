"use client";

import { cn } from "../../lib/cn";
import { Section } from "../../components/Section";
import { Container } from "../../components/Container";
import { TextReveal } from "../../components/animations/TextReveal";
import { FadeIn } from "../../components/animations/FadeIn";

export interface ContactHeroProps {
  /** Main title text */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Background variant */
  background?: "gradient" | "minimal";
  /** Use compact height (60-70vh instead of 80vh) */
  compact?: boolean;
  /** Custom className */
  className?: string;
}

const backgroundClasses: Record<NonNullable<ContactHeroProps["background"]>, string> = {
  gradient: "bg-gradient-to-br from-primary/10 via-background to-accent/10",
  minimal: "bg-background",
};

/**
 * ContactHero component.
 */
export function ContactHero({
  title,
  subtitle,
  background = "minimal",
  compact = true,
  className,
}: ContactHeroProps) {
  return (
    <Section
      spacing="none"
      background="default"
      className={cn(
        "relative flex items-center justify-center",
        compact ? "min-h-[60vh] desktop:min-h-[70vh]" : "min-h-[80vh]",
        backgroundClasses[background],
        className
      )}
    >
      <Container size="lg" className="relative z-10 text-center py-16">
        {/* Title with animation */}
        <TextReveal
          type="words"
          animation="fade"
          duration={0.8}
          stagger={0.06}
          className={cn(
            "font-display font-bold",
            "text-3xl tablet:text-4xl desktop:text-5xl",
            "text-foreground leading-tight tracking-tight"
          )}
          as="h1"
        >
          {title}
        </TextReveal>

        {/* Subtitle with fade in */}
        {subtitle && (
          <FadeIn direction="up" delay={0.5} distance={30}>
            <p
              className={cn(
                "font-body text-lg tablet:text-xl",
                "text-muted-foreground",
                "max-w-2xl mx-auto mt-6",
                "leading-relaxed"
              )}
            >
              {subtitle}
            </p>
          </FadeIn>
        )}
      </Container>
    </Section>
  );
}

ContactHero.displayName = "ContactHero";
