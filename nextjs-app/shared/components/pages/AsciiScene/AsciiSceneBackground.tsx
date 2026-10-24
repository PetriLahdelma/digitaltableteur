"use client";

import { useEffect, useRef, useState } from "react";
import type { AsciiSceneHandle } from "./asciiSceneRenderer";
import { ASCII_SCENES, type AsciiSceneName, type AsciiScenePreset, type AsciiSceneTheme } from "./scenes";
import styles from "./AsciiSceneBackground.module.css";

/** Any CSS colour as rgb(), via a 1px canvas (tokens may be hex, rgb, oklch, ...). */
function toRgb(value: string, probe: CanvasRenderingContext2D | null): string {
  if (!probe || !value) return value;
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = "#000";
  probe.fillStyle = value;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  return `rgb(${r}, ${g}, ${b})`;
}

/** The scene's colours as they resolve at the canvas, so hero-scoped tokens apply. */
function readColors(el: HTMLElement, preset: AsciiScenePreset, probe: CanvasRenderingContext2D | null) {
  const css = getComputedStyle(el);
  const fg = toRgb(css.getPropertyValue(preset.colors.fg).trim() || css.color, probe);
  const bg = toRgb(css.getPropertyValue(preset.colors.bg).trim() || css.backgroundColor, probe);
  const theme = document.documentElement.dataset.theme ?? "";
  const strength =
    theme in preset.strength ? preset.strength[theme as AsciiSceneTheme] : preset.strength.light;
  return { fg, bg, strength };
}

export interface AsciiSceneBackgroundProps {
  /** Which bench-tuned scene to draw. */
  scene: AsciiSceneName;
  className?: string;
}

/**
 * Hero background: a 3D model rendered as ASCII that moves on its own and can
 * be dragged sideways to rotate. Decorative only.
 *
 * three.js and the model load after the page is idle, so they never compete
 * with the hero text for first paint. No WebGL, a failed load or forced
 * colours leave the plain hero background. Reduced motion holds the model still.
 */
export function AsciiSceneBackground({ scene, className }: AsciiSceneBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === "undefined") return;
    if (window.matchMedia("(forced-colors: active)").matches) return;

    const preset = ASCII_SCENES[scene];
    let probe: CanvasRenderingContext2D | null = null;
    const colors = () => {
      if (!probe) {
        const probeCanvas = document.createElement("canvas");
        probeCanvas.width = probeCanvas.height = 1;
        probe = probeCanvas.getContext("2d", { willReadFrequently: true });
      }
      return readColors(canvas, preset, probe);
    };

    let handle: AsciiSceneHandle | null = null;
    let cancelled = false;
    let visible = true;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const shouldRun = () => visible && !document.hidden && !motion.matches;

    const start = async () => {
      try {
        const { createAsciiScene } = await import("./asciiSceneRenderer");
        if (cancelled) return;
        const { fg, bg, strength } = colors();
        handle = await createAsciiScene(canvas, {
          modelUrl: preset.modelUrl,
          fg,
          bg,
          strength,
          cell: preset.cell,
          tone: preset.tone,
          light: preset.light,
          zoom: preset.zoom,
          offset: preset.offset,
          motion: preset.motion,
        });
        if (cancelled) {
          handle.destroy();
          return;
        }
        handle.setRunning(shouldRun());
        setReady(true);
      } catch {
        // No WebGL or the model failed: the hero background stands in.
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
      if (!handle) return;
      const { fg, bg, strength } = colors();
      handle.setColors(fg, bg, strength);
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
  }, [scene]);

  return (
    <canvas
      ref={canvasRef}
      className={[styles.canvas, ready ? styles.ready : "", className ?? ""].join(" ").trim()}
      aria-hidden="true"
      data-ascii-scene={scene}
    />
  );
}
