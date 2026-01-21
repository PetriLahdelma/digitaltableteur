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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface HomeHeroProps {
  /** ID of the section to scroll to when clicking scroll indicator */
  scrollTargetId?: string;
  /** Custom className for styling */
  className?: string;
}

export function HomeHero({
  scrollTargetId = "services",
  className,
}: HomeHeroProps) {
  const { t } = useTranslation();

  // Get the array of title options from translations
  const titleOptions = t("homeHeroGradientTitleOptions", {
    returnObjects: true,
    defaultValue: [],
  }) as string[];

  // Get the array of subtext options from translations
  const subtextOptions = t("homeHeroSubtextOptions", {
    returnObjects: true,
    defaultValue: [],
  }) as string[];

  // Use state to handle client-side random selection (avoids hydration mismatch)
  const [randomTitleIndex, setRandomTitleIndex] = useState(0);
  const [randomSubtextIndex, setRandomSubtextIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Only run on client to avoid hydration mismatch
    setRandomTitleIndex(Math.floor(Math.random() * titleOptions.length));
    setRandomSubtextIndex(Math.floor(Math.random() * subtextOptions.length));
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
                size="lg"
                asChild
                className="min-w-[160px]"
              >
                <a href="/contact" data-donny-interest="contact-cta">
                  {t("homeHeroContactCta", "Get in touch")}
                </a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="min-w-[160px]"
              >
                <a href="/about" data-donny-interest="about-cta">
                  {t("homeHeroAboutCta", "About us")}
                </a>
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
        label={t("homeHeroScrollLabel", "Scroll")}
      />
    </HeroSection>
  );
}

HomeHero.displayName = "HomeHero";
