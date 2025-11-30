"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

import Button from "@dt/Button";
import Icon from "@dt/Icon";
import { posts } from "./postMetadata";

const normalizePath = (path: string) =>
  path === "/" ? path : path.replace(/\/+$/, "");

export function NextBlogNav() {
  const pathname = usePathname();
  const router = useRouter();

  // Generate blog pages from actual blog post metadata
  const blogPages = useMemo(() => {
    return posts.map((post) => ({
      path: `/blog/${post.slug}`,
      label: post.title,
    }));
  }, []);

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
          icon={<Icon name="text-align-left" ariaLabel="Articles" />}
          onClick={() => router.push("/blog")}
        >
          Articles
        </Button>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Button
            variant="tertiary"
            size="m"
            icon={<Icon name="arrow-left" ariaLabel="Previous article" />}
            disabled={!isArticleRoute || currentIndex <= 0}
            onClick={() => {
              if (!isArticleRoute) return;
              if (currentIndex > 0)
                router.push(blogPages[currentIndex - 1].path);
            }}
            className="nav-button-prev"
          >
            <span className="nav-button-text">Previous</span>
          </Button>
          <Button
            variant="tertiary"
            size="m"
            endIcon={<Icon name="arrow-right" ariaLabel="Next article" />}
            disabled={!isArticleRoute || currentIndex === blogPages.length - 1}
            onClick={() => {
              if (!isArticleRoute) return;
              if (currentIndex < blogPages.length - 1)
                router.push(blogPages[currentIndex + 1].path);
            }}
            className="nav-button-next"
          >
            <span className="nav-button-text">Next</span>
          </Button>
        </div>
      </div>
      <style jsx>{`
        :global(.nav-button-text) {
          display: none;
        }
        @media (min-width: 768px) {
          :global(.nav-button-text) {
            display: inline;
          }
        }
      `}</style>
    </div>
  );
}
