import { generatePageOgImage, OG_SIZE } from "../lib/og-image-utils";

export const runtime = "edge";
export const alt = "Imprint | Digitaltableteur";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return generatePageOgImage({
    tag: "IMPRINT",
    title: "Imprint",
    subtitle: "Legal business information for Digitaltableteur",
  });
}
