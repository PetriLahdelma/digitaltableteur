import { getPseoStackBySlug } from "@/lib/pseo/catalog";
import { generatePageOgImage, OG_SIZE } from "../../../lib/og-image-utils";

export const runtime = "edge";
export const alt = "Design System Stack Guides | Digitaltableteur";
export const size = OG_SIZE;
export const contentType = "image/png";

type Params = { slug: string };

export default async function Image({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const stack = getPseoStackBySlug(slug);

  return generatePageOgImage({
    tag: "STACKS",
    title: stack?.name ?? "Stack",
    subtitle: stack?.shortDescription?.slice(0, 90),
  });
}
