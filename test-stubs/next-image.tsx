/**
 * Stub for `next/image` used by Vitest.
 *
 * Replaces Next's <Image> with a plain <img> so we never load
 * nextjs-app/node_modules/next/dist/client/image-component.js (which carries a
 * second React copy and crashes jsdom with "Cannot read properties of null
 * (reading 'useContext')").
 *
 * Faithful enough for unit-level tests: shape-compatible with the StaticImageData
 * type, drops Next-specific props that <img> rejects.
 */
import React from "react";

type ImgProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src?: string | { src: string } | unknown;
  width?: number | string;
  height?: number | string;
  fill?: boolean;
  priority?: boolean;
  placeholder?: string;
  blurDataURL?: string;
  quality?: number | string;
  sizes?: string;
  loader?: unknown;
  unoptimized?: boolean;
};

function resolveSrc(src: ImgProps["src"]): string {
  if (!src) return "";
  if (typeof src === "string") return src;
  if (typeof src === "object" && src !== null && "src" in src) {
    return String((src as { src: unknown }).src ?? "");
  }
  return "";
}

const NextImage = React.forwardRef<HTMLImageElement, ImgProps>(function NextImage(
  props,
  ref,
) {
  const {
    src,
    fill: _fill,
    priority,
    placeholder: _placeholder,
    blurDataURL: _blurDataURL,
    quality: _quality,
    loader: _loader,
    unoptimized: _unoptimized,
    sizes,
    loading,
    ...rest
  } = props;
  const resolvedLoading = loading ?? (priority ? "eager" : "lazy");
  return (
    <img
      ref={ref}
      src={resolveSrc(src)}
      sizes={sizes}
      loading={resolvedLoading}
      {...rest}
    />
  );
});

export default NextImage;
// Mirror runtime exports so `import { type } from 'next/image'` keeps working.
export type StaticImageData = {
  src: string;
  width?: number;
  height?: number;
  blurDataURL?: string;
};
export type ImageProps = ImgProps;
export type ImageLoaderProps = { src: string; width: number; quality?: number };
export type ImageLoader = (props: ImageLoaderProps) => string;
