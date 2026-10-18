import { generatePageOgImage, OG_SIZE } from "../lib/og-image-utils";

export const runtime = "edge";
export const alt = "Changelog: every dated Digitaltableteur event since 2009";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return generatePageOgImage({
    tag: "CHANGELOG",
    title: "Changelog",
    subtitle: "Every dated event since 2009, each linked to its proof",
  });
}
