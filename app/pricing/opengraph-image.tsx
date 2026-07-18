import { generatePageOgImage, OG_SIZE } from "../lib/og-image-utils";

export const runtime = "edge";
export const alt =
  "Pricing — Productized design, UX/UI and DesignOps packages from €7k";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return generatePageOgImage({
    title: "Pricing",
    subtitle: "Fixed-scope design packages from €7k",
  });
}
