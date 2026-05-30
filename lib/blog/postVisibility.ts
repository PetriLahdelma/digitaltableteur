/**
 * Shared rules for showing draft / scheduled-future blog posts in dev preview.
 */

export type BlogVisibilityPost = {
  draft?: boolean;
  status?: string;
  publishedAt?: string;
};

export const PREVIEW_DRAFTS_COOKIE = "dt_preview_drafts";

export function shouldShowUnpublishedPostsFromEnv(): boolean {
  return (
    process.env.SHOW_UNPUBLISHED_POSTS === "true" ||
    process.env.NEXT_PUBLIC_SHOW_UNPUBLISHED_POSTS === "true"
  );
}

export function isPreviewDraftsCookie(value: string | undefined | null): boolean {
  return value === "1" || value === "true";
}

/** Server: pass cookie from `cookies()`. Client: reads document.cookie when env is off. */
export function shouldShowUnpublishedPosts(options?: {
  previewCookie?: string | null;
}): boolean {
  if (shouldShowUnpublishedPostsFromEnv()) return true;
  if (options?.previewCookie && isPreviewDraftsCookie(options.previewCookie)) {
    return true;
  }
  if (typeof document !== "undefined") {
    const match = document.cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${PREVIEW_DRAFTS_COOKIE}=`));
    if (match) {
      const value = match.split("=")[1];
      return isPreviewDraftsCookie(value);
    }
  }
  return false;
}

const toPublishedTime = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.getTime();
};

export function isPostVisible(
  post: BlogVisibilityPost,
  showUnpublished?: boolean,
): boolean {
  const show =
    showUnpublished ?? shouldShowUnpublishedPostsFromEnv();

  if (show) return true;

  if (
    post.draft ||
    post.status === "draft" ||
    post.status === "unpublished"
  ) {
    return false;
  }

  const publishedAt = toPublishedTime(post.publishedAt);
  return publishedAt === undefined || publishedAt <= Date.now();
}

export function isScheduledPreviewPost(post: BlogVisibilityPost): boolean {
  if (post.status !== "scheduled") return false;
  const publishedAt = toPublishedTime(post.publishedAt);
  return publishedAt !== undefined && publishedAt > Date.now();
}
