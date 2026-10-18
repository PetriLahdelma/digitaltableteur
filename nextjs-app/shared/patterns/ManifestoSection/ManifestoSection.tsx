"use client";

import { cn } from "../../lib/cn";
import { Section } from "../../components/Section";
import { Container } from "../../components/Container";
import { FadeIn } from "../../components/animations/FadeIn";

export interface ManifestoToken {
  /** Token text content */
  text: string;
  /** A manifesto phrase; consecutive phrases are separated by `separator`. */
  phrase: boolean;
}

export interface ManifestoSectionProps {
  /** Section title */
  title: string;
  /** Array of manifesto tokens */
  tokens: ManifestoToken[];
  /** Separator character between phrases */
  separator?: string;
  /** Background variant */
  background?: "gradient" | "muted" | "transparent";
  /** Custom className */
  className?: string;
}

const backgroundClasses: Record<
  NonNullable<ManifestoSectionProps["background"]>,
  string
> = {
  gradient: cn(
    "relative overflow-hidden",
    "bg-gradient-to-br from-purple-600/80 via-purple-500/60 to-cyan-400/50",
    "before:absolute before:inset-0",
    "before:bg-[radial-gradient(circle_at_20%_25%,rgba(255,255,255,0.22),transparent_45%)]",
    "after:absolute after:inset-0",
    "after:bg-[radial-gradient(circle_at_80%_75%,rgba(113,239,255,0.18),transparent_50%)]",
  ),
  muted: "bg-muted/30",
  transparent: "bg-transparent",
};

/**
 * A static manifesto line: an intro, then phrases separated by a mark. No
 * highlight and no motion beyond the section's entrance fade.
 */
export function ManifestoSection({
  title,
  tokens,
  separator = "×",
  background = "transparent",
  className,
}: ManifestoSectionProps) {
  const isGradient = background === "gradient";
  const hasNextPhrase = (idx: number) =>
    tokens.slice(idx + 1).some((token) => token.phrase);

  return (
    <Section
      spacing="lg"
      background="default"
      className={cn(backgroundClasses[background], "isolate", className)}
    >
      <Container size="lg" className="relative z-10">
        <FadeIn direction="up" delay={0} distance={20}>
          <h2
            className={cn(
              "font-display font-bold",
              "text-xl tablet:text-2xl",
              "mb-6",
              isGradient ? "text-white" : "text-foreground",
            )}
          >
            {title}
          </h2>
        </FadeIn>

        <FadeIn direction="up" delay={0.1} distance={20}>
          {/* Plain flowing text: each mark is joined to the phrase before it
              with a no-break space, so no line starts with a stray mark. */}
          <p
            className={cn(
              "font-body",
              "text-base tablet:text-lg desktop:text-xl",
              "leading-relaxed",
              isGradient ? "text-white" : "text-foreground",
            )}
          >
            {tokens.map((token, idx) => (
              <span key={`${idx}-${token.text}`}>
                {token.text}
                {token.phrase && hasNextPhrase(idx) && (
                  <>
                    {"\u00a0"}
                    <span
                      className={cn(
                        "font-semibold",
                        isGradient ? "text-white/80" : "text-foreground/60",
                      )}
                      aria-hidden="true"
                    >
                      {separator}
                    </span>
                  </>
                )}
                {idx < tokens.length - 1 && " "}
              </span>
            ))}
          </p>
        </FadeIn>
      </Container>
    </Section>
  );
}

ManifestoSection.displayName = "ManifestoSection";
