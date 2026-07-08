"use client";

import Image from "next/image";
import NextLink from "next/link";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "@phosphor-icons/react";
import { cn } from "../../lib/cn";

export interface AuthorSocial {
  platform: string;
  url: string;
}

export interface EnhancedAuthorCardProps {
  /** Author name */
  name: string;
  /** Author slug for profile link */
  slug?: string;
  /** Author avatar URL */
  imageUrl?: string;
  /** Author bio text */
  bio?: string;
  /** Social media links */
  socials?: AuthorSocial[];
  /** Show "More from author" link */
  showMoreLink?: boolean;
  /** Card variant */
  variant?: "inline" | "card" | "minimal";
  /** Custom className */
  className?: string;
}

/**
 * EnhancedAuthorCard - Display author information
 *
 * Variants:
 * - inline: Horizontal layout with avatar, name, bio
 * - card: Full card with border, padding, all info
 * - minimal: Just avatar and name
 */
export function EnhancedAuthorCard({
  name,
  slug,
  imageUrl,
  bio,
  socials,
  showMoreLink = false,
  variant = "card",
  className,
}: EnhancedAuthorCardProps) {
  const { t } = useTranslation();

  // Default avatar fallback
  const avatarSrc = imageUrl || "/images/default-avatar.png";
  const profileUrl = slug ? `/blog/authors/${slug}` : undefined;

  // Minimal variant
  if (variant === "minimal") {
    const content = (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted">
          <Image
            src={avatarSrc}
            alt={name}
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>
        <span className="font-body font-medium text-foreground">{name}</span>
      </div>
    );

    if (profileUrl) {
      return (
        <NextLink href={profileUrl} className="hover:opacity-80 transition-opacity">
          {content}
        </NextLink>
      );
    }

    return content;
  }

  // Inline variant
  if (variant === "inline") {
    return (
      <div
        className={cn(
          "not-prose flex items-start gap-4",
          "py-6 border-t border-border",
          className
        )}
      >
        {/* Avatar */}
        <div className="relative w-14 h-14 flex-shrink-0 rounded-full overflow-hidden bg-muted">
          <Image
            src={avatarSrc}
            alt={name}
            fill
            className="object-cover"
            sizes="56px"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name */}
          {profileUrl ? (
            <NextLink
              href={profileUrl}
              className="font-display font-semibold text-lg text-foreground hover:text-primary transition-colors"
            >
              {name}
            </NextLink>
          ) : (
            <span className="font-display font-semibold text-lg text-foreground">
              {name}
            </span>
          )}

          {/* Bio */}
          {bio && (
            <p className="font-body text-sm text-muted-foreground mt-1 line-clamp-2">
              {bio}
            </p>
          )}

          {/* More link */}
          {showMoreLink && profileUrl && (
            <NextLink
              href={profileUrl}
              className="inline-flex items-center gap-1 mt-2 text-sm font-body text-primary hover:underline"
            >
              {t("articleAboutAuthor", "View profile")}
              <ArrowRight size={12} />
            </NextLink>
          )}
        </div>
      </div>
    );
  }

  // Card variant (default)
  return (
    <div
      className={cn(
        "p-6 rounded-lg",
        "bg-card border border-border",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        {/* Avatar */}
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-muted">
          <Image
            src={avatarSrc}
            alt={name}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>

        {/* Name and title */}
        <div>
          <p className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-1">
            {t("articleAboutAuthor", "About the author")}
          </p>
          {profileUrl ? (
            <NextLink
              href={profileUrl}
              className="font-display font-semibold text-xl text-foreground hover:text-primary transition-colors"
            >
              {name}
            </NextLink>
          ) : (
            <span className="font-display font-semibold text-xl text-foreground">
              {name}
            </span>
          )}
        </div>
      </div>

      {/* Bio */}
      {bio && (
        <p className="font-body text-muted-foreground leading-relaxed mb-4">
          {bio}
        </p>
      )}

      {/* Socials */}
      {socials && socials.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-4">
          {socials.map((social) => (
            <a
              key={social.platform}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
            >
              {social.platform}
            </a>
          ))}
        </div>
      )}

      {/* More link */}
      {showMoreLink && profileUrl && (
        <NextLink
          href={profileUrl}
          className={cn(
            "inline-flex items-center gap-2",
            "px-4 py-2 rounded-full",
            "bg-muted text-foreground",
            "font-body text-sm font-medium",
            "hover:bg-foreground hover:text-background",
            "transition-colors"
          )}
        >
          {t("blogReadMore", "View all posts")}
          <ArrowRight size={16} />
        </NextLink>
      )}
    </div>
  );
}

EnhancedAuthorCard.displayName = "EnhancedAuthorCard";
