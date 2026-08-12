import { generatePageOgImage, OG_SIZE } from "../lib/og-image-utils";

export const runtime = "edge";
export const alt = "Privacy Policy | Digitaltableteur";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return generatePageOgImage({
    tag: "PRIVACY",
    title: "Privacy Policy",
    subtitle: "How we collect, use, and protect your data",
  });
}
