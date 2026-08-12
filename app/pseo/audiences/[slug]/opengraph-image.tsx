import { getPseoAudienceBySlug } from "@/lib/pseo/catalog";
import { generatePageOgImage, OG_SIZE } from "../../../lib/og-image-utils";

export const runtime = "edge";
export const alt = "Design System Audience Guides | Digitaltableteur";
export const size = OG_SIZE;
export const contentType = "image/png";

type Params = { slug: string };

export default async function Image({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const audience = getPseoAudienceBySlug(slug);

  return generatePageOgImage({
    tag: "GUIDES",
    title: audience?.name ?? "Audience",
    subtitle: audience?.shortDescription?.slice(0, 90),
  });
}
