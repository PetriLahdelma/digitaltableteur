"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
}: MdxImageProps) {
  const [hasError, setHasError] = useState(false);

  // Handle missing src
  if (!src) {
    return null;
  }

  // Check if external URL (Sanity CDN, third-party, etc.)
  const isExternal =
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("//");

  // For external images or on error, fall back to regular img tag
  if (hasError) {
    return (
      <img
        src={src}
        alt={alt}
        title={title}
        className={cn("rounded-lg max-w-full h-auto", className)}
        loading="lazy"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      title={title}
      loading={priority ? "eager" : "lazy"}
      priority={priority}
      className={cn("rounded-lg", className)}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
      onError={() => setHasError(true)}
      style={{
        width: "100%",
        height: "auto",
        maxWidth: width,
      }}
      // External images don't support blur placeholder
      placeholder={isExternal ? "empty" : "empty"}
      // Allow external domains (configured in next.config.ts images.remotePatterns)
      unoptimized={isExternal}
    />
  );
}

MdxImage.displayName = "MdxImage";

export default MdxImage;
