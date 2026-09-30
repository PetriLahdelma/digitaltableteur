"use client";

import { useCallback, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import Button from "@dt/Button";
import { Image } from "../../lib/imageComponent";
import { useAnimationContext } from "../../lib/animation";
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
  /** Visible label for the user-initiated reveal control. */
  playLabel?: string;
}

export function LogoReveal({
  logoSrc,
  wordmarkSrc,
  ariaLabel = "Logo",
  logoWidth = 140,
  logoHeight = 140,
  wordmarkWidth = 400,
  wordmarkHeight = 84,
  enableHover = true,
  className,
  onAnimationComplete,
  playLabel = "Play logo reveal animation",
}: LogoRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoWrapRef = useRef<HTMLDivElement>(null);
  const wordmarkMaskRef = useRef<HTMLSpanElement>(null);
  const lockupRef = useRef<HTMLDivElement>(null);
  const hoverTweenRef = useRef<gsap.core.Tween | null>(null);
  const revealTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const { motionPreference } = useAnimationContext();

  useGSAP(
    () => {
      const logoWrap = logoWrapRef.current;
      const wordmarkMask = wordmarkMaskRef.current;
      if (!logoWrap || !wordmarkMask) return;

      gsap.set(logoWrap, { opacity: 1, y: 0, x: 0, scale: 1, rotate: 0 });
      gsap.set(wordmarkMask, {
        clipPath: "inset(0 0% 0 0)",
        opacity: 1,
        x: 0,
      });
    },
    { scope: containerRef },
  );

  const playReveal = useCallback(() => {
    const logoWrap = logoWrapRef.current;
    const wordmarkMask = wordmarkMaskRef.current;
    if (!logoWrap || !wordmarkMask || motionPreference === "reduced") return;

    revealTimelineRef.current?.kill();
    gsap.set(logoWrap, { opacity: 0, y: 18, x: 0, scale: 0.97, rotate: -2 });
    gsap.set(wordmarkMask, {
      opacity: 0,
      x: -6,
      clipPath: "inset(0 100% 0 0)",
    });

    revealTimelineRef.current = gsap
      .timeline({
        defaults: { ease: "power3.out" },
        onComplete: onAnimationComplete,
      })
      .to(logoWrap, { opacity: 1, duration: 0.35 }, 0.2)
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
  }, [motionPreference, onAnimationComplete]);

  useEffect(
    () => () => {
      revealTimelineRef.current?.kill();
    },
    [],
  );

  useEffect(() => {
    if (motionPreference !== "reduced") return;

    revealTimelineRef.current?.kill();
    if (logoWrapRef.current) {
      gsap.set(logoWrapRef.current, {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        rotate: 0,
      });
    }
    if (wordmarkMaskRef.current) {
      gsap.set(wordmarkMaskRef.current, {
        clipPath: "inset(0 0% 0 0)",
        opacity: 1,
        x: 0,
      });
    }
  }, [motionPreference]);

  useEffect(() => {
    if (!enableHover) return;

    const logoWrap = logoWrapRef.current;
    if (!logoWrap) return;

    if (motionPreference === "reduced") return;

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
  }, [enableHover, motionPreference]);

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
            alt=""
            width={logoWidth}
            height={logoHeight}
            className={styles.logoImg}
            priority
          />
        </div>

        <span ref={wordmarkMaskRef} className={styles.wordmarkMask}>
          <Image
            src={wordmarkSrc}
            alt=""
            width={wordmarkWidth}
            height={wordmarkHeight}
            className={styles.wordmarkImg}
            priority
          />
        </span>
      </div>
      {motionPreference !== "reduced" && (
        <Button variant="secondary" size="sm" onClick={playReveal}>
          {playLabel}
        </Button>
      )}
    </div>
  );
}

LogoReveal.displayName = "LogoReveal";
