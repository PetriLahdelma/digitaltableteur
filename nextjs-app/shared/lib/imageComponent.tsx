"use client";

import React, {
  createContext,
  useContext,
  type CSSProperties,
  type ComponentType,
} from "react";

/** A static image import (next/image's StaticImageData shape) or a URL string. */
export type ImageSource =
  | string
  | {
      src: string;
      height: number;
      width: number;
      blurDataURL?: string;
      blurWidth?: number;
      blurHeight?: number;
    };

export interface ImageComponentProps {
  src: ImageSource;
  alt: string;
  width?: number;
  height?: number;
  /** Absolutely fill the positioned parent (next/image `fill`). */
  fill?: boolean;
  sizes?: string;
  /** Eager-load an above-the-fold image (next/image `priority`). */
  priority?: boolean;
  loading?: "eager" | "lazy";
  /** next/image optimization opt-out; ignored by the plain <img> default. */
  unoptimized?: boolean;
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  draggable?: boolean;
  className?: string;
  style?: CSSProperties;
  onClick?: React.MouseEventHandler<HTMLElement>;
  onLoad?: React.ReactEventHandler<HTMLElement>;
  onError?: React.ReactEventHandler<HTMLElement>;
}

/**
 * Framework-agnostic default: a plain <img> that maps the next/image-shaped
 * props (fill, priority, sizes) to native equivalents. Loses build-time
 * optimization; the host app injects next/image via ImageProvider to restore
 * it. Modelled on the SVG fallback already used in BlogMediaImage.
 */
const DefaultImage: ComponentType<ImageComponentProps> = ({
  src,
  alt,
  width,
  height,
  fill,
  sizes,
  priority,
  loading,
  // next/image-only props: drop from the plain <img> default.
  unoptimized: _unoptimized,
  quality: _quality,
  placeholder: _placeholder,
  blurDataURL: _blurDataURL,
  className,
  style,
  ...rest
}) => {
  const resolvedSrc = typeof src === "string" ? src : src.src;
  const fillStyle: CSSProperties | undefined = fill
    ? { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }
    : undefined;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- framework-agnostic default; app injects next/image
    <img
      src={resolvedSrc}
      alt={alt}
      {...(fill ? {} : { width, height })}
      sizes={sizes}
      loading={loading ?? (priority ? "eager" : "lazy")}
      decoding="async"
      className={className}
      style={fillStyle ? { ...fillStyle, ...style } : style}
      {...rest}
    />
  );
};

const ImageComponentContext =
  createContext<ComponentType<ImageComponentProps>>(DefaultImage);

/** Inject the image implementation catalog components render through. */
export function ImageProvider({
  component,
  children,
}: {
  component: ComponentType<ImageComponentProps>;
  children: React.ReactNode;
}) {
  return (
    <ImageComponentContext.Provider value={component}>
      {children}
    </ImageComponentContext.Provider>
  );
}

/**
 * Design-system image. Import this instead of `next/image`; it renders the
 * injected image component (a plain `<img>` when no provider is present). Being
 * a component (not a hook) it composes inside server components too.
 */
export const Image: ComponentType<ImageComponentProps> = (props) => {
  const Component = useContext(ImageComponentContext);
  return <Component {...props} />;
};
