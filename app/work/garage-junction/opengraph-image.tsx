import { generateWorkOgImage, OG_SIZE } from "../../lib/og-image-utils";

export const runtime = "edge";
export const alt = "Garage Junction — Digitaltableteur Portfolio";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return generateWorkOgImage({
    title: "Garage Junction",
    category: "Branding",
    tags: ["Brand Identity", "Logo Design", "Visual Identity"],
  });
}
