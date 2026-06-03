"use client";

import Button from "@dt/Button";
import Title from "@dt/Title";
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

const backgroundClasses: Record<
  NonNullable<CTASectionProps["background"]>,
  string
> = {
  primary:
    "bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground",
  gradient:
    "bg-gradient-to-br from-primary via-[var(--color-primary)] to-[var(--color-primary)] text-primary-foreground",
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

  const renderButton = (action: ActionItem, variant: "default" | "outline") => {
    const dtVariant =
      variant === "default"
        ? isDark || background === "brand"
          ? "secondary"
          : "primary"
        : "tertiary";

    const buttonClassName = cn(
      isDark && variant === "default" && styles.primaryButton,
      isDark &&
        variant === "outline" &&
        "border-white bg-transparent text-white hover:bg-white/10",
      background === "brand" &&
        variant === "default" &&
        styles.brandPrimaryButton,
      background === "brand" &&
        variant === "outline" &&
        styles.brandOutlineButton,
      action.className,
    );

    if (action.href) {
      return (
        <Button
          variant={dtVariant}
          size="l"
          href={action.href}
          className={buttonClassName}
          data-donny-interest="cta-section"
        >
          {action.label}
        </Button>
      );
    }

    return (
      <Button
        variant={dtVariant}
        size="l"
        onClick={action.onClick}
        className={buttonClassName}
      >
        {action.label}
      </Button>
    );
  };

  return (
    <Section
      id={id}
      donnyTarget={donnyTarget}
      className={cn(
        "py-24 desktop:py-32 relative overflow-hidden",
        backgroundClasses[background],
        className,
      )}
      aria-labelledby={`${id}-title`}
    >
      {/* Subtle texture overlay for premium feel (skip on brand background) */}
      {background !== "brand" && <div className={styles.textureOverlay} />}
      <Container size="md" className="relative z-10">
        <FadeIn direction="up">
          <div
            className={cn(
              "flex flex-col gap-8",
              align === "center"
                ? "items-center text-center"
                : "items-start text-left",
            )}
          >
            <Title
              level={2}
              id={`${id}-title`}
              className={cn(
                "font-display font-bold tracking-tight",
                "text-4xl tablet:text-5xl desktop:text-6xl",
                align === "center" && "max-w-4xl",
              )}
            >
              {title}
            </Title>

            {description && (
              <p
                className={cn(
                  "font-body text-xl desktop:text-2xl leading-relaxed",
                  isDark
                    ? "text-white/80"
                    : background === "brand"
                      ? styles.brandDescription
                      : "text-muted-foreground",
                  align === "center" && "max-w-2xl",
                )}
              >
                {description}
              </p>
            )}

            <div
              className={cn(
                "flex flex-wrap gap-4 mt-2",
                align === "center" && "justify-center",
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
