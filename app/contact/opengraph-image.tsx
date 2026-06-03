import { generatePageOgImage, OG_SIZE } from "../lib/og-image-utils";

export const runtime = "edge";
export const alt =
  "Contact Digitaltableteur — Let's Create Something Extraordinary";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return generatePageOgImage({
    title: "Get in Touch",
    subtitle: "Ready to create something extraordinary? Let's talk.",
  });
}
