"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ElementType } from "react";
import { cn } from "../../../lib/cn";
import styles from "./DecodeText.module.css";

/** The hero ASCII ramp (minus space): the undecoded line reads as the same
 *  glyph field as the homepage head. */
const ASCII_RAMP = ".:-=+*#%@";
/** Glyphs that flicker at the decoding edge. */
const EDGE_GLYPHS = "▒░▓/<>.:={}#";

export interface DecodeTextProps {
  /** The final text. Screen readers always get exactly this. */
  children: string;
  as?: ElementType;
  className?: string;
  /** Seconds before decoding starts. @default 0.5 (the colour split's CSS
   *  fade is timed to the defaults) */
  delay?: number;
  /** Seconds the decode sweep takes. @default 0.9 */
  duration?: number;
  /** Characters scrambling at the decoding edge. @default 4 */
  edge?: number;
}

/** Stable per-character ASCII stand-in, identical on server and client. */
function asciiFor(char: string, index: number): string {
  if (/\s/.test(char)) return char;
  return ASCII_RAMP[(char.charCodeAt(0) + index * 7) % ASCII_RAMP.length];
}

function randomEdgeGlyph(): string {
  return EDGE_GLYPHS[Math.floor(Math.random() * EDGE_GLYPHS.length)];
}

/** The visible line at a sweep position: decoded text, a scrambling edge,
 *  then the ASCII stand-in for the rest. */
export function decodeFrame(text: string, position: number, edge: number): string {
  return Array.from(text)
    .map((char, index) => {
      if (index < position - edge) return char;
      if (/\s/.test(char)) return char;
      if (index < position) return randomEdgeGlyph();
      return asciiFor(char, index);
    })
    .join("");
}

/**
 * Text that arrives as code: it renders as ASCII glyphs, then decodes left
 * to right behind a scrambling edge, with a red/cyan split that fades as it
 * settles. The animated layer is aria-hidden; the real text is always in the
 * accessibility tree and replaces the layer when done (so it selects and
 * copies normally). Reduced motion shows the text at once.
 */
export function DecodeText({
  children: text,
  as: Tag = "p",
  className,
  delay = 0.5,
  duration = 0.9,
  edge = 4,
}: DecodeTextProps) {
  const length = Array.from(text).length;
  // -1: not started (server render and first paint show the ASCII line).
  const [position, setPosition] = useState(-1);
  const done = position >= length + edge;
  // The real text, invisible, sizes the box exactly (kerning included). Its
  // line count decides whether the code layer may wrap: a one-line final
  // never decodes across two lines.
  const sizerRef = useRef<HTMLSpanElement>(null);
  const [singleLine, setSingleLine] = useState(false);

  useLayoutEffect(() => {
    const sizer = sizerRef.current;
    if (!sizer) return;
    const measure = () => {
      const tops = new Set(
        Array.from(sizer.getClientRects()).map((rect) => Math.round(rect.top)),
      );
      setSingleLine(tops.size <= 1);
    };
    measure();
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(sizer.parentElement ?? sizer);
    return () => observer?.disconnect();
  }, [text, done]);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setPosition(length + edge);
      return;
    }
    let frame = 0;
    let last = 0;
    const start = performance.now() + delay * 1000;
    const total = length + edge;
    const tick = (now: number) => {
      // ~30 fps is enough for glyph flicker and halves the renders.
      if (now - last >= 33) {
        last = now;
        const progress = Math.min(1, Math.max(0, (now - start) / (duration * 1000)));
        setPosition(now < start ? -1 : Math.round(progress * total));
        if (progress >= 1) return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [length, edge, delay, duration]);

  if (done) {
    return <Tag className={className}>{text}</Tag>;
  }

  const shown = Math.max(0, position);
  const glyphs = Array.from(decodeFrame(text, shown, edge));
  let index = 0;

  return (
    <Tag className={cn(styles.root, className)}>
      <span ref={sizerRef} className={styles.sizer} aria-hidden="true">
        {text}
      </span>
      <span className={styles.srOnly}>{text}</span>
      {/* Undecoded glyphs sit in cells as wide as their final letters and
          words never break inside, so the layer keeps the final line's
          shape; a one-line final is also kept from wrapping. */}
      <span
        aria-hidden="true"
        className={cn(styles.layer, singleLine && styles.singleLine)}
      >
        {text.split(/(\s+)/).map((part, partIndex) => {
          if (/^\s+$/.test(part)) {
            index += Array.from(part).length;
            return part;
          }
          return (
            <span key={partIndex} className={styles.word}>
              {Array.from(part).map((char) => {
                const at = index++;
                if (at < shown - edge) return char;
                const isEdge = at < shown;
                return (
                  <span key={at} className={styles.cell}>
                    <span className={styles.ghost}>{char}</span>
                    <span
                      className={cn(styles.glyph, isEdge ? styles.edge : styles.ascii)}
                    >
                      {glyphs[at]}
                    </span>
                  </span>
                );
              })}
            </span>
          );
        })}
      </span>
    </Tag>
  );
}

DecodeText.displayName = "DecodeText";
