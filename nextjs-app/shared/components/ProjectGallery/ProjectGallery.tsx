"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Lightbox, type LightboxImage } from "../Lightbox";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface GalleryImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}

export interface ProjectGalleryProps {
  /** Array of images to display */
  images: GalleryImage[];
  /** Number of columns */
  columns?: 2 | 3 | 4;
  /** Gap size between images */
  gap?: "sm" | "md" | "lg";
  /** Aspect ratio for thumbnails */
  aspectRatio?: "square" | "video" | "mixed";
  /** Enable lightbox on click */
  enableLightbox?: boolean;
  /** Custom className */
  className?: string;
}

const gapClasses: Record<NonNullable<ProjectGalleryProps["gap"]>, string> = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
};

const columnClasses: Record<NonNullable<ProjectGalleryProps["columns"]>, string> = {
  2: "grid-cols-1 tablet:grid-cols-2",
  3: "grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3",
  4: "grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4",
};

const aspectClasses: Record<"square" | "video", string> = {
  square: "aspect-square",
  video: "aspect-video",
};

/**
 * Responsive image grid for a project case study. Renders each image as a
 * figure in a labelled `role="list"` grid; when `enableLightbox` is set (the
 * default) each thumbnail is a button that opens the shared Lightbox. Items
 * stagger in on scroll via GSAP, gated behind a reduced-motion check.
 */
export function ProjectGallery({
  images,
  columns = 3,
  gap = "md",
  aspectRatio = "mixed",
  enableLightbox = true,
  className,
}: ProjectGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);

  const handleImageClick = useCallback(
    (index: number) => {
      if (enableLightbox) {
        setLightboxIndex(index);
        setLightboxOpen(true);
      }
    },
    [enableLightbox]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (enableLightbox && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        handleImageClick(index);
      }
    },
    [enableLightbox, handleImageClick]
  );

  // Staggered animation for gallery items
  useGSAP(
    () => {
      if (!galleryRef.current) return;

      const items = galleryRef.current.querySelectorAll("[data-gallery-item]");
      if (!items.length) return;

      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) return;

      gsap.set(items, { opacity: 0, y: 30 });

      ScrollTrigger.create({
        trigger: galleryRef.current,
        start: "top 80%",
        once: true,
        onEnter: () => {
          gsap.to(items, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
          });
        },
      });
    },
    { scope: galleryRef, dependencies: [images] }
  );

  // Convert to lightbox format
  const lightboxImages: LightboxImage[] = images.map((img) => ({
    src: img.src,
    alt: img.alt,
    caption: img.caption,
  }));

  if (!images.length) return null;

  return (
    <>
      <div
        ref={galleryRef}
        className={cn(
          "grid",
          columnClasses[columns],
          gapClasses[gap],
          className
        )}
        role="list"
        aria-label="Project gallery"
      >
        {images.map((image, index) => (
          <figure
            key={`${image.src}-${index}`}
            data-gallery-item
            className="relative group"
            role="listitem"
          >
            <button
              type="button"
              onClick={() => handleImageClick(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              disabled={!enableLightbox}
              className={cn(
                "relative w-full overflow-hidden rounded-lg bg-muted",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                enableLightbox && "cursor-zoom-in",
                aspectRatio !== "mixed" && aspectClasses[aspectRatio]
              )}
              aria-label={enableLightbox ? `View ${image.alt} in fullscreen` : undefined}
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                className={cn(
                  "object-cover transition-transform duration-300",
                  enableLightbox && "group-hover:scale-105",
                  aspectRatio === "mixed" ? "w-full h-auto" : "w-full h-full"
                )}
                sizes={`(max-width: 768px) 100vw, (max-width: 1200px) ${100 / (columns === 4 ? 3 : columns === 3 ? 2 : 2)}vw, ${100 / columns}vw`}
              />
              {/* Hover overlay */}
              {enableLightbox && (
                <div
                  className={cn(
                    "absolute inset-0 bg-black/0 transition-colors duration-300",
                    "group-hover:bg-black/20"
                  )}
                />
              )}
            </button>
            {/* Caption */}
            {image.caption && (
              <figcaption className="mt-2 text-sm text-muted-foreground text-center">
                {image.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      {/* Lightbox */}
      {enableLightbox && (
        <Lightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
        />
      )}
    </>
  );
}

ProjectGallery.displayName = "ProjectGallery";
