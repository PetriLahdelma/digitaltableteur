import { generatePageOgImage, OG_SIZE } from "../lib/og-image-utils";

export const runtime = "edge";
export const alt = "Sitemap of digitaltableteur.com";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return generatePageOgImage({
    tag: "SITEMAP",
    title: "Every Page on the Site",
    subtitle: "Work, writing, offers and guides in one place",
  });
}
