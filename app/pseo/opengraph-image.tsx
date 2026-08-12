import { generatePageOgImage, OG_SIZE } from "../lib/og-image-utils";

export const runtime = "edge";
export const alt = "Design System Guides | Digitaltableteur";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return generatePageOgImage({
    tag: "GUIDES",
    title: "Guides",
    subtitle: "Design system and DesignOps implementation library",
  });
}
