import { generateWorkOgImage, OG_SIZE } from "../../lib/og-image-utils";

export const runtime = "edge";
export const alt = "KnobSmith Audio — Digitaltableteur Portfolio";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return generateWorkOgImage({
    title: "KnobSmith Audio",
    category: "Product Design",
    tags: ["Interaction Design", "Visual Design", "Brand Identity"],
  });
}
