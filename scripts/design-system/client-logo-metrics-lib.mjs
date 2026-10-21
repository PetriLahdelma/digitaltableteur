/**
 * Shared inputs for the client-logo optical sizing (build-client-logo-sizes.mjs)
 * and its freshness test. The hash covers the logo list, every logo file and
 * the tuning constants, so any change to them makes the generated CSS stale.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

export const LOGO_LIST = "nextjs-app/shared/components/ClientLogoMarquee/clientLogos.json";
export const LOGO_DIR = "public/logos/clients";
export const SIZES_CSS =
  "nextjs-app/shared/components/ClientLogoMarquee/ClientLogoMarquee.sizes.module.css";

/**
 * Logo Soup (sanity-labs/logo-soup) defaults, applied at build time:
 * width = BASE × aspect^SCALE_FACTOR, density compensation
 * (REFERENCE_DENSITY / density)^(DENSITY_FACTOR × 0.5) clamped to
 * DENSITY_CLAMP, and up to IRRADIATION × density smaller on dark grounds.
 */
export const TUNING = {
  /** Desktop content height of a square logo, in px. */
  base: 46,
  scaleFactor: 0.5,
  densityFactor: 0.5,
  referenceDensity: 0.35,
  densityClamp: [0.5, 2],
  irradiation: 0.08,
  /** Phones render at this share of the desktop size. */
  mobileScale: 0.6,
  /** Raster height for measuring, in px. */
  rasterHeight: 400,
};

export function readLogoList(root) {
  return JSON.parse(readFileSync(path.join(root, LOGO_LIST), "utf8"));
}

export function logoClassName(file) {
  return file.replace(/\.svg$/, "");
}

export function computeInputHash(root) {
  const hash = createHash("sha256");
  hash.update(JSON.stringify(TUNING));
  hash.update(readFileSync(path.join(root, LOGO_LIST)));
  for (const logo of readLogoList(root)) {
    hash.update(logo.file);
    hash.update(readFileSync(path.join(root, LOGO_DIR, logo.file)));
  }
  return hash.digest("hex").slice(0, 16);
}
