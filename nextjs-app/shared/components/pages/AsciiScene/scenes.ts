import type { AsciiSceneLight, AsciiSceneMotion, AsciiSceneTone } from "./asciiSceneRenderer";

export type AsciiSceneName = "courier" | "glove" | "notes";

/** The site's `data-theme` values. */
export type AsciiSceneTheme = "light" | "dark" | "hcb" | "hcw";

export interface AsciiScenePreset {
  modelUrl: string;
  /** Custom properties the glyphs and ground are drawn with, read at the canvas. */
  colors: { fg: string; bg: string };
  /**
   * Glyph strength per `data-theme` (0 to 1: how far glyphs move from the
   * ground towards the glyph colour). Every theme is listed so each scene is
   * tuned on its own; before the theme is known it draws at `light`.
   */
  strength: Record<AsciiSceneTheme, number>;
  cell: number;
  tone: AsciiSceneTone;
  light: AsciiSceneLight;
  zoom: number;
  /** Shift of the model in frame (scene units; the model spans about 1.6). Negative y moves it down. */
  offset?: { x: number; y: number };
  motion: AsciiSceneMotion;
}

/**
 * Scenes tuned in the ASCII bench. Wherever a scene draws light glyphs on a
 * dark ground it runs dimmer: light on dark reads much brighter than the same
 * density of ink on paper.
 */
export const ASCII_SCENES: Record<AsciiSceneName, AsciiScenePreset> = {
  /** Homepage: the data courier's head, body text on the page ground. */
  courier: {
    modelUrl: "/models/courier-head.glb",
    colors: { fg: "--color-text", bg: "--main-body-background-color" },
    strength: { light: 1, dark: 0.35, hcb: 0.35, hcw: 1 },
    cell: 8,
    tone: { contrast: 1.6, brightness: 0.02, gamma: 0.9, floor: 0 },
    light: { keyAz: 25, keyEl: 20, key: 3, rim: 2.6, ambient: 0.35 },
    zoom: 1.35,
    motion: { kind: "spin", speed: 16 },
  },
  /** About: one data glove, fingers up, turning on its own axis. */
  glove: {
    modelUrl: "/models/data-glove.glb",
    colors: { fg: "--color-primary-foreground", bg: "--color-primary" },
    // Centred behind the title and lede: held well back so the text reads.
    strength: { light: 0.25, dark: 0.4, hcb: 0.4, hcw: 0.2 },
    cell: 8,
    tone: { contrast: 1.3, brightness: 0.12, gamma: 0.7, floor: 0 },
    light: { keyAz: 25, keyEl: 35, key: 3, rim: 2.6, ambient: 0.8 },
    zoom: 1.3,
    // Fingertips clear the nav with room to breathe.
    offset: { x: 0, y: -0.16 },
    motion: { kind: "spin", speed: 14 },
  },
  /** Pricing: three creased €500 specimen notes, rocking slowly. */
  notes: {
    modelUrl: "/models/euro-notes.glb",
    colors: { fg: "--logo-color", bg: "--logo-background" },
    strength: { light: 0.65, dark: 0.35, hcb: 0.65, hcw: 0.35 },
    cell: 7,
    tone: { contrast: 2.2, brightness: 0.32, gamma: 1, floor: 1 },
    light: { keyAz: 25, keyEl: 30, key: 2.2, rim: 1.6, ambient: 0.9 },
    zoom: 1.35,
    motion: { kind: "tumble", speed: 12, sway: 40 },
  },
};
