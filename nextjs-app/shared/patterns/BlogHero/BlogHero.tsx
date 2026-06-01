"use client";

import { useTranslation } from "react-i18next";
import { Container } from "../../components/Container";
import { Section } from "../../components/Section";
import { TextReveal } from "../../components/animations/TextReveal";
import { FadeIn } from "../../components/animations/FadeIn";
import { ScrollIndicator } from "../../components/ScrollIndicator";
import { cn } from "@/lib/utils";

export interface BlogHeroProps {
  /** Hero title - uses i18n key "blogHeroTitle" if not provided */
  title?: string;
  /** Hero subtitle - uses i18n key "blogHeroSubtitle" if not provided */
  subtitle?: string;
  /** Show scroll indicator at bottom */
  showScrollIndicator?: boolean;
  /** Target ID for scroll indicator */
  scrollTargetId?: string;
  /** Hero variant */
  variant?: "full" | "compact";
  /** Section ID for anchor navigation */
  id?: string;
  /** Custom className */
  className?: string;
}

export function BlogHero({
  title,
  subtitle,
  showScrollIndicator = false,
  scrollTargetId = "blog-content",
  variant = "compact",
  id = "blog-hero",
  className,
}: BlogHeroProps) {
  const { t } = useTranslation();

  const displayTitle = title || t("blogHeroTitle", "Blog");
  const displaySubtitle =
    subtitle ||
    t(
      "blogHeroSubtitle",
      "Thoughts on design, development, and everything in between"
    );

  const isFullHeight = variant === "full";

  return (
    <Section
      id={id}
      spacing={isFullHeight ? "none" : "hero"}
      background="default"
      className={cn(
        "relative overflow-hidden",
        isFullHeight && "min-h-[60vh] flex items-center",
        className
      )}
    >
      <Container size="md" className={isFullHeight ? "py-24" : undefined}>
        <div>
          {/* Title with TextReveal animation */}
          <TextReveal
            type="words"
            animation="fade"
            duration={0.6}
            stagger={0.05}
            className={cn(
              "font-display font-bold",
              "text-4xl tablet:text-5xl desktop:text-6xl",
              "text-foreground leading-tight tracking-tight",
              "mb-4"
            )}
            as="h1"
          >
            {displayTitle}
          </TextReveal>

          {/* Subtitle with FadeIn */}
          <FadeIn direction="up" delay={0.3} distance={30}>
            <p
              className={cn(
                "font-body text-lg tablet:text-xl",
                "text-muted-foreground",
                "leading-relaxed"
              )}
            >
              {displaySubtitle}
            </p>
          </FadeIn>
        </div>
      </Container>

      {/* Scroll indicator */}
      {showScrollIndicator && (
        <ScrollIndicator
          targetId={scrollTargetId}
          variant="chevron"
          position="center"
          label={t("scrollToContent", "Scroll")}
        />
      )}
    </Section>
  );
}

BlogHero.displayName = "BlogHero";
