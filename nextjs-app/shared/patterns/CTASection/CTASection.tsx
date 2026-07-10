"use client";

import Button, { type ButtonSurface } from "@dt/Button";
import { Container } from "../../components/Container";
import { Section } from "../../components/Section";
import { FadeIn } from "../../components/animations/FadeIn";
import { cn } from "@/lib/utils";
import styles from "./CTASection.module.css";

export interface ActionItem {
  /** Button label */
  label: string;
  /** Link URL */
  href?: string;
  /** Click handler */
  onClick?: () => void;
  /** Optional button className overrides */
  className?: string;
}

export interface CTASectionProps {
  /** Main headline */
  title: string;
  /** Supporting description */
  description?: string;
  /** Primary action button */
  primaryAction: ActionItem;
  /** Secondary action button */
  secondaryAction?: ActionItem;
  /** Background style */
  background?: "primary" | "gradient" | "dark" | "muted" | "brand";
  /** Text alignment */
  align?: "left" | "center";
  /** Custom className */
  className?: string;
  /** Section ID for navigation */
  id?: string;
  /** Donny site action target id */
  donnyTarget?: string;
}

const backgroundClasses: Record<NonNullable<CTASectionProps["background"]>, string> = {
  primary: "bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground",
  gradient: "bg-gradient-to-br from-primary via-[var(--color-primary)] to-[var(--color-primary)] text-primary-foreground",
  dark: "bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white",
  muted: "bg-muted text-foreground",
  brand: styles.brandBackground,
};

/**
 * CTASection component.
 */
export function CTASection({
  title,
  description,
  primaryAction,
  secondaryAction,
  background = "primary",
  align = "center",
  className,
  id = "cta",
  donnyTarget,
}: CTASectionProps) {
  const isDark = background !== "muted" && background !== "brand";

  const buttonSurface: ButtonSurface =
    background === "brand" ? "onBrand" : isDark ? "onDark" : "default";

  const renderButton = (action: ActionItem, variant: "default" | "outline") => {
    const dtVariant = variant === "default" ? "primary" : "secondary";

    if (action.href) {
      return (
        <Button
          href={action.href}
          variant={dtVariant}
          size="lg"
          surface={buttonSurface}
          className={action.className}
          data-donny-interest="cta-section"
        >
          {action.label}
        </Button>
      );
    }

    return (
      <Button
        variant={dtVariant}
        size="lg"
        surface={buttonSurface}
        onClick={action.onClick}
        className={action.className}
      >
        {action.label}
      </Button>
    );
  };

  return (
    <Section
      id={id}
      data-donny-target={donnyTarget}
      className={cn(
        "py-24 desktop:py-32 relative overflow-hidden",
        backgroundClasses[background],
        className
      )}
      aria-labelledby={`${id}-title`}
    >
      {/* Subtle texture overlay for premium feel (skip on brand background) */}
      {background !== "brand" && (
        <div className={styles.textureOverlay} />
      )}
      <Container size="md" className="relative z-10">
        <FadeIn direction="up">
          <div
            className={cn(
              "flex flex-col gap-8",
              align === "center" ? "items-center text-center" : "items-start text-left"
            )}
          >
            <h2
              id={`${id}-title`}
              className={cn(
                "font-display font-bold tracking-tight",
                "text-4xl tablet:text-5xl desktop:text-6xl",
                align === "center" && "max-w-4xl"
              )}
            >
              {title}
            </h2>

            {description && (
              <p
                className={cn(
                  "font-body text-xl desktop:text-2xl leading-relaxed",
                  isDark ? "text-white/80" : background === "brand" ? styles.brandDescription : "text-muted-foreground",
                  align === "center" && "max-w-2xl"
                )}
              >
                {description}
              </p>
            )}

            <div
              className={cn(
                "flex flex-wrap gap-4 mt-2",
                align === "center" && "justify-center"
              )}
            >
              {renderButton(primaryAction, "default")}
              {secondaryAction && renderButton(secondaryAction, "outline")}
            </div>
          </div>
        </FadeIn>
      </Container>
    </Section>
  );
}

CTASection.displayName = "CTASection";
