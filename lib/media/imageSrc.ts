/** True when src should bypass next/image (SVG is not optimized like raster formats). */
export function isSvgSrc(src: string | undefined | null): boolean {
  if (!src) return false;
  const path = src.split("?")[0]?.split("#")[0]?.toLowerCase() ?? "";
  return path.endsWith(".svg");
}
