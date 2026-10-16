import { getEngagementBySlug } from "@/nextjs-app/shared/data/engagements";
import en from "@/nextjs-app/shared/locales/en/translation.json";
import { generatePageOgImage, OG_SIZE } from "../../lib/og-image-utils";

export const runtime = "edge";
export const alt = "Digitaltableteur engagement";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const engagement = getEngagementBySlug((await params).slug);
  const copy = engagement ? en.engagementPages[engagement.id] : null;
  return generatePageOgImage({
    tag: "ENGAGEMENT",
    title: copy?.eyebrow ?? "Engagements",
    subtitle: copy?.title ?? "Focused engagements, senior delivery",
  });
}
