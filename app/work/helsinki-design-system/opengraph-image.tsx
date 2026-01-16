import { generateWorkOgImage, OG_SIZE } from "../../lib/og-image-utils";

export const runtime = "edge";
export const alt = "Helsinki Design System — Digitaltableteur Portfolio";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return generateWorkOgImage({
    title: "Helsinki Design System",
    category: "Design Systems",
    tags: ["Accessibility", "React", "City of Helsinki"],
  });
}
