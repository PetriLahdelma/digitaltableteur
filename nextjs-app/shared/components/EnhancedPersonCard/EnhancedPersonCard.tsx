"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { FadeIn } from "../animations/FadeIn";
import {
  Linkedin,
  Github,
  Twitter,
  Facebook,
  Instagram,
  Mail,
} from "lucide-react";

// Social platform icons mapping
const SocialIcons = {
  linkedin: Linkedin,
  github: Github,
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
  dribbble: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12c6.627 0 12-5.373 12-12S18.627 0 12 0zm9.885 11.441c-2.575-.422-4.943-.445-7.103-.073-.244-.563-.497-1.125-.767-1.68 2.31-1 4.165-2.358 5.548-4.082a9.863 9.863 0 012.322 5.835zm-3.842-7.282c-1.205 1.554-2.868 2.783-4.986 3.68a46.287 46.287 0 00-3.488-5.438A9.894 9.894 0 0112 2.087c2.275 0 4.368.779 6.043 2.072zM7.527 3.166a44.59 44.59 0 013.537 5.381c-2.43.715-5.331 1.082-8.684 1.105a9.931 9.931 0 015.147-6.486zM2.087 12l.013-.256c3.849-.005 7.169-.448 9.95-1.322.233.475.456.952.67 1.432-3.38 1.057-6.165 3.222-8.337 6.48A9.865 9.865 0 012.087 12zm3.829 7.81c1.969-3.088 4.482-5.098 7.598-6.027a39.137 39.137 0 012.043 7.46 9.87 9.87 0 01-9.641-1.433zm11.586.43a41.098 41.098 0 00-1.92-6.897c1.876-.265 3.94-.196 6.199.196a9.923 9.923 0 01-4.279 6.701z"/>
    </svg>
  ),
  medium: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
    </svg>
  ),
  substack: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
    </svg>
  ),
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
