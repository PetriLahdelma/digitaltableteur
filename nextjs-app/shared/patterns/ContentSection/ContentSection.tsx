"use client";

import { type ReactNode, type CSSProperties } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Container } from "../../components/Container";
import { Section } from "../../components/Section";
import { FadeIn } from "../../components/animations/FadeIn";

export interface ContentImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  /** CSS mix-blend-mode for the image */
  mixBlendMode?: CSSProperties["mixBlendMode"];
}

export interface ContentSectionProps {
  /** Subtitle/eyebrow text */
  subtitle?: string;
  /** Section title */
  title: string;
  /** Rich text content */
  content: ReactNode;
  /** Single image or array of images */
  images?: ContentImage | ContentImage[];
  /** Image layout */
  imageLayout?: "none" | "single" | "grid" | "side-by-side";
  /** Background variant */
  background?: "default" | "muted" | "accent";
  /** Custom className */
  className?: string;
}

const backgroundClasses: Record<NonNullable<ContentSectionProps["background"]>, string> = {
  default: "bg-background",
  muted: "bg-muted/30",
  accent: "bg-primary/5",
};

export function ContentSection({
  subtitle,
  title,
  content,
  images,
  imageLayout = "none",
  background = "default",
  className,
}: ContentSectionProps) {
  // Normalize images to array
  const imageArray = images
    ? Array.isArray(images)
      ? images
      : [images]
    : [];

  // Determine effective layout
  const effectiveLayout =
    imageLayout === "none" || imageArray.length === 0
      ? "none"
      : imageLayout;

  return (
    <Section
      spacing="lg"
      background="default"
      className={cn(backgroundClasses[background], className)}
    >
      <Container size="md">
        <div className="space-y-6">
          {/* Subtitle */}
          {subtitle && (
            <FadeIn direction="up" delay={0} distance={15}>
              <span className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                {subtitle}
              </span>
            </FadeIn>
          )}

          {/* Title */}
          <FadeIn direction="up" delay={0.1} distance={20}>
            <h2 className="font-display font-bold text-2xl tablet:text-3xl desktop:text-4xl text-foreground leading-tight">
              {title}
            </h2>
          </FadeIn>

          {/* Content */}
          <FadeIn direction="up" delay={0.2} distance={25}>
            <div className="prose prose-neutral dark:prose-invert max-w-none font-body">
              {content}
            </div>
          </FadeIn>

          {/* Images */}
          {effectiveLayout !== "none" && imageArray.length > 0 && (
            <FadeIn direction="up" delay={0.3} distance={30}>
              <div className="mt-8">
                {effectiveLayout === "single" && (
                  <figure>
                    <div className="relative overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={imageArray[0].src}
                        alt={imageArray[0].alt}
                        width={imageArray[0].width}
                        height={imageArray[0].height}
                        className="w-full h-auto"
                        style={{
                          mixBlendMode: imageArray[0].mixBlendMode,
                        }}
                      />
                    </div>
                    {imageArray[0].caption && (
                      <figcaption className="mt-3 text-sm text-muted-foreground text-center italic">
                        {imageArray[0].caption}
                      </figcaption>
                    )}
                  </figure>
                )}

                {effectiveLayout === "grid" && (
                  <div
                    className={cn(
                      "grid gap-4",
                      imageArray.length === 2 && "grid-cols-1 tablet:grid-cols-2",
                      imageArray.length >= 3 && "grid-cols-1 tablet:grid-cols-2"
                    )}
                  >
                    {imageArray.map((image, index) => (
                      <figure key={`${image.src}-${index}`}>
                        <div className="relative overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={image.src}
                            alt={image.alt}
                            width={image.width}
                            height={image.height}
                            className="w-full h-auto"
                            style={{
                              mixBlendMode: image.mixBlendMode,
                            }}
                          />
                        </div>
                        {image.caption && (
                          <figcaption className="mt-2 text-sm text-muted-foreground text-center italic">
                            {image.caption}
                          </figcaption>
                        )}
                      </figure>
                    ))}
                  </div>
                )}

                {effectiveLayout === "side-by-side" && imageArray.length >= 2 && (
                  <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4 items-start">
                    {imageArray.slice(0, 2).map((image, index) => (
                      <figure key={`${image.src}-${index}`}>
                        <div className="relative overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={image.src}
                            alt={image.alt}
                            width={image.width}
                            height={image.height}
                            className="w-full h-auto"
                            style={{
                              mixBlendMode: image.mixBlendMode,
                            }}
                          />
                        </div>
                        {image.caption && (
                          <figcaption className="mt-2 text-sm text-muted-foreground text-center italic">
                            {image.caption}
                          </figcaption>
                        )}
                      </figure>
                    ))}
                  </div>
                )}
              </div>
            </FadeIn>
          )}
        </div>
      </Container>
    </Section>
  );
}

ContentSection.displayName = "ContentSection";
