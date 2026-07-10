"use client";

import { useTranslate } from "../../lib/translation";
import { Container } from "../../components/Container";
import { Section } from "../../components/Section";
import { TextReveal } from "../../components/animations/TextReveal";
import { FadeIn } from "../../components/animations/FadeIn";
import { cn } from "../../lib/cn";

export interface WorkHeroProps {
  /** Hero title - uses i18n key "workTitle" if not provided */
  title?: string;
  /** Hero description - uses i18n key "workDescription" if not provided */
  description?: string;
  /** Section ID for anchor navigation */
  id?: string;
  /** Custom className */
  className?: string;
}

export function WorkHero({
  title,
  description,
  id = "work-hero",
  className,
}: WorkHeroProps) {
  const t = useTranslate();

  const displayTitle = title || t("workTitle", "Work");
  const displayDescription = description || t("workDescription", "Explore our portfolio of design systems, UX design and creative projects.");

  return (
    <Section
      id={id}
      spacing="hero"
      background="default"
      className={cn("relative overflow-hidden", className)}
    >
      <Container size="lg">
        <div className="max-w-3xl">
          <TextReveal
            type="words"
            animation="fade"
            duration={0.6}
            stagger={0.05}
            className={cn(
              "font-display font-bold",
              "text-4xl tablet:text-5xl desktop:text-6xl",
              "text-foreground leading-tight tracking-tight",
              "mb-6"
            )}
            as="h1"
          >
            {displayTitle}
          </TextReveal>

          {/* Description with FadeIn */}
          <FadeIn direction="up" delay={0.3} distance={30}>
            <p
              className={cn(
                "font-body text-lg tablet:text-xl",
                "text-muted-foreground",
                "max-w-2xl leading-relaxed"
              )}
            >
              {displayDescription}
            </p>
          </FadeIn>
        </div>
      </Container>
    </Section>
  );
}

WorkHero.displayName = "WorkHero";
