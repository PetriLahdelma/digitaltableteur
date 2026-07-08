"use client";

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { cn } from "../../lib/cn";
import { Section } from "../../components/Section";
import { Container } from "../../components/Container";
import { FadeIn } from "../../components/animations/FadeIn";
import { gsap } from "../../lib/gsap";
import { useAnimationContext } from "../../lib/animation";

export interface ManifestoToken {
  /** Token text content */
  text: string;
  /** Whether this token can be highlighted */
  highlightable: boolean;
}

export interface ManifestoSectionProps {
  /** Section title */
  title: string;
  /** Array of manifesto tokens */
  tokens: ManifestoToken[];
  /** Cycling interval in milliseconds */
  interval?: number;
  /** Separator character between highlightable tokens */
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
    "after:bg-[radial-gradient(circle_at_80%_75%,rgba(113,239,255,0.18),transparent_50%)]"
  ),
  muted: "bg-muted/30",
  transparent: "bg-transparent",
};

export function ManifestoSection({
  title,
  tokens,
  interval = 2400,
  separator = "✕",
  background = "transparent",
  className,
}: ManifestoSectionProps) {
  const { motionPreference } = useAnimationContext();

  // Refs for GSAP animation targets
  const tokenRefs = useRef<Map<number, HTMLSpanElement>>(new Map());
  const prevActiveRef = useRef<number | null>(null);
  const pulseRef = useRef<gsap.core.Tween | null>(null);

  // Set ref for each token element
  const setTokenRef = useCallback(
    (idx: number, el: HTMLSpanElement | null) => {
      if (el) tokenRefs.current.set(idx, el);
      else tokenRefs.current.delete(idx);
    },
    []
  );

  // Get indices of highlightable tokens
  const highlightableIndices = useMemo(
    () =>
      tokens
        .map((token, idx) => (token.highlightable ? idx : -1))
        .filter((idx) => idx >= 0),
    [tokens]
  );

  // Track the currently active highlight index
  const [activeIdx, setActiveIdx] = useState<number | null>(
    highlightableIndices[0] ?? null
  );

  // Cycle through highlights randomly
  useEffect(() => {
    if (!highlightableIndices.length || motionPreference === "reduced") return;

    let current = highlightableIndices[0];
    const id = window.setInterval(() => {
      let next = current;
      if (highlightableIndices.length > 1) {
        while (next === current) {
          next =
            highlightableIndices[
              Math.floor(Math.random() * highlightableIndices.length)
            ];
        }
      }
      current = next;
      setActiveIdx(next);
    }, interval);

    return () => window.clearInterval(id);
  }, [highlightableIndices, interval, motionPreference]);

  // GSAP animation for token transitions
  useEffect(() => {
    if (motionPreference === "reduced" || activeIdx === null) return;

    const prevIdx = prevActiveRef.current;
    prevActiveRef.current = activeIdx;

    // Kill previous pulse animation
    if (pulseRef.current) {
      pulseRef.current.kill();
      pulseRef.current = null;
    }

    // Animate out previous active token
    if (prevIdx !== null && prevIdx !== activeIdx) {
      const prevEl = tokenRefs.current.get(prevIdx);
      if (prevEl) {
        gsap.to(prevEl, {
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    }

    // Animate in new active token
    const activeEl = tokenRefs.current.get(activeIdx);
    // The pulse spawns at the END of an async onComplete chain (~0.8s in). A
    // plain pulseRef cleanup misses it: when the reduced-motion preference
    // flips right after mount, cleanup runs while pulseRef is still null and
    // the pending chain creates the infinite pulse afterwards. Guard the chain
    // with a cancelled flag and kill in-flight tweens in cleanup.
    let cancelled = false;
    if (activeEl) {
      gsap.fromTo(
        activeEl,
        { scale: 0.92, y: 2 },
        {
          scale: 1.05,
          y: -1,
          duration: 0.5,
          ease: "elastic.out(1, 0.4)",
          onComplete: () => {
            if (cancelled) return;
            // Settle back and start pulse
            gsap.to(activeEl, {
              scale: 1,
              y: 0,
              duration: 0.3,
              ease: "power2.out",
              onComplete: () => {
                if (cancelled) return;
                // Continuous gentle pulse on active token
                pulseRef.current = gsap.to(activeEl, {
                  scale: 1.02,
                  duration: 1.2,
                  ease: "sine.inOut",
                  yoyo: true,
                  repeat: -1,
                });
              },
            });
          },
        }
      );
    }

    // Cleanup on unmount and on preference/active changes
    return () => {
      cancelled = true;
      if (activeEl) {
        gsap.killTweensOf(activeEl);
      }
      if (pulseRef.current) {
        pulseRef.current.kill();
        pulseRef.current = null;
      }
    };
  }, [activeIdx, motionPreference]);

  // Check if there are more highlightable tokens after current index
  const hasNextHighlightable = useCallback(
    (currentIdx: number) => {
      return tokens.slice(currentIdx + 1).some((t) => t.highlightable);
    },
    [tokens]
  );

  const isGradient = background === "gradient";

  return (
    <Section
      spacing="lg"
      background="default"
      className={cn(backgroundClasses[background], "isolate", className)}
    >
      <Container size="lg" className="relative z-10">
        {/* Title */}
        <FadeIn direction="up" delay={0} distance={20}>
          <h2
            className={cn(
              "font-display font-bold",
              "text-xl tablet:text-2xl",
              "mb-6",
              isGradient ? "text-white" : "text-foreground"
            )}
          >
            {title}
          </h2>
        </FadeIn>

        {/* Manifesto tokens */}
        <FadeIn direction="up" delay={0.1} distance={20}>
          <p
            className={cn(
              "flex flex-wrap gap-2",
              "font-body",
              "text-base tablet:text-lg desktop:text-xl",
              "leading-relaxed",
              isGradient ? "text-white" : "text-foreground"
            )}
          >
            {tokens.map((token, idx) => {
              const isActive = token.highlightable && activeIdx === idx;
              const showSeparator =
                token.highlightable && hasNextHighlightable(idx);

              return (
                <span key={`${idx}-${token.text}`} className="contents">
                  <span
                    ref={(el) => setTokenRef(idx, el)}
                    className={cn(
                      "inline-flex items-center",
                      "px-1.5 py-0.5",
                      "rounded-md",
                      "transition-colors duration-200 ease-out",
                      isActive && [
                        isGradient
                          ? "bg-white text-purple-700"
                          : "bg-primary text-primary-foreground",
                        "shadow-sm",
                      ]
                    )}
                    aria-live="off"
                  >
                    {token.text}
                  </span>
                  {showSeparator && (
                    <span
                      className={cn(
                        "inline-flex items-center",
                        "px-1",
                        "font-semibold",
                        isGradient
                          ? "text-white/80"
                          : "text-foreground/60"
                      )}
                      aria-hidden="true"
                    >
                      {separator}
                    </span>
                  )}
                </span>
              );
            })}
          </p>
        </FadeIn>
      </Container>
    </Section>
  );
}

ManifestoSection.displayName = "ManifestoSection";
