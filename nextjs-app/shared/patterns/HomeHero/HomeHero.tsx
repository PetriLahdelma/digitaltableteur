"use client";

import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { HeroSection } from "../HeroSection";
import { HeroBackground } from "../../components/HeroBackground";
import { KineticTitle } from "../../components/animations/KineticTitle";
import { TextReveal } from "../../components/animations/TextReveal";
import { FadeIn } from "../../components/animations/FadeIn";
import { ScrollIndicator } from "../../components/ScrollIndicator";
import { Container } from "../../components/Container";
import { Stack } from "../../components/Stack";
import { Button } from "@digitaltableteur/react";
import { cn } from "@/lib/utils";

function pickRandomIndex(length: number): number {
  if (length <= 1) return 0;
  return Math.floor(Math.random() * length);
}

function readTranslationList(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export interface HomeHeroProps {
  /** ID of the section to scroll to when clicking scroll indicator */
  scrollTargetId?: string;
  /** Custom className for styling */
  className?: string;
}

/**
 * HomeHero component.
 */
export function HomeHero({
  scrollTargetId = "services",
  className,
}: HomeHeroProps) {
  const { t } = useTranslation();

  const titleOptions = useMemo(
    () =>
      readTranslationList(
        t("homeHeroGradientTitleOptions", {
          returnObjects: true,
          defaultValue: [],
        }),
      ),
    [t],
  );

  const subtextOptions = useMemo(
    () =>
      readTranslationList(
        t("homeHeroSubtextOptions", {
          returnObjects: true,
          defaultValue: [],
        }),
      ),
    [t],
  );

  // Use state to handle client-side random selection (avoids hydration mismatch)
  const [randomTitleIndex, setRandomTitleIndex] = useState(0);
  const [randomSubtextIndex, setRandomSubtextIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setRandomTitleIndex(pickRandomIndex(titleOptions.length));
    setRandomSubtextIndex(pickRandomIndex(subtextOptions.length));
    setIsClient(true);
  }, [titleOptions.length, subtextOptions.length]);

  // Select the hero title - use random option if available, otherwise fallback
  const heroTitle = useMemo(() => {
    if (isClient && titleOptions.length > 0) {
      return titleOptions[randomTitleIndex];
    }
    // Fallback for SSR or if no options available
    return t("homeHeroTitle", "Design systems that scale with your ambition");
  }, [isClient, titleOptions, randomTitleIndex, t]);

  // Select the hero subtext - use random option if available, otherwise fallback
  const heroSubtext = useMemo(() => {
    if (isClient && subtextOptions.length > 0) {
      return subtextOptions[randomSubtextIndex];
    }
    // Fallback for SSR or if no options available
    return t("homeHeroSubtext", "From concept to code, we craft human-centered GenAI experiences.");
  }, [isClient, subtextOptions, randomSubtextIndex, t]);

  return (
    <HeroSection
      minHeight="screen"
      background="transparent"
      align="center"
      justify="center"
      className={cn("text-center", className)}
      ariaLabel={t("homeHeroAriaLabel", "Homepage hero section")}
    >
      {/* Animated background */}
      <HeroBackground variant="gradient" animate colorScheme="primary" />

      {/* Content */}
      <Container size="lg" className="relative z-10 py-20">
        <Stack
          direction="vertical"
          gap="lg"
          align="center"
          justify="center"
          className="min-h-[60vh]"
          aria-live="polite"
          aria-atomic="true"
        >
          {/* Main headline with kinetic animation - bold, premium typography */}
          {/* Key forces remount when title changes to ensure animation plays correctly */}
          <KineticTitle
            key={heroTitle}
            animation="wave"
            splitBy="words"
            as="h1"
            className={cn(
              "text-5xl tablet:text-6xl desktop:text-7xl xl:text-8xl 2xl:text-9xl",
              "text-foreground max-w-5xl tracking-tight leading-[0.95]"
            )}
            stagger={0.06}
            duration={1}
            triggerOnScroll={false}
          >
            {heroTitle}
          </KineticTitle>

          {/* Subtitle with text reveal - randomly selected on mount */}
          <TextReveal
            key={heroSubtext}
            animation="fade"
            type="words"
            as="p"
            className={cn(
              "text-xl tablet:text-2xl desktop:text-3xl",
              "text-foreground/70 max-w-3xl font-body leading-relaxed"
            )}
            delay={0.5}
            stagger={0.03}
          >
            {heroSubtext}
          </TextReveal>

          {/* CTA buttons with staggered entrance */}
          <FadeIn delay={1.2} direction="up" distance={30}>
            <Stack direction="horizontal" gap="md" align="center" wrap>
              <Button
                href="/contact"
                variant="primary"
                size="lg"
                className="min-w-[160px]"
                data-donny-interest="contact-cta"
              >
                {t("homeHeroContactCta", "Get in touch")}
              </Button>
              <Button
                href="/about"
                variant="secondary"
                size="lg"
                className="min-w-[160px]"
                data-donny-interest="about-cta"
              >
                {t("homeHeroAboutCta", "About us")}
              </Button>
            </Stack>
          </FadeIn>
        </Stack>
      </Container>

      {/* Scroll indicator */}
      <ScrollIndicator
        targetId={scrollTargetId}
        variant="chevron"
        position="center"
        label={t("homeHeroScrollLabel", "Scroll to services")}
      />
    </HeroSection>
  );
}

HomeHero.displayName = "HomeHero";
