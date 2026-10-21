import { join } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { projects } from "./projects";

/**
 * The work-index hover glow is the cover itself, blurred (CSS background
 * inheritance). It can only glow with what is in the file: a transparent
 * cover or an SVG drawn over a CSS background glows with the logo shape
 * alone and ignores the background around it. So every cover must be one
 * composited, fully opaque bitmap.
 */
const PUBLIC = join(process.cwd(), "public");
const covers = projects
  .filter((p) => p.thumbnail && !/\.(mov|mp4|webm)(\?|$)/i.test(p.thumbnail))
  .map((p) => [p.slug, p.thumbnail.split("?")[0]] as const);

describe("work covers are composited bitmaps", () => {
  it.each(covers)("%s is a raster image, not SVG", (_slug, path) => {
    expect(path).toMatch(/\.(png|webp|jpe?g|avif)$/i);
  });

  it.each(covers)("%s has no transparent pixels", async (_slug, path) => {
    const { data, info } = await sharp(join(PUBLIC, path))
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    let transparent = 0;
    for (let i = 3; i < data.length; i += info.channels) {
      if (data[i] < 255) transparent += 1;
    }
    expect(transparent).toBe(0);
  });
});
