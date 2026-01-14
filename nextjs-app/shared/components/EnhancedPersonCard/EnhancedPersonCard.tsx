"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { FadeIn } from "../animations/FadeIn";
import {
  LinkedinLogo,
  GithubLogo,
  XLogo,
  FacebookLogo,
  InstagramLogo,
  DribbbleLogo,
  MediumLogo,
  Newspaper,
} from "@phosphor-icons/react";

// Social platform icons mapping using Phosphor Icons
const SocialIcons = {
  linkedin: LinkedinLogo,
  github: GithubLogo,
  twitter: XLogo,
  facebook: FacebookLogo,
  instagram: InstagramLogo,
  dribbble: DribbbleLogo,
  medium: MediumLogo,
  substack: Newspaper,
} as const;

export interface EnhancedPersonCardProps {
  /** Profile image source */
  imageSrc: string;
  /** Image alt text */
  imageAlt: string;
  /** Person's name */
  name: string;
  /** Person's job title */
  title: string;
  /** Email address */
  email: string;
  /** LinkedIn URL */
  linkedinUrl?: string;
  linkedinLabel?: string;
  /** GitHub URL */
  githubUrl?: string;
  githubLabel?: string;
  /** Facebook URL */
  facebookUrl?: string;
  facebookLabel?: string;
  /** Twitter/X URL */
  twitterUrl?: string;
  twitterLabel?: string;
  /** Dribbble URL */
  dribbbleUrl?: string;
  dribbbleLabel?: string;
  /** Medium URL */
  mediumUrl?: string;
  mediumLabel?: string;
  /** Instagram URL */
  instagramUrl?: string;
  instagramLabel?: string;
  /** Substack URL */
  substackUrl?: string;
  substackLabel?: string;
  /** Layout variant */
  variant?: "horizontal" | "vertical" | "compact";
  /** Show loading skeleton */
  loading?: boolean;
  /** Custom className */
  className?: string;
}

function SocialLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center justify-center",
        "w-10 h-10 rounded-full",
        "text-muted-foreground",
        "transition-all duration-200",
        "hover:bg-muted hover:text-foreground hover:scale-110",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      )}
    >
      <Icon className="w-5 h-5" />
    </a>
  );
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse bg-muted rounded", className)}
      aria-hidden="true"
    />
  );
}

export function EnhancedPersonCard({
  imageSrc,
  imageAlt,
  name,
  title,
  email,
  linkedinUrl,
  linkedinLabel,
  githubUrl,
  githubLabel,
  facebookUrl,
  facebookLabel,
  twitterUrl,
  twitterLabel,
  dribbbleUrl,
  dribbbleLabel,
  mediumUrl,
  mediumLabel,
  instagramUrl,
  instagramLabel,
  substackUrl,
  substackLabel,
  variant = "horizontal",
  loading = false,
  className,
}: EnhancedPersonCardProps) {
  const { t } = useTranslation();

  // Collect social links
  const socialLinks = [
    { url: linkedinUrl, label: linkedinLabel || t("contactLinkedInLabel"), icon: SocialIcons.linkedin },
    { url: githubUrl, label: githubLabel || t("contactGitHubLabel"), icon: SocialIcons.github },
    { url: twitterUrl, label: twitterLabel || t("contactTwitterLabel"), icon: SocialIcons.twitter },
    { url: facebookUrl, label: facebookLabel || t("contactFacebookLabel"), icon: SocialIcons.facebook },
    { url: instagramUrl, label: instagramLabel || t("contactInstagramLabel"), icon: SocialIcons.instagram },
    { url: dribbbleUrl, label: dribbbleLabel || t("contactDribbbleLabel"), icon: SocialIcons.dribbble },
    { url: mediumUrl, label: mediumLabel || t("contactMediumLabel"), icon: SocialIcons.medium },
    { url: substackUrl, label: substackLabel || t("contactSubstackLabel"), icon: SocialIcons.substack },
  ].filter((link) => link.url);

  if (loading) {
    return (
      <div
        className={cn(
          "rounded-lg p-6",
          variant === "horizontal" && "flex items-start gap-6",
          variant === "vertical" && "flex flex-col items-center text-center",
          variant === "compact" && "flex items-center gap-4",
          className
        )}
        aria-busy="true"
        role="status"
      >
        <Skeleton
          className={cn(
            "rounded-full flex-shrink-0",
            variant === "compact" ? "w-16 h-16" : "w-24 h-24 tablet:w-32 tablet:h-32"
          )}
        />
        <div className={cn("flex-1", variant === "vertical" && "mt-4")}>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-4 w-48 mb-4" />
          <div className="flex gap-2">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-10 h-10 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  const cardContent = (
    <>
      {/* Avatar */}
      <div
        className={cn(
          "relative flex-shrink-0 rounded-full overflow-hidden",
          "ring-2 ring-border ring-offset-2 ring-offset-background",
          variant === "compact" ? "w-16 h-16" : "w-24 h-24 tablet:w-32 tablet:h-32"
        )}
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover"
          sizes={variant === "compact" ? "64px" : "(max-width: 768px) 96px, 128px"}
        />
      </div>

      {/* Details */}
      <div
        className={cn(
          "flex flex-col",
          variant === "vertical" && "items-center mt-4",
          variant === "horizontal" && "flex-1"
        )}
      >
        <h3
          className={cn(
            "font-display font-semibold text-foreground",
            variant === "compact" ? "text-lg" : "text-xl tablet:text-2xl"
          )}
        >
          {name}
        </h3>
        <p
          className={cn(
            "text-muted-foreground mt-1",
            variant === "compact" ? "text-sm" : "text-base"
          )}
        >
          {title}
        </p>
        <a
          href={`mailto:${email}`}
          className={cn(
            "text-primary mt-2 transition-colors",
            "hover:text-primary/80 underline underline-offset-4",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded",
            variant === "compact" ? "text-sm" : "text-base"
          )}
        >
          {email}
        </a>

        {/* Social links */}
        {socialLinks.length > 0 && (
          <div
            className={cn(
              "flex flex-wrap gap-1 mt-4",
              variant === "vertical" && "justify-center"
            )}
          >
            {socialLinks.map((link) => (
              <SocialLink
                key={link.url}
                href={link.url!}
                label={link.label}
                icon={link.icon}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );

  return (
    <FadeIn direction="up">
      <div
        className={cn(
          "rounded-lg p-6",
          variant === "horizontal" && "flex items-start gap-6",
          variant === "vertical" && "flex flex-col items-center text-center",
          variant === "compact" && "flex items-center gap-4",
          className
        )}
      >
        {cardContent}
      </div>
    </FadeIn>
  );
}

EnhancedPersonCard.displayName = "EnhancedPersonCard";
