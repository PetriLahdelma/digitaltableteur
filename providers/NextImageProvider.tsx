"use client";

import NextImage from "next/image";
import type { ReactNode } from "react";
import {
  ImageProvider,
  type ImageComponentProps,
} from "@digitaltableteur/react";
import { ImageProvider as LocalImageProvider } from "@/nextjs-app/shared/lib/imageComponent";

/** Adapts next/image to the design-system ImageComponent contract. */
function NextImageAdapter({ src, alt, ...rest }: ImageComponentProps) {
  return <NextImage src={src} alt={alt} {...rest} />;
}

/**
 * Injects next/image as the design system's image implementation for the app,
 * so catalog components keep build-time image optimization while importing only
 * the framework-agnostic DS `Image`.
 */
export function NextImageProvider({ children }: { children: ReactNode }) {
  // Two module instances (npm package + local shared source) hold separate
  // ImageComponentContexts; provide into both so local components (Avatar,
  // ProjectGallery, cards) keep next/image optimization instead of falling
  // back to plain <img>.
  return (
    <ImageProvider component={NextImageAdapter}>
      <LocalImageProvider component={NextImageAdapter}>
        {children}
      </LocalImageProvider>
    </ImageProvider>
  );
}
