import { generatePageOgImage, OG_SIZE } from "../lib/og-image-utils";

export const runtime = "edge";
export const alt = "Changelog: every feature shipped on digitaltableteur.com, from git history";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return generatePageOgImage({
    tag: "CHANGELOG",
    title: "Changelog",
    subtitle: "Every feature shipped on the site and its design system",
  });
}
