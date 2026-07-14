"use client";

import {
  Fragment,
  useRef,
  useMemo,
  type CSSProperties,
  type ElementType,
} from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/nextjs-app/shared/lib/gsap";
import { resolveMotionPlan } from "@/nextjs-app/shared/lib/motionPolicy";
import { useAnimationContext } from "@/providers/AnimationProvider";
import styles from "./TextReveal.module.css";

type RevealType = "chars" | "words" | "lines";
type Animation = "fade" | "slide" | "wave";

export interface TextRevealProps {
  children: string;
  type?: RevealType;
  animation?: Animation;
  delay?: number;
  duration?: number;
  stagger?: number;
  threshold?: string;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
}

export function TextReveal({
  children,
  type = "words",
  animation = "fade",
  delay = 0,
  duration = 0.6,
  stagger = 0.02,
  threshold = "top 85%",
  className = "",
  style,
  as: Component = "p",
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const { motionPreference, isReady } = useAnimationContext();

  // Split text into elements based on type
  const elements = useMemo(() => {
    if (typeof children !== "string") return [];

    switch (type) {
      case "chars":
        return children.split("").map((char, i) => ({
          key: `char-${i}`,
          content: char === " " ? "\u00A0" : char, // Non-breaking space
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
  }, [children, type]);

  useGSAP(
    () => {
      if (!ref.current) return;

      const targets = ref.current.querySelectorAll("[data-reveal-item]");
      if (targets.length === 0) return;

      const setFinalState = () => {
        gsap.set(targets, {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          rotationX: 0,
          clearProps: "opacity,transform",
        });
        gsap.set(ref.current, { opacity: 1, clearProps: "opacity" });
      };

      setFinalState();

      const requestedDistance =
        animation === "slide" ? 50 : animation === "wave" ? 30 : 0;
      const motion = resolveMotionPlan({
        preference: motionPreference,
        hydrated: isReady,
        isReady,
        kind: "entrance",
        userInitiated: false,
        essential: true,
        durationMs: duration * 1000,
        distancePx: requestedDistance,
        iterations: 1,
      });
      if (!motion.animate) {
        setFinalState();
        return;
      }

      // Animation variants intentionally avoid opacity. Production page titles
      // must fail open: if GSAP, ScrollTrigger, hydration, or route changes
      // interrupt the tween, text remains fully readable instead of getting
      // stranded at a transparent "from" state.
      const animations: Record<Animation, gsap.TweenVars> = {
        fade: { y: 0 },
        slide: { y: 50, rotationX: -20 },
        wave: { y: 30, scale: 0.96 },
      };

      let hasAnimated = false;
      const playReveal = () => {
        if (hasAnimated) return;
        hasAnimated = true;

        gsap.fromTo(
          targets,
          { opacity: 1, ...animations[animation] },
          {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotationX: 0,
            clearProps: "opacity,transform",
            overwrite: "auto",
            onInterrupt: setFinalState,
            onComplete: setFinalState,
            duration: motion.durationMs / 1000,
            stagger,
            delay,
            ease: "power2.out",
          },
        );
      };

      const rect = ref.current.getBoundingClientRect();
      const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

      if (isInViewport) {
        playReveal();
        return;
      }

      const trigger = ScrollTrigger.create({
        trigger: ref.current,
        start: threshold,
        once: true,
        onEnter: playReveal,
      });

      return () => {
        trigger.kill();
        setFinalState();
      };
    },
    {
      scope: ref,
      dependencies: [
        children,
        type,
        animation,
        motionPreference,
        isReady,
        delay,
        duration,
        stagger,
        threshold,
      ],
      revertOnUpdate: true,
    },
  );

  return (
    <Component
      ref={ref}
      className={`${styles.textReveal} ${className}`.trim()}
      style={style}
    >
      {elements.map((el, index) => {
        const needsSpace = type === "words" && index < elements.length - 1;

        return (
          <Fragment key={el.key}>
            <span
              data-reveal-item
              className={type === "lines" ? styles.line : styles.inline}
            >
              {el.content}
            </span>
            {needsSpace ? " " : null}
          </Fragment>
        );
      })}
    </Component>
  );
}
