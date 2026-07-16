"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import BlogNav from "@/nextjs-app/shared/components/BlogNav/BlogNav";
import { getVisiblePosts } from "./postMetadata";

import styles from "./NextBlogNav.module.css";

export function NextBlogNav() {
  const pathname = usePathname();
  const router = useRouter();

  // Generate blog pages from actual blog post metadata
  const blogPages = useMemo(() => {
    return getVisiblePosts().map((post) => ({
      path: `/blog/${post.slug}`,
      label: post.title,
    }));
  }, []);

  return (
    <div className={styles.wrapper}>
      <BlogNav
        currentPath={pathname ?? undefined}
        pages={blogPages}
        onNavigate={router.push}
      />
    </div>
  );
}
