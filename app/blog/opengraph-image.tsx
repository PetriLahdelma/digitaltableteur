import { generatePageOgImage, OG_SIZE } from "../lib/og-image-utils";

export const runtime = "edge";
export const alt = "Blog — Digitaltableteur Design & Development Insights";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return generatePageOgImage({
    title: "Blog",
    subtitle: "Insights on design systems, AI, and digital product craft",
  });
}
