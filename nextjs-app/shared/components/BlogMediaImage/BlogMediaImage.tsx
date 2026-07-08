"use client";

import { Image } from "../../lib/imageComponent";
import { cn } from "../../lib/cn";
import { isSvgSrc } from "@/lib/media/imageSrc";

export interface BlogMediaImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
  /** Diagram heroes should use contain; photos use cover. */
  fit?: "cover" | "contain";
  /** When true, image spans its container (no max-width cap from width prop). */
  fluid?: boolean;
}

/**
 * Responsive article image for blog prose. Renders raster sources through
 * `next/image` (external URLs unoptimised) and SVG sources as a plain `img`
 * (next/image renders SVG unreliably), and supports fill, `cover`/`contain`
 * fit and a fluid full-bleed mode. Use inside article bodies instead of a raw
 * `img`.
 */
export function BlogMediaImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  priority = false,
  sizes,
  onLoad,
  onError,
  fit = "cover",
  fluid = false,
}: BlogMediaImageProps) {
  const fitClass = fit === "contain" ? "object-contain" : "object-cover";

  if (isSvgSrc(src)) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element -- SVG: next/image does not render reliably
        <img
          src={src}
          alt={alt}
          className={cn("absolute inset-0 h-full w-full", fitClass, className)}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={onLoad}
          onError={onError}
        />
      );
    }

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn("h-auto max-w-full", className)}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={onLoad}
        onError={onError}
      />
    );
  }

  const isExternal =
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("//");

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={cn(fitClass, className)}
        priority={priority}
        sizes={sizes}
        onLoad={onLoad}
        onError={onError}
        unoptimized={isExternal}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 800}
      height={height ?? 400}
      className={className}
      priority={priority}
      sizes={sizes}
      onLoad={onLoad}
      onError={onError}
      unoptimized={isExternal}
      style={
        fluid
          ? { width: "100%", height: "auto", maxWidth: "none" }
          : { width: "100%", height: "auto", maxWidth: width }
      }
    />
  );
}

BlogMediaImage.displayName = "BlogMediaImage";
