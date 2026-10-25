#!/usr/bin/env node
/**
 * Optical sizing for the homepage client logos.
 *
 * Equal heights make wide wordmarks tiny and dense marks shout, so every logo
 * is measured and sized by the Logo Soup method (sanity-labs/logo-soup),
 * run here at build time with sharp instead of on a canvas in the browser:
 *
 * 1. Content box: the ink's bounding box, ignoring padding in the SVG.
 * 2. Shape: content width = base × aspect^0.5, so wide and tall logos get
 *    about the same area.
 * 3. Density: ink coverage of the content box; dense logos shrink and light
 *    ones grow by (0.35 / density)^0.25, clamped to 0.5–2.
 * 4. Manual correction: `optical` in clientLogos.json, for marks the formula
 *    misjudges (Kesko's bars inflate its box, Process Genius's thin ring and
 *    wide wordmark read as light, Aalto's "A!" stays loud).
 * 5. Dark grounds: light-on-dark ink looks bigger, so up to 8% × density off.
 * 6. Visual centre: a vertical nudge so the ink's centre of mass, not the
 *    file's box, sits on the row's centre line.
 *
 * Writes ClientLogoMarquee.sizes.module.css, a sprite of every logo as an SVG
 * <symbol> (public/logos/client-logo-sprite.svg) and the sprite's versioned
 * URL (clientLogoSprite.generated.ts). One sprite request, discovered while
 * the HTML parses and cached immutably, replaces 21 lazy image requests that
 * only started as each logo neared the viewport and failed on a dropped
 * connection. Each logo also gets a fixed aspect ratio, so the lane has its
 * final width before paint and never re-lays out while it moves. Run after
 * adding or changing a logo: npm run build:logo-sizes.
 * ClientLogoMarquee.sizes.test.ts fails while any output is stale.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import {
  LOGO_DIR,
  SIZES_CSS,
  SPRITE_SVG,
  SPRITE_TS,
  TUNING,
  computeInputHash,
  logoClassName,
  readLogoList,
} from "./client-logo-metrics-lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/** Ink strength of one RGBA pixel: opaque and dark counts, white counters do not. */
function ink(data, i) {
  const alpha = data[i + 3];
  if (alpha <= 10) return 0;
  const luminance =
    (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
  const value = (alpha / 255) * (1 - luminance);
  return value > 0.04 ? value : 0;
}

async function measure(file) {
  const { data, info } = await sharp(path.join(root, LOGO_DIR, file), { density: 300 })
    .resize({ height: TUNING.rasterHeight })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (ink(data, (y * width + x) * 4)) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }
  if (maxX < 0) throw new Error(`${file}: no visible ink`);

  let filled = 0;
  let mass = 0;
  let massY = 0;
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const value = ink(data, (y * width + x) * 4);
      if (value) {
        filled++;
        mass += value;
        massY += (y + 0.5) * value;
      }
    }
  }

  const contentWidth = maxX - minX + 1;
  const contentHeight = maxY - minY + 1;
  return {
    rasterHeight: height,
    contentHeight,
    aspect: contentWidth / contentHeight,
    // coverage × average opacity, as Logo Soup defines it
    density: (filled / (contentWidth * contentHeight)) * (mass / filled),
    centreY: massY / mass,
  };
}

const round = (value, digits = 3) => Number(value.toFixed(digits));

/**
 * One logo as a <symbol>. Lossless only: comments, the XML prolog and
 * whitespace between tags go, path data stays byte for byte (the vector file
 * is the brand). Internal ids get the logo's prefix so two logos' clip paths
 * cannot collide once they share a document.
 */
