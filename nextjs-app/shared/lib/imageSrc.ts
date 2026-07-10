/** True when src should bypass optimized image handling. */
export function isSvgSrc(src: string | undefined | null): boolean {
  if (!src) return false;
  const path = src.split("?")[0]?.split("#")[0]?.toLowerCase() ?? "";
  return path.endsWith(".svg");
}
