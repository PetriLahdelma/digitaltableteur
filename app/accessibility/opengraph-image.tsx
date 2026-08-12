import { generatePageOgImage, OG_SIZE } from "../lib/og-image-utils";

export const runtime = "edge";
export const alt = "Accessibility Statement | Digitaltableteur";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return generatePageOgImage({
    tag: "ACCESSIBILITY",
    title: "Accessibility",
    subtitle: "WCAG 2.1 AA commitment and inclusive design practices",
  });
}
