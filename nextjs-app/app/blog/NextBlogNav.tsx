"use client";

import { usePathname, useRouter } from "next/navigation";

import Button from "@dt/Button";
import Icon from "@dt/Icon";

const normalizePath = (path: string) =>
  path === "/" ? path : path.replace(/\/+$/, "");

const blogPages = [
  { path: "/blog/petri-lahdelma-bio", label: "Petri Lahdelma Bio" },
  { path: "/blog/digital-craftsmanship", label: "Digital Craftsmanship" },
  { path: "/blog/figma-mcp-design-systems", label: "Figma MCP" },
  { path: "/blog/thoughts-on-future-branding", label: "Future Branding" },
  { path: "/blog/designing-in-2025", label: "Designing in 2025" },
  { path: "/blog/in-search-of-impact", label: "In Search of Impact" },
  { path: "/blog/workflow-tips", label: "Workflow Tips" },
  {
    path: "/blog/design-system-meets-ai-building-the-self-evolving-component-library-pt-1",
    label: "Design System meets AI Pt 1",
  },
  {
    path: "/blog/design-system-meets-ai-building-the-self-evolving-component-library-pt-2",
    label: "Design System meets AI Pt 2",
  },
];

export function NextBlogNav() {
  const pathname = usePathname();
  const router = useRouter();
  const currentIndex = blogPages.findIndex(
    (p) => normalizePath(p.path) === normalizePath(pathname || ""),
  );
  const isArticleRoute = currentIndex >= 0;

  return (
    <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1.25rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <Button
          variant="tertiary"
          size="m"
          icon={<Icon name="text-align-left" ariaLabel="Back to articles" />}
          onClick={() => router.push("/blog")}
        >
          Back to articles
        </Button>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Button
            variant="tertiary"
            size="m"
            icon={<Icon name="arrow-left" ariaLabel="Previous" />}
            isDisabled={!isArticleRoute || currentIndex <= 0}
            onClick={() => {
              if (!isArticleRoute) return;
              if (currentIndex > 0)
                router.push(blogPages[currentIndex - 1].path);
            }}
          >
            Previous
          </Button>
          <Button
            variant="tertiary"
            size="m"
            endIcon={<Icon name="arrow-right" ariaLabel="Next" />}
            isDisabled={
              !isArticleRoute || currentIndex === blogPages.length - 1
            }
            onClick={() => {
              if (!isArticleRoute) return;
              if (currentIndex < blogPages.length - 1)
                router.push(blogPages[currentIndex + 1].path);
            }}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
