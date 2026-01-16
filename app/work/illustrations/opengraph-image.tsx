import { generateWorkOgImage, OG_SIZE } from "../../lib/og-image-utils";

export const runtime = "edge";
export const alt = "Illustrations — Digitaltableteur Portfolio";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return generateWorkOgImage({
    title: "Illustrations",
    category: "Illustration",
    tags: ["Editorial", "Digital Art", "Visual Design"],
  });
}
