import { generatePageOgImage, OG_SIZE } from "../../lib/og-image-utils";

export const runtime = "edge";
export const alt = "Email Signature Generator | Digitaltableteur";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return generatePageOgImage({
    tag: "TOOLS",
    title: "Email Signature",
    subtitle: "Free generator with live preview and dark mode",
  });
}
