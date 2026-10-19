"use client";

import { Fragment, useEffect, useRef } from "react";
import { cn } from "../../lib/cn";
import { useAnimationContext } from "../../lib/animation";
import { resolveMotionPlan } from "../../lib/motionPolicy";
import { Section } from "../../components/Section";
import { Container } from "../../components/Container";
import { FadeIn } from "../../components/animations/FadeIn";
import styles from "./ManifestoSection.module.css";

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
 * A manifesto in full-width display type: an intro, then phrases separated
 * by a mark, alternating bold and light. Each phrase's words rise in as the
 * phrase scrolls into view; without JavaScript, or with reduced motion, the
 * text is simply there.
 */
export function ManifestoSection({
  title,
  tokens,
  separator = "×",
  background = "transparent",
  className,
}: ManifestoSectionProps) {
  const isGradient = background === "gradient";
  const textRef = useRef<HTMLParagraphElement>(null);
  const { motionPreference, isReady } = useAnimationContext();
  const hasNextPhrase = (idx: number) =>
    tokens.slice(idx + 1).some((token) => token.phrase);
  // Alternate by phrase, not by token, so the intro never shifts the rhythm.
  const phraseIndex = (idx: number) =>
    tokens.slice(0, idx).filter((token) => token.phrase).length;

  // Reveal on scroll. The hidden state only exists once this arms the
  // paragraph, so server HTML, no-JS and reduced motion all show the text.
  // IntersectionObserver rather than a CSS view() timeline: Lenis leaves
  // view timelines stale on this site.
  useEffect(() => {
    const el = textRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const motion = resolveMotionPlan({
      preference: motionPreference,
      hydrated: isReady,
      isReady,
      kind: "scroll",
      userInitiated: false,
      essential: false,
      durationMs: 600,
      distancePx: 24,
      iterations: 1,
    });
    if (!motion.animate) return;

    const groups = Array.from(
      el.querySelectorAll<HTMLElement>(`.${styles.group}`),
    );
    // Groups already on screen when this arms stay put instead of blinking.
    for (const group of groups) {
      const r = group.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        group.classList.add(styles.shown);
      }
    }
    el.classList.add(styles.armed);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add(styles.shown);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    for (const group of groups) {
      if (!group.classList.contains(styles.shown)) observer.observe(group);
    }
    return () => {
      observer.disconnect();
      el.classList.remove(styles.armed);
      for (const group of groups) group.classList.remove(styles.shown);
    };
  }, [motionPreference, isReady, tokens]);

  return (
    <Section
      spacing="lg"
      background="default"
      className={cn(
        backgroundClasses[background],
        "isolate",
        isGradient && cn(styles.onGradient, "text-white"),
        className,
      )}
    >
      <Container size="full" className="relative z-10">
        {/* Same section header as the rest of the About page. */}
        <div className="text-center mb-12">
          <FadeIn direction="up" delay={0} distance={20}>
            <h2
              className={cn(
                "font-display font-bold",
                "text-2xl tablet:text-3xl desktop:text-4xl",
                isGradient ? "text-white" : "text-foreground",
              )}
            >
              {title}
            </h2>
          </FadeIn>
        </div>

        {/* Plain flowing text. Each phrase (with its mark) is one reveal
            group; its words are boxes so they can rise, and the mark rides in
            the last word's box, so no line starts with a stray mark. */}
        <p ref={textRef} className={styles.text}>
          {tokens.map((token, idx) => {
            const words = token.text.split(" ");
            const withMark = token.phrase && hasNextPhrase(idx);
            return (
              <Fragment key={`${idx}-${token.text}`}>
                <span
                  className={cn(
                    styles.group,
                    !token.phrase && styles.intro,
                    token.phrase && phraseIndex(idx) % 2 === 1 && styles.light,
                  )}
                >
                  {words.map((word, w) => (
                    <Fragment key={`${w}-${word}`}>
                      {w > 0 && " "}
                      <span className={styles.word}>
                        {word}
                        {/* The mark lives inside the last word's box: a
                            no-break space between two boxes still breaks in
                            WebKit, so this is what keeps them together. */}
                        {withMark && w === words.length - 1 && (
                          <>
                            {"\u00a0"}
                            <span className={styles.mark} aria-hidden="true">
                              {separator}
                            </span>
                          </>
                        )}
                      </span>
                    </Fragment>
                  ))}
                </span>
                {idx < tokens.length - 1 && " "}
              </Fragment>
            );
          })}
        </p>
      </Container>
    </Section>
  );
}

ManifestoSection.displayName = "ManifestoSection";
