import { generatePageOgImage, OG_SIZE } from "../lib/og-image-utils";

export const runtime = "edge";
export const alt = "AI Use & Transparency | Digitaltableteur";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return generatePageOgImage({
    tag: "AI USE",
    title: "AI Use",
    subtitle: "Transparent, responsible AI-assisted design workflows",
  });
}
