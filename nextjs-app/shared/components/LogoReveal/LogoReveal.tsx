"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Image } from "../../lib/imageComponent";
import { cn } from "../../../../lib/utils";
import styles from "./LogoReveal.module.css";

gsap.registerPlugin(useGSAP);

export interface LogoRevealProps {
  /** Path to the logo icon image */
  logoSrc: string;
  /** Alt text for logo icon */
  logoAlt?: string;
  /** Path to the wordmark image */
  wordmarkSrc: string;
  /** Alt text for wordmark */
  wordmarkAlt?: string;
  /** Combined aria-label for the lockup */
  ariaLabel?: string;
  /** Logo icon width in pixels */
  logoWidth?: number;
  /** Logo icon height in pixels */
  logoHeight?: number;
  /** Wordmark width in pixels */
  wordmarkWidth?: number;
  /** Wordmark height in pixels */
  wordmarkHeight?: number;
  /** Enable hover interaction on logo */
  enableHover?: boolean;
  /** Custom className */
  className?: string;
  /** Callback when animation completes */
  onAnimationComplete?: () => void;
}

export function LogoReveal({
  logoSrc,
  logoAlt = "Logo icon",
  wordmarkSrc,
  wordmarkAlt = "Wordmark",
  ariaLabel = "Logo",
  logoWidth = 140,
  logoHeight = 140,
  wordmarkWidth = 400,
  wordmarkHeight = 84,
  enableHover = true,
  className,
  onAnimationComplete,
}: LogoRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoWrapRef = useRef<HTMLDivElement>(null);
  const wordmarkMaskRef = useRef<HTMLSpanElement>(null);
  const lockupRef = useRef<HTMLDivElement>(null);
  const hoverTweenRef = useRef<gsap.core.Tween | null>(null);

  useGSAP(
    () => {
      const logoWrap = logoWrapRef.current;
      const wordmarkMask = wordmarkMaskRef.current;
      const lockup = lockupRef.current;

      if (!logoWrap || !wordmarkMask || !lockup) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduceMotion) {
        gsap.set(logoWrap, { opacity: 1, y: 0, scale: 1, rotate: 0 });
        gsap.set(wordmarkMask, {
          clipPath: "inset(0 0% 0 0)",
          opacity: 1,
          x: 0,
        });
        onAnimationComplete?.();
        return;
      }

      // Reset function for cycling animations
      const resetElements = () => {
        gsap.set(logoWrap, { opacity: 0, y: 0, x: 0, scale: 1, rotate: 0 });
        gsap.set(wordmarkMask, {
          opacity: 0,
          x: 0,
          clipPath: "inset(0 100% 0 0)",
        });
      };

      // Reveal 1: Rise up with rotation
      const reveal1 = () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        gsap.set(logoWrap, { opacity: 0, y: 18, scale: 0.97, rotate: -2 });
        gsap.set(wordmarkMask, {
          opacity: 0,
          x: -6,
          clipPath: "inset(0 100% 0 0)",
        });

        tl.to(logoWrap, { opacity: 1, duration: 0.35 }, 0.2)
          .to(logoWrap, { y: 0, duration: 0.7 }, 0.2)
          .to(logoWrap, { scale: 1, duration: 0.85 }, 0.2)
          .to(logoWrap, { rotate: 0, duration: 0.7, ease: "power2.out" }, 0.3)
          .to(wordmarkMask, { opacity: 1, duration: 0.2 }, 1.05)
          .to(wordmarkMask, { x: 0, duration: 0.45 }, 1.05)
          .to(
            wordmarkMask,
            { clipPath: "inset(0 0% 0 0)", duration: 0.75, ease: "power2.out" },
            1.05,
          );
        return tl;
      };

      // Reveal 2: Scale pop with fade
      const reveal2 = () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        gsap.set(logoWrap, { opacity: 0, scale: 0.5, rotate: 0 });
        gsap.set(wordmarkMask, { opacity: 0, clipPath: "inset(0 0 100% 0)" });

        tl.to(logoWrap, { opacity: 1, scale: 1.05, duration: 0.4 }, 0.1)
          .to(logoWrap, { scale: 1, duration: 0.3, ease: "power2.out" }, 0.5)
          .to(wordmarkMask, { opacity: 1, duration: 0.3 }, 0.7)
          .to(
            wordmarkMask,
            { clipPath: "inset(0 0 0% 0)", duration: 0.6, ease: "power2.out" },
            0.7,
          );
        return tl;
      };

      // Reveal 3: Slide in from left
      const reveal3 = () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        gsap.set(logoWrap, { opacity: 0, x: -30, rotate: -5 });
        gsap.set(wordmarkMask, {
          opacity: 0,
          x: -20,
          clipPath: "inset(0 100% 0 0)",
        });

        tl.to(logoWrap, { opacity: 1, x: 0, duration: 0.5 }, 0.1)
          .to(logoWrap, { rotate: 0, duration: 0.4, ease: "power2.out" }, 0.2)
          .to(wordmarkMask, { opacity: 1, x: 0, duration: 0.4 }, 0.5)
          .to(
            wordmarkMask,
            { clipPath: "inset(0 0% 0 0)", duration: 0.5, ease: "power2.out" },
            0.5,
          );
        return tl;
      };

      // Reveal 4: Spin in with blur effect simulation
      const reveal4 = () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        gsap.set(logoWrap, { opacity: 0, scale: 0.8, rotate: -180 });
        gsap.set(wordmarkMask, {
          opacity: 0,
          clipPath: "inset(50% 50% 50% 50%)",
        });

        tl.to(
          logoWrap,
          {
            opacity: 1,
            scale: 1,
            rotate: 0,
            duration: 0.8,
            ease: "power2.out",
          },
          0.1,
        )
          .to(wordmarkMask, { opacity: 1, duration: 0.3 }, 0.6)
          .to(
            wordmarkMask,
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 0.5,
              ease: "power2.out",
            },
            0.6,
          );
        return tl;
      };

      const reveals = [reveal1, reveal2, reveal3, reveal4];
      let currentIndex = 0;

      const playNextReveal = () => {
        resetElements();
        const tl = reveals[currentIndex]();
        currentIndex = (currentIndex + 1) % reveals.length;
        tl.eventCallback("onComplete", () => {
          gsap.delayedCall(5, playNextReveal);
        });
      };

      // Start the cycle
      playNextReveal();
    },
    { scope: containerRef },
  );

  useEffect(() => {
    if (!enableHover) return;

    const logoWrap = logoWrapRef.current;
    if (!logoWrap) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    const handleMouseEnter = () => {
      hoverTweenRef.current?.kill();
      hoverTweenRef.current = gsap.to(logoWrap, {
        rotate: 2.2,
        duration: 0.22,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      hoverTweenRef.current?.kill();
      hoverTweenRef.current = gsap.to(logoWrap, {
        rotate: 0.6,
        duration: 0.28,
        ease: "power2.out",
      });
    };

    logoWrap.addEventListener("mouseenter", handleMouseEnter);
    logoWrap.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      logoWrap.removeEventListener("mouseenter", handleMouseEnter);
      logoWrap.removeEventListener("mouseleave", handleMouseLeave);
      hoverTweenRef.current?.kill();
    };
  }, [enableHover]);

  return (
    <div ref={containerRef} className={cn(styles.stage, className)}>
      <div
        ref={lockupRef}
        className={styles.lockup}
        aria-label={ariaLabel}
        role="img"
      >
        <div ref={logoWrapRef} className={styles.logoWrap}>
          <Image
            src={logoSrc}
            alt={logoAlt}
            width={logoWidth}
            height={logoHeight}
            className={styles.logoImg}
            priority
          />
        </div>

        <span ref={wordmarkMaskRef} className={styles.wordmarkMask}>
          <Image
            src={wordmarkSrc}
            alt={wordmarkAlt}
            width={wordmarkWidth}
            height={wordmarkHeight}
            className={styles.wordmarkImg}
            priority
          />
        </span>
      </div>
    </div>
  );
}

LogoReveal.displayName = "LogoReveal";
