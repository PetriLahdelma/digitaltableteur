import { projects } from "@/nextjs-app/shared/data/projects";
import { generateWorkOgImage } from "../lib/og-image-utils";

/**
 * Postcard OG image for a work case study. Pulls title and tags from the
 * projects catalog when the slug exists there; standalone case studies
 * (not listed in the catalog) render with the given title only.
 */
export function workOgImage(slug: string, fallbackTitle: string) {
  const project = projects.find((p) => p.slug === slug);
  return generateWorkOgImage({
    title: project?.title ?? fallbackTitle,
    tags: project?.tags,
  });
}
