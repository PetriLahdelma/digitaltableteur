"use client";

import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "./useMediaQuery";

export type StreamingTextSpeed = "natural" | "fast" | "instant";

export interface UseStreamingTextOptions {
  /** Reveal cadence. Instant also disables the animation loop. */
  speed?: StreamingTextSpeed;
}

type StreamingTextStep = {
  nextLength: number;
  delayMs: number;
};

const graphemeSegmenter =
  typeof Intl !== "undefined" && typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;

function alignToGraphemeBoundary(targetText: string, desiredLength: number) {
  const clamped = Math.min(targetText.length, Math.max(0, desiredLength));
  if (clamped === 0 || clamped === targetText.length) return clamped;

  const containing = graphemeSegmenter
    ?.segment(targetText)
    .containing(clamped - 1);
  if (containing) {
    return containing.index + containing.segment.length;
  }

  // Intl.Segmenter is part of the supported browser baseline. This fallback
  // still prevents the most damaging split when embedded in an older host.
  const previous = targetText.charCodeAt(clamped - 1);
  const next = targetText.charCodeAt(clamped);
  return previous >= 0xd800 &&
    previous <= 0xdbff &&
    next >= 0xdc00 &&
    next <= 0xdfff
    ? clamped + 1
    : clamped;
}

function planStreamingTextStep(
  targetText: string,
  currentLength: number,
  speed: Exclude<StreamingTextSpeed, "instant">,
): StreamingTextStep {
  const remaining = Math.max(0, targetText.length - currentLength);
  if (remaining === 0) {
    return { nextLength: targetText.length, delayMs: 16 };
  }

  const step =
    speed === "fast"
      ? Math.max(8, Math.floor(remaining * 0.35))
      : Math.max(2, Math.floor(Math.log2(remaining + 1) * 1.8));
  const delayMs =
    speed === "fast" ? 8 : remaining > 50 ? 12 : remaining > 15 ? 24 : 45;

  return {
    nextLength: alignToGraphemeBoundary(
      targetText,
      Math.min(targetText.length, currentLength + step),
    ),
    delayMs,
  };
}

/**
 * Smooth accumulated streamed text into a steady, adaptive reveal.
 *
 * Pass the complete accumulated string on every update. The hook catches up
 * quickly after large bursts, remains responsive to sparse chunks, never cuts
 * through a grapheme cluster, and returns the complete target immediately when
 * streaming ends or reduced motion is preferred.
 */
export function useStreamingText(
  targetText: string,
  isStreaming: boolean,
  options: UseStreamingTextOptions = {},
): string {
  const speed = options.speed ?? "natural";
  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)",
  );
  const shouldReveal =
    isStreaming && speed !== "instant" && !prefersReducedMotion;

  const [displayedText, setDisplayedText] = useState(() =>
    shouldReveal ? "" : targetText,
  );
  const targetRef = useRef(targetText);
  const displayedRef = useRef(displayedText);
  const previousStreamingRef = useRef(isStreaming);
  const lastUpdateRef = useRef(Number.NEGATIVE_INFINITY);

  targetRef.current = targetText;
  const streamStarted = isStreaming && !previousStreamingRef.current;

  useEffect(() => {
    previousStreamingRef.current = isStreaming;
    if (streamStarted) {
      displayedRef.current = "";
      lastUpdateRef.current = Number.NEGATIVE_INFINITY;
      setDisplayedText("");
      return;
    }

    if (!isStreaming || speed === "instant" || prefersReducedMotion) {
      displayedRef.current = targetText;
      setDisplayedText(targetText);
      return;
    }

    if (!targetText.startsWith(displayedRef.current)) {
      displayedRef.current = "";
      lastUpdateRef.current = Number.NEGATIVE_INFINITY;
      setDisplayedText("");
    }
  }, [isStreaming, prefersReducedMotion, speed, streamStarted, targetText]);

  useEffect(() => {
    if (!shouldReveal) return;
    if (typeof requestAnimationFrame !== "function") {
      displayedRef.current = targetRef.current;
      setDisplayedText(targetRef.current);
      return;
    }

    let frameId = 0;
    const tick = (now: number) => {
      const target = targetRef.current;
      let visible = displayedRef.current;

      if (!target.startsWith(visible)) {
        visible = "";
        displayedRef.current = "";
        lastUpdateRef.current = Number.NEGATIVE_INFINITY;
        setDisplayedText("");
      }

      if (visible.length < target.length) {
        const plan = planStreamingTextStep(target, visible.length, speed);
        if (now - lastUpdateRef.current >= plan.delayMs) {
          const next = target.slice(0, plan.nextLength);
          displayedRef.current = next;
          lastUpdateRef.current = now;
          setDisplayedText(next);
        }
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [shouldReveal, speed]);

  if (!shouldReveal) return targetText;
  if (streamStarted || !targetText.startsWith(displayedText)) return "";
  return displayedText;
}
