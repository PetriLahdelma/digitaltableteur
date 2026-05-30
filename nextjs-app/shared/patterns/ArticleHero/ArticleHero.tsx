"use client";

import Image from "next/image";
import Link from "next/link";
import { BlogMediaImage } from "@dt/BlogMediaImage";
import { isSvgSrc } from "@/lib/media/imageSrc";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Container } from "../../components/Container";
import { Section } from "../../components/Section";
import { TextReveal } from "../../components/animations/TextReveal";
import { FadeIn } from "../../components/animations/FadeIn";

export interface ArticleHeroProps {
  /** Article title */
  title: string;
  /** Featured image */
  image?: {
    src: string;
    alt: string;
    caption?: string;
  };
  /** Author information */
  author?: {
    name: string;
    slug?: string;
    imageUrl?: string;
  };
  /** Publication date (ISO string) */
  publishedAt?: string;
  /** Read time (e.g., "5 min read") */
  readTime?: string;
  /** Article tags */
  tags?: string[];
  /** Layout variant */
  variant?: "full-width" | "contained" | "minimal";
  /** Custom className */
  className?: string;
}

const formatDate = (iso: string, locale?: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const resolvedLocale =
    locale || (typeof navigator !== "undefined" ? navigator.language : "en");
  return new Intl.DateTimeFormat(resolvedLocale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export function ArticleHero({
  title,
  image,
  author,
  publishedAt,
  readTime,
  tags,
  variant = "contained",
  className,
}: ArticleHeroProps) {
  const { i18n } = useTranslation();
  const isFullWidth = variant === "full-width";
  const isMinimal = variant === "minimal";

  const formattedDate = publishedAt
    ? formatDate(publishedAt, i18n.language)
    : "";

  // Default avatar fallback
  const authorAvatar = author?.imageUrl || "/images/default-avatar.png";

  return (
    <Section
      spacing="none"
      background="default"
      className={cn("relative overflow-hidden", className)}
    >
      {/* Full-width background image */}
      {isFullWidth && image && (
        <div className="absolute inset-0 z-0">
          <BlogMediaImage
            src={image.src}
            alt={image.alt}
            fill
            fit={isSvgSrc(image.src) ? "contain" : "cover"}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
        </div>
      )}

      <Container
        size="md"
        className={cn(
          "relative z-10",
          isFullWidth
            ? "min-h-[60vh] flex flex-col justify-end pb-16"
            : "py-12 tablet:py-16 desktop:py-20"
        )}
      >
        <div className="space-y-6">
          {/* Tags */}
          {tags && tags.length > 0 && !isMinimal && (
            <FadeIn direction="up" delay={0} distance={20}>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className={cn(
                      "px-3 py-1 text-xs font-body font-medium rounded-full",
                      isFullWidth
                        ? "bg-white/10 text-white/90"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </FadeIn>
          )}

          {/* Title */}
          <TextReveal
            type="words"
            animation="fade"
            duration={0.6}
            stagger={0.04}
            className={cn(
              "font-display font-bold",
              "text-3xl tablet:text-4xl desktop:text-5xl",
              isFullWidth ? "text-white" : "text-foreground",
              "leading-tight tracking-tight"
            )}
            as="h1"
          >
            {title}
          </TextReveal>

          {/* Meta row: author, date, read time */}
          <FadeIn direction="up" delay={0.3} distance={30}>
            <div
              className={cn(
                "flex flex-wrap items-center gap-4",
                isFullWidth ? "text-white/80" : "text-muted-foreground"
              )}
            >
              {/* Author */}
              {author && (
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted">
                    <Image
                      src={authorAvatar}
                      alt={author.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  {author.slug ? (
                    <Link
                      href={`/blog/authors/${author.slug}`}
                      className={cn(
                        "font-body font-medium hover:underline",
                        isFullWidth ? "text-white" : "text-foreground"
                      )}
                    >
                      {author.name}
                    </Link>
                  ) : (
                    <span
                      className={cn(
                        "font-body font-medium",
                        isFullWidth ? "text-white" : "text-foreground"
                      )}
                    >
                      {author.name}
                    </span>
                  )}
                </div>
              )}

              {/* Separator */}
              {author && (formattedDate || readTime) && (
                <span
                  className={cn(
                    "hidden tablet:inline",
                    isFullWidth ? "text-white/40" : "text-border"
                  )}
                >
                  |
                </span>
              )}

              {/* Date */}
              {formattedDate && (
                <span className="font-body text-sm">{formattedDate}</span>
              )}

              {/* Separator */}
              {formattedDate && readTime && (
                <span
                  className={cn(
                    isFullWidth ? "text-white/40" : "text-border"
                  )}
                >
                  ·
                </span>
              )}

              {/* Read time */}
              {readTime && (
                <span className="font-body text-sm">{readTime}</span>
              )}
            </div>
          </FadeIn>
        </div>
      </Container>

      {/* Contained image (not for full-width or minimal) */}
      {!isFullWidth && !isMinimal && image && (
        <Container size="md" className="pb-8">
          <FadeIn direction="up" delay={0.4} distance={40}>
            <figure className="relative overflow-hidden rounded-lg bg-muted">
              <div
                className={cn(
                  "relative aspect-video",
                  isSvgSrc(image.src) && "bg-[#0a0c10]",
                )}
              >
                <BlogMediaImage
                  src={image.src}
                  alt={image.alt}
                  fill
                  fit={isSvgSrc(image.src) ? "contain" : "cover"}
                  priority
                />
              </div>
              {image.caption && (
                <figcaption className="p-4 text-sm font-body text-muted-foreground text-center">
                  {image.caption}
                </figcaption>
              )}
            </figure>
          </FadeIn>
        </Container>
      )}
    </Section>
  );
}

ArticleHero.displayName = "ArticleHero";
