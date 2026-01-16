import { generatePageOgImage, OG_SIZE } from "../lib/og-image-utils";

export const runtime = "edge";
export const alt = "Work — Digitaltableteur Portfolio";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return generatePageOgImage({
    title: "Selected Work",
    subtitle: "Design systems, branding, and digital product experiences",
  });
}
