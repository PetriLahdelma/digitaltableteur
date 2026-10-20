"use client";

import { useEffect, useRef, useState } from "react";
import type { AsciiHeadHandle } from "./asciiHeadRenderer";
import styles from "./AsciiHeadBackground.module.css";

const MODEL_URL = "/models/courier-head.glb";

/**
 * Glyph strength per theme. The dark themes run dimmer: light glyphs on a
 * dark ground read much brighter than the same density of ink on paper.
 */
const STRENGTH: Record<string, number> = { dark: 0.35, hcb: 0.35 };

/** Theme colours the ASCII draws with: body text on the page background. */
function readThemeColors() {
  const root = getComputedStyle(document.documentElement);
  const body = getComputedStyle(document.body);
  const fg = root.getPropertyValue("--color-text").trim() || body.color;
  const bg = root.getPropertyValue("--main-body-background-color").trim() || body.backgroundColor;
  const strength = STRENGTH[document.documentElement.dataset.theme ?? ""] ?? 1;
  return { fg, bg, strength };
}

/**
 * Homepage hero background: a 3D head rendered as ASCII that spins a full
 * turn on its own and can be dragged sideways to rotate. Decorative only.
 *
 * three.js and the model load after the page is idle, so they never compete
 * with the hero text for first paint. No WebGL, or a failed load, leaves the
 * plain page background. Reduced motion holds the head still.
 */
export function AsciiHeadBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === "undefined") return;

    let handle: AsciiHeadHandle | null = null;
    let cancelled = false;
    let visible = true;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const shouldRun = () => visible && !document.hidden && !motion.matches;

    const start = async () => {
      try {
        const { createAsciiHead } = await import("./asciiHeadRenderer");
        if (cancelled) return;
        const { fg, bg, strength } = readThemeColors();
        handle = await createAsciiHead(canvas, {
          modelUrl: MODEL_URL,
          fg,
          bg,
          strength,
          speed: 16,
          cell: 8,
        });
        if (cancelled) {
          handle.destroy();
          return;
        }
        handle.setRunning(shouldRun());
        setReady(true);
      } catch {
        // No WebGL or the model failed: the page background stands in.
      }
    };

    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(() => void start(), { timeout: 2500 })
      : window.setTimeout(() => void start(), 1200);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      handle?.setRunning(shouldRun());
    });
    io.observe(canvas);
    const onVisibility = () => handle?.setRunning(shouldRun());
    document.addEventListener("visibilitychange", onVisibility);
    motion.addEventListener("change", onVisibility);

    // Follow theme switches (class / data-theme on <html>).
    const themeObserver = new MutationObserver(() => {
      const { fg, bg, strength } = readThemeColors();
      handle?.setColors(fg, bg, strength);
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => {
      cancelled = true;
      if (window.cancelIdleCallback && typeof idle === "number") window.cancelIdleCallback(idle);
      window.clearTimeout(idle as number);
      io.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      motion.removeEventListener("change", onVisibility);
      handle?.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={[styles.canvas, ready ? styles.ready : "", className ?? ""].join(" ").trim()}
      aria-hidden="true"
    />
  );
}
