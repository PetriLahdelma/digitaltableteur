import { generatePageOgImage, OG_SIZE } from "../lib/og-image-utils";

export const runtime = "edge";
export const alt = "Timeline: two decades of Digitaltableteur design work, since 2002";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return generatePageOgImage({
    tag: "TIMELINE",
    title: "Timeline",
    subtitle: "Two decades of design work, year by year since 2002",
  });
}