function toSymbol(file, id) {
  const source = readFileSync(path.join(root, LOGO_DIR, file), "utf8")
    .replace(/<\?xml[^>]*>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "");
  const open = source.match(/<svg\b([^>]*)>/);
  if (!open) throw new Error(`${file}: no <svg> root`);
  const viewBox = open[1].match(/viewBox="([^"]+)"/)?.[1];
  if (!viewBox) throw new Error(`${file}: no viewBox`);
  const rootFill = open[1].match(/\sfill="([^"]+)"/)?.[1];
  const inner = source
    .slice(open.index + open[0].length, source.lastIndexOf("</svg>"))
    .replace(/>\s+</g, "><")
    .trim()
    .replace(/\sid="([^"]+)"/g, ` id="${id}-$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${id}-$1)`)
    .replace(/href="#([^"]+)"/g, `href="#${id}-$1"`);
  const [, , w, h] = viewBox.split(/[\s,]+/).map(Number);
  return {
    viewBox,
    aspect: w / h,
    symbol: `<symbol id="${id}" viewBox="${viewBox}"${rootFill ? ` fill="${rootFill}"` : ""}>${inner}</symbol>`,
  };
}

const logos = readLogoList(root);
const rows = [];
for (const logo of logos) {
  const m = await measure(logo.file);
  const { base, scaleFactor, densityFactor, referenceDensity, densityClamp, irradiation } =
    TUNING;
  const densityScale = Math.min(
    densityClamp[1],
    Math.max(densityClamp[0], (referenceDensity / m.density) ** (densityFactor * 0.5)),
  );
  const contentPx =
    ((m.aspect ** scaleFactor * base) / m.aspect) * densityScale * (logo.optical ?? 1);
  // The img box includes the file's own padding, so scale up by box / ink height.
  const imgPx = contentPx * (m.rasterHeight / m.contentHeight);
  const className = logoClassName(logo.file);
  const sprite = toSymbol(logo.file, `client-logo-${className}`);
  rows.push({
    className,
    viewBox: sprite.viewBox,
    aspect: sprite.aspect,
    symbol: sprite.symbol,
    heightRem: round(imgPx / 16),
    dark: round(1 - Math.min(1, m.density) * irradiation),
    // share of the box height to move so the ink's centre sits on the midline
    offset: round((m.rasterHeight / 2 - m.centreY) / m.rasterHeight),
  });
}

// One lane copy at the phone scale (light ground, 16px root): every logo's
// width from its height and aspect ratio, plus the gap after each.
const mobileLaneWidth = rows.reduce(
  (sum, r) => sum + r.heightRem * 16 * TUNING.mobileScale * r.aspect + TUNING.mobileGap,
  0,
);
const mobileDuration = round(mobileLaneWidth / TUNING.mobileSpeed, 1);

const css = `/* GENERATED by scripts/design-system/build-client-logo-sizes.mjs; do not edit.
   Run npm run build:logo-sizes after changing a logo or clientLogos.json.
   input-hash: ${computeInputHash(root)} */

/* Each logo's height comes from its measured shape and ink density. The img
   takes it as its font size, so the visual-centre offset can be a share of
   its own height (em). */

.logo {
  --logo-scale: ${TUNING.mobileScale};
  --logo-tone: 1;

  display: block;
  block-size: 1em;
  inline-size: auto;
  max-inline-size: none;
  font-size: calc(var(--logo-h) * var(--logo-scale) * var(--logo-tone));
  aspect-ratio: var(--logo-ar);
  translate: 0 calc(var(--logo-dy) * 1em);
}

@media (width >= 768px) {
  .logo {
    --logo-scale: 1;
  }
}

/* Light ink on a dark ground looks bigger. */

:global(.themeDark) .logo,
:global(.themeHCB) .logo {
  --logo-tone: var(--logo-dark);
}

/* Phone duration from the lane's width at the phone scale, so the speed is
   ${TUNING.mobileSpeed} px/s whatever the logos add up to. */

.track {
  --client-logo-marquee-duration-mobile: ${mobileDuration}s;
}

${rows
  .map(
    (r) => `.${r.className} {
  --logo-h: ${r.heightRem}rem;
  --logo-dark: ${r.dark};
  --logo-dy: ${r.offset};
  --logo-ar: ${r.viewBox.split(/[\s,]+/).slice(2).join(" / ")};
}`,
  )
  .join("\n\n")}
`;

writeFileSync(path.join(root, SIZES_CSS), css);
console.log(`✓ ${path.relative(root, SIZES_CSS)} (${rows.length} logos)`);

const inputHash = computeInputHash(root);
const spriteSvg = `<svg xmlns="http://www.w3.org/2000/svg"><!-- GENERATED by scripts/design-system/build-client-logo-sizes.mjs; do not edit. input-hash: ${inputHash} -->${rows.map((r) => r.symbol).join("")}</svg>\n`;
writeFileSync(path.join(root, SPRITE_SVG), spriteSvg);

const sprite = `/* GENERATED by scripts/design-system/build-client-logo-sizes.mjs; do not edit.
   Run npm run build:logo-sizes after changing a logo or clientLogos.json.
   input-hash: ${inputHash} */

/** The client logo sprite. The query string changes with every logo or
    tuning change, so the file can be cached immutably. */
export const CLIENT_LOGO_SPRITE_URL = "/${SPRITE_SVG.replace(/^public\//, "")}?v=${inputHash}";
`;
writeFileSync(path.join(root, SPRITE_TS), sprite);
console.log(
  `✓ ${SPRITE_SVG} (${(spriteSvg.length / 1024).toFixed(1)} KB); phone lane ${Math.round(mobileLaneWidth)}px, ${mobileDuration}s at ${TUNING.mobileSpeed}px/s`,
);
for (const r of rows) {
  console.log(
    `  ${r.className.padEnd(16)} ${(r.heightRem * 16).toFixed(1).padStart(5)}px  dark ×${r.dark}  dy ${r.offset}`,
  );
}
