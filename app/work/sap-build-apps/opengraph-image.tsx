import { generateWorkOgImage, OG_SIZE } from "../../lib/og-image-utils";

export const runtime = "edge";
export const alt = "SAP Build Apps Design System — Digitaltableteur Portfolio";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return generateWorkOgImage({
    title: "SAP Build Apps Design System",
    category: "Design Systems",
    tags: ["Enterprise", "Low-Code", "SAP BTP"],
  });
}
