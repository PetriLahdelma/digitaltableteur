"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { cn } from "../../lib/cn";
import { gsap, useGSAP } from "../../lib/gsap";
import { useAnimationContext } from "../../lib/animation";
import { Container } from "../../components/Container";
import { Section } from "../../components/Section";
import { TextReveal } from "../../components/animations/TextReveal";
import { FadeIn } from "../../components/animations/FadeIn";
import { ScrollIndicator } from "../../components/ScrollIndicator";

export interface ProjectHeroImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ProjectHeroVideo {
  src: string;
  poster?: string;
  alt: string;
  playbackRate?: number;
}

export interface ProjectHeroProps {
  /** Project title */
  title: string;
  /** Project description/tagline */
  description?: string;
  /** Hero image */
  image?: ProjectHeroImage;
  /** Hero video (takes precedence over image when provided) */
  video?: ProjectHeroVideo;
  /** Project category */
  category?: string;
  /** Project tags */
  tags?: string[];
  /** Project date/duration */
  date?: string;
  /** Live project URL */
  liveUrl?: string;
  /** Hero layout variant */
  variant?: "full-width" | "contained" | "split";
  /** Show scroll indicator */
  showScrollIndicator?: boolean;
  /** Custom className */
  className?: string;
}

export function ProjectHero({
  title,
  description,
  image,
  video,
  category,
  tags,
  date,
  liveUrl,
  variant = "contained",
  showScrollIndicator = true,
  className,
}: ProjectHeroProps) {
  const isFullWidth = variant === "full-width";
  const isSplit = variant === "split";
  const hasVideo = Boolean(video?.src);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    const rate = video?.playbackRate;
    if (rate !== undefined && Number.isFinite(rate) && rate > 0) {
      videoRef.current.playbackRate = rate;
    }
  }, [video?.playbackRate, video?.src]);

  const tagsRef = useRef<HTMLDivElement>(null);
  const { motionPreference } = useAnimationContext();

  useGSAP(
    () => {
      if (motionPreference === "reduced" || !tagsRef.current) return;

      const tagElements = tagsRef.current.querySelectorAll("[data-tag]");
      if (!tagElements.length) return;

      gsap.set(tagElements, { opacity: 0, y: 10, scale: 0.9 });

      gsap.to(tagElements, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.4,
        stagger: 0.06,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: tagsRef.current,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      });
    },
    { scope: tagsRef, dependencies: [motionPreference] },
  );

  return (
    <Section
      spacing="none"
      background="default"
      className={cn("relative overflow-hidden", className)}
    >
      {/* Full-width background image/video */}
      {isFullWidth && (
        <div className="absolute inset-0 z-0">
          {hasVideo ? (
            <video
              ref={videoRef}
              aria-label={video!.alt}
              autoPlay
              loop
              muted
              playsInline
              poster={video!.poster}
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source
                src={video!.src}
                type={video!.src.endsWith(".webm") ? "video/webm" : "video/mp4"}
              />
            </video>
          ) : (
            image && (
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                priority
              />
            )
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        </div>
      )}

      <Container
        size="lg"
        className={cn(
          "relative z-10",
          isFullWidth
            ? "min-h-[70vh] flex flex-col justify-end pb-16"
            : "py-12 tablet:py-16 desktop:py-20",
        )}
      >
        {isSplit ? (
          /* Split layout: title/meta on left, image on right */
          <div className="grid grid-cols-1 desktop:grid-cols-2 gap-8 desktop:gap-12 items-center">
            {/* Content */}
            <div className="space-y-6">
              {/* Meta (category, date) */}
              {(category || date) && (
                <FadeIn direction="up" delay={0} distance={20}>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-foreground/60">
                    {category && (
                      <span className="font-medium uppercase tracking-wider text-xs">
                        {category}
                      </span>
                    )}
                    {category && date && (
                      <span className="text-foreground/40">|</span>
                    )}
                    {date && <span>{date}</span>}
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
                  "text-foreground leading-tight tracking-tight",
                )}
                as="h1"
              >
                {title}
              </TextReveal>

              {/* Description */}
              {description && (
                <FadeIn direction="up" delay={0.3} distance={30}>
                  <p
                    className={cn(
                      "font-body text-lg tablet:text-xl",
                      "text-foreground",
                      "max-w-xl leading-relaxed",
                    )}
                  >
                    {description}
                  </p>
                </FadeIn>
              )}

              {/* Tags */}
              {tags && tags.length > 0 && (
                <FadeIn direction="up" delay={0.4} distance={20}>
                  <div ref={tagsRef} className="flex flex-wrap gap-2 pt-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        data-tag
                        className="px-2.5 py-1 text-xs font-body text-foreground bg-foreground/8 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </FadeIn>
              )}

              {/* Live URL */}
              {liveUrl && (
                <FadeIn direction="up" delay={0.5} distance={20}>
                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors pt-2"
                  >
                    Visit Live Site
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </FadeIn>
              )}
            </div>

            {/* Image/Video */}
            <div className="overflow-hidden rounded-lg bg-muted">
              {hasVideo ? (
                <video
                  ref={videoRef}
                  aria-label={video!.alt}
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster={video!.poster}
                  className="w-full h-auto object-cover"
                >
                  <source
                    src={video!.src}
                    type={
                      video!.src.endsWith(".webm")
                        ? "video/webm"
                        : "video/mp4"
                    }
                  />
                </video>
              ) : (
                image && (
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    className="w-full h-auto object-cover"
                    priority
                  />
                )
              )}
            </div>
          </div>
        ) : (
          /* Default/contained/full-width layout: stacked */
          <div className="space-y-6 tablet:space-y-8">
            {/* Meta (category, date) */}
            {(category || date) && (
              <FadeIn direction="up" delay={0} distance={20}>
                <div
                  className={cn(
                    "flex flex-wrap items-center gap-3 text-sm",
                    isFullWidth ? "text-white/80" : "text-foreground/60",
                  )}
                >
                  {category && (
                    <span className="font-medium uppercase tracking-wider text-xs">
                      {category}
                    </span>
                  )}
                  {category && date && (
                    <span
                      className={
                        isFullWidth ? "text-white/50" : "text-foreground/40"
                      }
                    >
                      |
                    </span>
                  )}
                  {date && <span>{date}</span>}
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
                "leading-tight tracking-tight",
                "max-w-3xl",
              )}
              as="h1"
            >
              {title}
            </TextReveal>

            {/* Description */}
            {description && (
              <FadeIn direction="up" delay={0.3} distance={30}>
                <p
                  className={cn(
                    "font-body text-lg tablet:text-xl",
                    isFullWidth ? "text-white/80" : "text-foreground",
                    "max-w-2xl leading-relaxed",
                  )}
                >
                  {description}
                </p>
              </FadeIn>
            )}

            {/* Tags */}
            {tags && tags.length > 0 && (
              <FadeIn direction="up" delay={0.4} distance={20}>
                <div ref={tagsRef} className="flex flex-wrap gap-2 pt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      data-tag
                      className={cn(
                        "px-2.5 py-1 text-xs font-body rounded-full",
                        isFullWidth
                          ? "bg-white/10 text-white/90"
                          : "text-foreground bg-foreground/8",
                      )}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </FadeIn>
            )}

            {/* Live URL */}
            {liveUrl && (
              <FadeIn direction="up" delay={0.5} distance={20}>
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex items-center gap-2 text-sm font-medium transition-colors pt-2",
                    isFullWidth
                      ? "text-white hover:text-white/80"
                      : "text-foreground hover:text-foreground/80",
                  )}
                >
                  Visit Live Site
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </FadeIn>
            )}

            {/* Contained image/video (not for full-width) */}
            {!isFullWidth && (hasVideo || image) && (
              <div className="overflow-hidden rounded-lg mt-8">
                {hasVideo ? (
                  <video
                    ref={videoRef}
                    aria-label={video!.alt}
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster={video!.poster}
                    className="w-full h-auto object-cover"
                  >
                    <source
                      src={video!.src}
                      type={
                        video!.src.endsWith(".webm")
                          ? "video/webm"
                          : "video/mp4"
                      }
                    />
                  </video>
                ) : (
                  image && (
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={image.width}
                      height={image.height}
                      className="w-full h-auto object-cover"
                      priority
                    />
                  )
                )}
              </div>
            )}
          </div>
        )}
      </Container>

      {/* Scroll indicator */}
      {showScrollIndicator && (
        <ScrollIndicator className={cn("z-20", isFullWidth && "text-white")} />
      )}
    </Section>
  );
}

ProjectHero.displayName = "ProjectHero";
