/**
 * Stub for `next/image` used by Vitest and Storybook (Vite alias).
 *
 * Replaces Next's <Image> with a plain <img> so we never load
 * nextjs-app/node_modules/next/dist/client/image-component.js (which carries a
 * second React copy and crashes jsdom with "Cannot read properties of null
 * (reading 'useContext')").
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

const fillStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
};

const NextImage = React.forwardRef<HTMLImageElement, ImgProps>(function NextImage(
  props,
  ref,
) {
  const {
    src,
    fill,
    priority,
    placeholder: _placeholder,
    blurDataURL: _blurDataURL,
    quality: _quality,
    loader: _loader,
    unoptimized: _unoptimized,
    sizes,
    loading,
    style,
    width: _width,
    height: _height,
    ...rest
  } = props;
  const resolvedLoading = loading ?? (priority ? "eager" : "lazy");
  const resolvedSrc = resolveSrc(src);

  if (fill) {
    return (
      <img
        ref={ref}
        src={resolvedSrc}
        sizes={sizes}
        loading={resolvedLoading}
        style={{
          ...fillStyle,
          ...(typeof style === "object" && style !== null ? style : {}),
        }}
        {...rest}
      />
    );
  }

  return (
    <img
      ref={ref}
      src={resolvedSrc}
      width={_width}
      height={_height}
      sizes={sizes}
      loading={resolvedLoading}
      style={style}
      {...rest}
    />
  );
});

export default NextImage;
export type StaticImageData = {
  src: string;
  width?: number;
  height?: number;
  blurDataURL?: string;
};
export type ImageProps = ImgProps;
export type ImageLoaderProps = { src: string; width: number; quality?: number };
export type ImageLoader = (props: ImageLoaderProps) => string;
