#!/usr/bin/env node
/**
 * Renders the static OG composites from scripts/og/mocks/*.html into the
 * app router as opengraph-image.jpg files (postcard brand system).
 *
 * The mocks composite the transparent postcard marks from
 * public/images/brand/postcard/ with JetBrains Mono loaded from Google
 * Fonts, so the script needs network access. Each mock is rendered at
 * 2x device pixels and downsampled to 1200x630 for crisp type.
 *
 * Usage: node scripts/og/render-og-images.mjs
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..", "..");

// mock -> app router targets (one mock may serve several surfaces)
const TARGETS = {
  "home.html": ["app/opengraph-image.jpg", "app/twitter-image.jpg"],
  "about.html": ["app/about/opengraph-image.jpg"],
  "contact.html": ["app/contact/opengraph-image.jpg"],
  "work.html": ["app/work/opengraph-image.jpg"],
  "blog.html": ["app/blog/opengraph-image.jpg"],
};

const JPEG_QUALITY = 88;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 2,
});

for (const [mock, outputs] of Object.entries(TARGETS)) {
  await page.goto("file://" + resolve(here, "mocks", mock));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
  const raw = await page.screenshot({ type: "png" });
  const jpeg = await sharp(raw)
    .resize(1200, 630)
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();
  for (const out of outputs) {
    await sharp(jpeg).toFile(resolve(repoRoot, out));
    console.log(`${mock} -> ${out} (${Math.round(jpeg.length / 1024)}KB)`);
  }
}

await browser.close();
