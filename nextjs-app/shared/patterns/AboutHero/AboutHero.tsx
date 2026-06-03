"use client";

import { cn } from "@/lib/utils";
import { Section } from "../../components/Section";
import { Container } from "../../components/Container";
import { TextReveal } from "../../components/animations/TextReveal";
import { FadeIn } from "../../components/animations/FadeIn";
import { ScrollIndicator } from "../../components/ScrollIndicator";

export interface AboutHeroProps {
  /** Main title text */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Background variant */
  background?: "gradient" | "image" | "minimal";
  /** Background image URL (for image variant) */
  backgroundImage?: string;
  /** Show scroll indicator at bottom */
  showScrollIndicator?: boolean;
  /** Custom className */
  className?: string;
}

const backgroundClasses: Record<
  NonNullable<AboutHeroProps["background"]>,
  string
> = {
  gradient: "bg-gradient-to-br from-primary/10 via-background to-accent/10",
  image: "bg-cover bg-center bg-no-repeat",
  minimal: "bg-background",
};

export function AboutHero({
  title,
  subtitle,
  background = "minimal",
  backgroundImage,
  showScrollIndicator = true,
  className,
}: AboutHeroProps) {
  const isImageBackground = background === "image" && backgroundImage;

  return (
    <Section
      spacing="none"
      background="default"
      className={cn(
        "relative min-h-[80vh] flex items-center justify-center",
        !isImageBackground && backgroundClasses[background],
        className,
      )}
    >
      {/* Background image layer */}
      {isImageBackground && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}

      {/* Overlay for image background */}
      {isImageBackground && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      )}

      <Container size="lg" className="relative z-10 text-center py-16">
        {/* Title with animation */}
        <TextReveal
          type="words"
          animation="fade"
          duration={0.8}
          stagger={0.06}
          className={cn(
            "font-display font-bold",
            "text-4xl tablet:text-5xl desktop:text-6xl",
            "text-foreground leading-tight tracking-tight",
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
                "font-body text-lg tablet:text-xl desktop:text-2xl",
                "text-muted-foreground",
                "max-w-2xl mx-auto mt-6",
                "leading-relaxed",
              )}
            >
              {subtitle}
            </p>
          </FadeIn>
        )}
      </Container>

      {/* Scroll indicator */}
      {showScrollIndicator && <ScrollIndicator className="z-20" />}
    </Section>
  );
}

AboutHero.displayName = "AboutHero";
