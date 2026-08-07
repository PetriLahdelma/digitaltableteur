import React, { type CSSProperties, type ComponentType } from "react";
/** A static image import (next/image's StaticImageData shape) or a URL string. */
export type ImageSource = string | {
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
/** Inject the image implementation catalog components render through. */
export declare function ImageProvider({ component, children, }: {
    component: ComponentType<ImageComponentProps>;
    children: React.ReactNode;
}): React.JSX.Element;
/**
 * Design-system image. Import this instead of `next/image`; it renders the
 * injected image component (a plain `<img>` when no provider is present). Being
 * a component (not a hook) it composes inside server components too.
 */
export declare const Image: ComponentType<ImageComponentProps>;
//# sourceMappingURL=imageComponent.d.ts.map