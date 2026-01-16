import { generateWorkOgImage, OG_SIZE } from "../../lib/og-image-utils";

export const runtime = "edge";
export const alt = "New Things Co — Digitaltableteur Portfolio";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return generateWorkOgImage({
    title: "New Things Co",
    category: "Branding",
    tags: ["Brand Identity", "Web Design", "Startup"],
  });
}
