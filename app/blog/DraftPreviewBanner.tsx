import Link from "next/link";
import { cookies } from "next/headers";

import {
  isScheduledPreviewPost,
  PREVIEW_DRAFTS_COOKIE,
  shouldShowUnpublishedPosts,
  shouldShowUnpublishedPostsFromEnv,
} from "@/lib/blog/postVisibility";
import { allPosts } from "./postMetadata";

export async function DraftPreviewBanner() {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const cookieStore = await cookies();
  const previewCookie = cookieStore.get(PREVIEW_DRAFTS_COOKIE)?.value;
  const showUnpublished = shouldShowUnpublishedPosts({ previewCookie });

  if (!showUnpublished) {
    return (
      <div
        role="status"
        className="border-b border-amber-500/40 bg-amber-500/10 px-4 py-2 text-center text-sm text-foreground"
      >
        <span className="font-medium">Draft preview is off.</span>{" "}
        <Link href="/blog?preview=drafts" className="underline underline-offset-2">
          Show scheduled &amp; draft posts
        </Link>
        {" · "}
        <code className="text-xs">npm run dev:drafts</code>
      </div>
    );
  }

  const scheduled = allPosts
    .filter(isScheduledPreviewPost)
    .sort(
      (a, b) =>
        new Date(a.publishedAt ?? 0).getTime() -
        new Date(b.publishedAt ?? 0).getTime(),
    );

  const envHint = shouldShowUnpublishedPostsFromEnv()
    ? "env: SHOW_UNPUBLISHED_POSTS"
    : "cookie: ?preview=drafts";

  return (
    <div
      role="status"
      className="border-b border-lime-400/50 bg-lime-400/10 px-4 py-3 text-sm text-foreground"
    >
      <p className="text-center font-medium">
        Draft preview ON ({envHint})
        {" · "}
        <Link href="/blog?preview=off" className="underline underline-offset-2">
          Turn off
        </Link>
      </p>
      {scheduled.length > 0 ? (
        <ul className="mx-auto mt-2 flex max-w-4xl flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
          {scheduled.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="underline underline-offset-2">
                {post.title}
              </Link>
              {post.publishedAt ? (
                <span className="text-muted-foreground">
                  {" "}
                  ({new Date(post.publishedAt).toLocaleDateString("en-GB")})
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
