"use client";

import { useState } from "react";
import { cn } from "../../lib/cn";
import { isSvgSrc } from "@/lib/media/imageSrc";
import { BlogMediaImage } from "@dt/BlogMediaImage";

export interface MdxImageProps {
  /** Image source URL */
  src?: string;
  /** Alternative text for accessibility */
  alt?: string;
  /** Image width (defaults to 800 for responsive sizing) */
  width?: number;
  /** Image height (defaults to 400 for responsive sizing) */
  height?: number;
  /** Optional title attribute */
  title?: string;
  /** Custom className */
  className?: string;
  /** Loading priority - set true for above-fold images */
  priority?: boolean;
  /** Span container width (used inside article figures). */
  fluid?: boolean;
  /** Object fit for raster images */
  fit?: "cover" | "contain";
  /** Responsive sizes hint for next/image */
  sizes?: string;
}

/**
 * MdxImage - Optimized image component for MDX content
 *
 * Uses Next.js Image component for automatic optimization:
 * - Responsive srcset generation
 * - WebP/AVIF format conversion
 * - Lazy loading by default
 * - Blur placeholder for local images
 *
 * @example
 * ```mdx
 * ![Alt text](/images/photo.jpg)
 * ```
 */
export function MdxImage({
  src,
  alt = "",
  width = 800,
  height = 400,
  title,
  className,
  priority = false,
  fluid = false,
  fit = "cover",
  sizes,
}: MdxImageProps) {
  const [hasError, setHasError] = useState(false);

  // Handle missing src
  if (!src) {
    return null;
  }

  const isExternal =
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("//");

  if (hasError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        title={title}
        className={cn("max-w-full h-auto rounded-lg", className)}
        loading="lazy"
      />
    );
  }

  if (isSvgSrc(src)) {
    return (
      <BlogMediaImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn("rounded-lg", className)}
        priority={priority}
        fit="contain"
      />
    );
  }

  return (
    <BlogMediaImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn("rounded-lg", className)}
      priority={priority}
      sizes={
        sizes ??
        (fluid
          ? "(max-width: 768px) 100vw, (max-width: 1200px) 72rem, 896px"
          : "(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px")
      }
      onError={() => setHasError(true)}
      fit={fit}
      fluid={fluid}
    />
  );
}

MdxImage.displayName = "MdxImage";

export default MdxImage;
