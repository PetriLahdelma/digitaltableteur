import { generatePageOgImage, OG_SIZE } from "../lib/og-image-utils";

export const runtime = "edge";
export const alt = "Colophon: how digitaltableteur.com is built";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return generatePageOgImage({
    tag: "COLOPHON",
    title: "How This Site Is Built",
    subtitle: "The stack, the design system and the numbers",
  });
}
