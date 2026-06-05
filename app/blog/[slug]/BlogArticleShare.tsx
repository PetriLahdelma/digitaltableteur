"use client";

import { SocialShare } from "@dt/SocialShare";

export interface BlogArticleShareProps {
  url: string;
  title: string;
}

/** Client boundary for blog post share toolbar (Web Share API + copy). */
export function BlogArticleShare({ url, title }: BlogArticleShareProps) {
  return (
    <SocialShare
      url={url}
      title={title}
      variant="article"
      showHeading
      channels={[
        "linkedin",
        "twitter",
        "facebook",
        "reddit",
        "whatsapp",
        "instagram",
      ]}
    />
  );
}
