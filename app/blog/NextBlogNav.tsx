"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

import Button from "@dt/Button";
import Icon from "@dt/Icon";
import { posts } from "./postMetadata";

import styles from "./NextBlogNav.module.css";

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
    <div className={styles.wrapper}>
      <div className={styles.row}>
        <Button
          variant="tertiary"
          size="m"
          icon={<Icon name="text-align-left" ariaLabel="Articles" />}
          onClick={() => router.push("/blog")}
        >
          Articles
        </Button>
        <div className={styles.navButtons}>
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
          >
            Previous
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
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
