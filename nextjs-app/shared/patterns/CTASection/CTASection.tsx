"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "../../components/Container";
import { Section } from "../../components/Section";
import { FadeIn } from "../../components/animations/FadeIn";
import { cn } from "@/lib/utils";

export interface ActionItem {
  /** Button label */
  label: string;
  /** Link URL */
  href?: string;
  /** Click handler */
  onClick?: () => void;
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
  background?: "primary" | "gradient" | "dark" | "muted";
  /** Text alignment */
  align?: "left" | "center";
  /** Custom className */
  className?: string;
  /** Section ID for navigation */
  id?: string;
}

const backgroundClasses: Record<NonNullable<CTASectionProps["background"]>, string> = {
  primary: "bg-primary text-primary-foreground",
  gradient: "bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground",
  dark: "bg-zinc-900 text-white",
  muted: "bg-muted text-foreground",
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
  const isDark = background !== "muted";

  const renderButton = (action: ActionItem, variant: "default" | "outline") => {
    const buttonVariant = isDark
      ? variant === "default"
        ? "secondary"
        : "outline"
      : variant === "default"
        ? "default"
        : "outline";

    if (action.href) {
      return (
        <Button
          variant={buttonVariant}
          size="lg"
          asChild
          className={cn(
            isDark && variant === "outline" && "border-white/30 text-white hover:bg-white/10"
          )}
        >
          <Link href={action.href}>{action.label}</Link>
        </Button>
      );
    }

    return (
      <Button
        variant={buttonVariant}
        size="lg"
        onClick={action.onClick}
        className={cn(
          isDark && variant === "outline" && "border-white/30 text-white hover:bg-white/10"
        )}
      >
        {action.label}
      </Button>
    );
  };

  return (
    <Section
      id={id}
      className={cn(
        "py-20 desktop:py-28",
        backgroundClasses[background],
        className
      )}
      aria-labelledby={`${id}-title`}
    >
      <Container size="md">
        <FadeIn direction="up">
          <div
            className={cn(
              "flex flex-col gap-6",
              align === "center" ? "items-center text-center" : "items-start text-left"
            )}
          >
            <h2
              id={`${id}-title`}
              className={cn(
                "font-display font-bold",
                "text-3xl tablet:text-4xl desktop:text-5xl",
                align === "center" && "max-w-3xl"
              )}
            >
              {title}
            </h2>

            {description && (
              <p
                className={cn(
                  "font-body text-lg",
                  isDark ? "text-white/80" : "text-muted-foreground",
                  align === "center" && "max-w-xl"
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
