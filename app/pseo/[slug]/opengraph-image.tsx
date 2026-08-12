import { getPseoLeafPageBySlug } from "@/lib/pseo/catalog";
import { generatePageOgImage, OG_SIZE } from "../../lib/og-image-utils";

export const runtime = "edge";
export const alt = "Design System Guide | Digitaltableteur";
export const size = OG_SIZE;
export const contentType = "image/png";

type Params = { slug: string };

export default async function Image({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const page = getPseoLeafPageBySlug(slug);

  return generatePageOgImage({
    tag: "GUIDES",
    title: page?.title ?? "Guide",
    subtitle: page?.description?.slice(0, 90),
  });
}
