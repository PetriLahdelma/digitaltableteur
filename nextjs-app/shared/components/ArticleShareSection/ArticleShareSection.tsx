"use client";

import { useState, useCallback } from "react";
import { useTranslate } from "../../lib/translation";
import {
  XLogo,
  LinkedinLogo,
  FacebookLogo,
  Link,
  Check,
} from "@phosphor-icons/react";
import { cn } from "../../lib/cn";
import { SocialIconLink } from "../SocialIconLink";

export interface ArticleShareSectionProps {
  /** Article URL to share */
  url: string;
  /** Article title for share text */
  title: string;
  /** Layout direction */
  layout?: "horizontal" | "vertical";
  /** Show section title */
  showTitle?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * ArticleShareSection - Social sharing buttons for articles
 */
export function ArticleShareSection({
  url,
  title,
  layout = "horizontal",
  showTitle = true,
  className,
}: ArticleShareSectionProps) {
  const t = useTranslate();
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const twitterLabel = t("shareTwitter", "Share on X");
  const linkedinLabel = t("shareLinkedIn", "Share on LinkedIn");
  const facebookLabel = t("shareFacebook", "Share on Facebook");
  const copyLinkLabel = copied
    ? t("articleLinkCopied", "Link copied!")
    : t("articleCopyLink", "Copy link");

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  };

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [url]);

  const isVertical = layout === "vertical";

  const buttonBaseClass = cn(
    "inline-flex items-center justify-center",
    "w-10 h-10 rounded-full",
    "border border-border",
    "text-muted-foreground",
    "transition-colors duration-200",
    "hover:bg-foreground hover:text-background hover:border-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  );

  return (
    <div
      className={cn(
        isVertical ? "flex flex-col items-start gap-4" : "space-y-4",
        className,
      )}
    >
      {/* Title */}
      {showTitle && (
        <h3
          className={cn(
            "font-body text-sm font-medium",
            "text-muted-foreground uppercase tracking-wider",
          )}
        >
          {t("articleShareTitle", "Share this article")}
        </h3>
      )}

      {/* Buttons */}
      <div className={cn("flex gap-3", isVertical && "flex-col")}>
        <SocialIconLink
          href={shareLinks.twitter}
          label={twitterLabel}
          variant="chip"
          size="sm"
        >
          <XLogo />
        </SocialIconLink>

        <SocialIconLink
          href={shareLinks.linkedin}
          label={linkedinLabel}
          variant="chip"
          size="sm"
        >
          <LinkedinLogo />
        </SocialIconLink>

        <SocialIconLink
          href={shareLinks.facebook}
          label={facebookLabel}
          variant="chip"
          size="sm"
        >
          <FacebookLogo />
        </SocialIconLink>

        {/* Copy link */}
        <button
          type="button"
          onClick={copyToClipboard}
          className={cn(
            buttonBaseClass,
            copied && "bg-green-500 text-white border-green-500",
          )}
          aria-label={copyLinkLabel}
          title={copyLinkLabel}
        >
          {copied ? (
            <Check size={16} aria-hidden="true" />
          ) : (
            <Link size={16} aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Copy feedback (visual). green-800 ink: green-600 is only ~3:1 on
          white, below WCAG AA for small text. */}
      {copied && (
        <span className="text-sm font-body text-green-800 dark:text-green-400">
          {t("articleLinkCopied", "Link copied!")}
        </span>
      )}
    </div>
  );
}

ArticleShareSection.displayName = "ArticleShareSection";
