"use client";

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
          {/* Main headline with kinetic animation */}
          <KineticTitle
            animation="wave"
            splitBy="words"
            as="h1"
            className={cn(
              "text-4xl tablet:text-5xl desktop:text-6xl xl:text-7xl",
              "text-foreground max-w-4xl"
            )}
            stagger={0.08}
            duration={0.9}
            triggerOnScroll={false}
          >
            {t("homeHeroTitle", "Design systems that scale with your ambition")}
          </KineticTitle>

          {/* Subtitle with text reveal */}
          <TextReveal
            animation="fade"
            type="words"
            as="p"
            className={cn(
              "text-lg tablet:text-xl desktop:text-2xl",
              "text-muted-foreground max-w-2xl font-body"
            )}
            delay={0.5}
            stagger={0.03}
          >
            {t(
              "homeHeroSubtext",
              "We craft AI-native design operations and component libraries for teams building the next generation of digital products."
            )}
          </TextReveal>

          {/* CTA buttons with staggered entrance */}
          <FadeIn delay={1.2} direction="up" distance={30}>
            <Stack direction="horizontal" gap="md" align="center" wrap>
              <Button
                size="lg"
                asChild
                className="min-w-[160px]"
              >
                <a href="/contact">
                  {t("homeHeroContactCta", "Get in touch")}
                </a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="min-w-[160px]"
              >
                <a href="/about">
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
