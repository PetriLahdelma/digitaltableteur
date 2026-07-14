"use client";

import { useRef, useMemo, type ElementType } from "react";
import { gsap, useGSAP } from "../../../lib/gsap";
import { useAnimationContext } from "../../../lib/animation";
import { cn } from "../../../lib/cn";

type SplitType = "chars" | "words" | "lines";
type AnimationType = "fade" | "slide" | "wave" | "scramble";

export interface KineticTitleProps {
  /** Text content to animate */
  children: string;
  /** Animation style preset */
  animation?: AnimationType;
  /** How to split the text for animation */
  splitBy?: SplitType;
  /** Stagger delay between elements (seconds) */
  stagger?: number;
  /** Animation duration per element (seconds) */
  duration?: number;
  /** Initial delay before animation starts (seconds) */
  delay?: number;
  /** ScrollTrigger threshold (e.g., "top 85%") */
  threshold?: string;
  /** Custom className for styling */
  className?: string;
  /** Semantic HTML element to render */
  as?: ElementType;
  /** Trigger animation on scroll (true) or on mount (false) */
  triggerOnScroll?: boolean;
}

// Scramble text effect helper
const scrambleText = (el: HTMLElement, finalText: string, duration: number) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let iteration = 0;
  const totalIterations = duration * 30; // ~30fps for scramble

  const interval = setInterval(() => {
    el.textContent = finalText
      .split("")
      .map((char, index) => {
        if (char === " ") return " ";
        if (index < iteration / (totalIterations / finalText.length)) {
          return finalText[index];
        }
        return chars[Math.floor(Math.random() * chars.length)];
      })
      .join("");

    iteration++;
    if (iteration >= totalIterations) {
      clearInterval(interval);
      el.textContent = finalText;
    }
  }, 1000 / 30);

  return interval;
};

export function KineticTitle({
  children,
  animation = "fade",
  splitBy = "words",
  stagger = 0.05,
  duration = 0.8,
  delay = 0,
  threshold = "top 85%",
  className = "",
  as: Component = "h1",
  triggerOnScroll = true,
}: KineticTitleProps) {
  const ref = useRef<HTMLElement>(null);
  const { motionPreference } = useAnimationContext();

  // Split text into elements based on splitBy
  const elements = useMemo(() => {
    if (typeof children !== "string") return [];

    switch (splitBy) {
      case "chars":
        return children.split("").map((char, i) => ({
          key: `char-${i}`,
          content: char === " " ? "\u00A0" : char,
          isSpace: char === " ",
        }));
      case "words":
        return children.split(" ").map((word, i) => ({
          key: `word-${i}`,
          content: word,
          isSpace: false,
        }));
      case "lines":
        return children.split("\n").map((line, i) => ({
          key: `line-${i}`,
          content: line,
          isSpace: false,
        }));
      default:
        return [];
    }
  }, [children, splitBy]);

  useGSAP(
    () => {
      if (!ref.current) return;

      const targets = ref.current.querySelectorAll("[data-kinetic-item]");
      if (targets.length === 0) return;

      const scrambleIntervals: Array<ReturnType<typeof setInterval>> = [];

      // For reduced motion, snap targets to their final visible state instead
      // of running any tween. Partial-opacity frames otherwise misreport as
      // color-contrast failures in the matrix axe runs. motionPreference is the
      // single source of truth (AnimationProvider tracks the media query), so no
      // redundant window.matchMedia fallback is needed.
      if (motionPreference === "reduced") {
        gsap.set(targets, { opacity: 1, x: 0, y: 0, scale: 1, rotationX: 0 });
        gsap.set(ref.current, { opacity: 1 });
        return () => {
          scrambleIntervals.forEach((interval) => clearInterval(interval));
        };
      }

      // Animation variants
      const animations: Record<AnimationType, gsap.TweenVars> = {
        fade: {
          opacity: 0,
          y: 30,
        },
        slide: {
          opacity: 0,
          y: 80,
          rotationX: -15,
        },
        wave: {
          opacity: 0,
          y: 40,
          scale: 0.8,
        },
        scramble: {
          opacity: 0,
        },
      };

      // Handle scramble animation separately
      if (animation === "scramble") {
        gsap.set(targets, { opacity: 1 });

        const timeline = gsap.timeline({
          delay,
          ...(triggerOnScroll && {
            scrollTrigger: {
              trigger: ref.current,
              start: threshold,
              toggleActions: "play none none none",
            },
          }),
        });

        targets.forEach((target, index) => {
          const el = target as HTMLElement;
          const originalText = el.textContent || "";
          el.textContent = "";

          timeline.add(() => {
            const interval = scrambleText(el, originalText, duration);
            scrambleIntervals.push(interval);
          }, index * stagger);
        });

        return () => {
          scrambleIntervals.forEach((interval) => clearInterval(interval));
        };
      }

      // Standard animations (fade, slide, wave)
      gsap.from(targets, {
        ...animations[animation],
        duration,
        stagger,
        delay,
        ease: animation === "wave" ? "elastic.out(1, 0.5)" : "power3.out",
        ...(triggerOnScroll && {
          scrollTrigger: {
            trigger: ref.current,
            start: threshold,
            toggleActions: "play none none none",
          },
        }),
      });
      return () => {
        scrambleIntervals.forEach((interval) => clearInterval(interval));
      };
    },
    {
      scope: ref,
      dependencies: [
        children,
        animation,
        splitBy,
        motionPreference,
        triggerOnScroll,
        delay,
        duration,
        stagger,
        threshold,
      ],
    }
  );

  return (
    <Component
      ref={ref}
      className={cn(
        "font-display font-bold tracking-tight",
        splitBy === "lines" ? "flex flex-col" : "flex flex-wrap justify-center",
        className
      )}
    >
      {elements.map((el, index) => (
        <span
          key={el.key}
          data-kinetic-item
          className={cn(
            "inline-block",
            splitBy === "chars" && "whitespace-pre",
            splitBy === "words" && index < elements.length - 1 && "mr-[0.25em]"
          )}
          style={{ perspective: "1000px" }}
        >
          {el.content}
        </span>
      ))}
    </Component>
  );
}

KineticTitle.displayName = "KineticTitle";
