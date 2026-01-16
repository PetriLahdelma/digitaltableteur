"use client";

import { Fragment, useRef, useMemo, type ElementType } from "react";
import { gsap, useGSAP } from "@/nextjs-app/shared/lib/gsap";
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
  as: Component = "p",
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const { motionPreference } = useAnimationContext();

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

      // For reduced motion, just fade in the whole element
      if (motionPreference === "reduced") {
        gsap.from(ref.current, {
          opacity: 0,
          duration: 0.3,
          scrollTrigger: {
            trigger: ref.current,
            start: threshold,
          },
        });
        return;
      }

      // Animation variants
      const animations: Record<Animation, gsap.TweenVars> = {
        fade: { opacity: 0, y: 20 },
        slide: { opacity: 0, y: 50, rotationX: -20 },
        wave: { opacity: 0, y: 30, scale: 0.9 },
      };

      gsap.from(targets, {
        ...animations[animation],
        duration,
        stagger,
        delay,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ref.current,
          start: threshold,
          toggleActions: "play none none none",
        },
      });
    },
    { scope: ref, dependencies: [children, type, animation, motionPreference] }
  );

  return (
    <Component ref={ref} className={`${styles.textReveal} ${className}`.trim()}>
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
