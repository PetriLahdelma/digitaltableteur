"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
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
}

const backgroundClasses: Record<NonNullable<CTASectionProps["background"]>, string> = {
  primary: "bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground",
  gradient: "bg-gradient-to-br from-primary via-[#4400ff] to-[#0066ff] text-primary-foreground",
  dark: "bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white",
  muted: "bg-muted text-foreground",
  brand: styles.brandBackground,
};

export function CTASection({
  title,
  description,
  primaryAction,
  secondaryAction,
  background = "primary",
  align = "center",
  className,
  id = "cta",
}: CTASectionProps) {
  const isDark = background !== "muted" && background !== "brand";

  const renderButton = (action: ActionItem, variant: "default" | "outline") => {
    const buttonVariant = isDark
      ? variant === "default"
        ? "secondary"
        : "outline"
      : variant === "default"
        ? "default"
        : "outline";

    const buttonClassName = cn(
      // Primary button with theme-aware colors via CSS module
      isDark && variant === "default" && styles.primaryButton,
      // Outline variant - same across all dark themes
      isDark && variant === "outline" && "border-white bg-transparent text-white hover:bg-white/10",
      // Brand variant buttons - dark on yellow
      background === "brand" && variant === "default" && styles.brandPrimaryButton,
      background === "brand" && variant === "outline" && styles.brandOutlineButton,
      action.className
    );

    if (action.href) {
      return (
        <Button
          variant={buttonVariant}
          size="lg"
          asChild
          className={buttonClassName}
        >
          <Link href={action.href} data-donny-interest="cta-section">{action.label}</Link>
        </Button>
      );
    }

    return (
      <Button
        variant={buttonVariant}
        size="lg"
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
      className={cn(
        "py-24 desktop:py-32 relative overflow-hidden",
        backgroundClasses[background],
        className
      )}
      aria-labelledby={`${id}-title`}
    >
      {/* Subtle texture overlay for premium feel (skip on brand background) */}
      {background !== "brand" && (
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-30 pointer-events-none mix-blend-overlay" />
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
