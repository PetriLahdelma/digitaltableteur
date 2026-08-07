import React from "react";
export interface GalleryImage {
    src: string;
    fallback?: string;
    alt: string;
    caption?: string;
    srcSet?: string;
    sizes?: string;
    fallbackSrcSet?: string;
}
export interface GalleryProps {
    images: GalleryImage[];
    minColumnWidth?: number;
    gutter?: number;
}
/**
 * Responsive image gallery grid with click-to-expand lightbox.
 */
declare const Gallery: React.FC<GalleryProps>;
export default Gallery;
//# sourceMappingURL=Gallery.d.ts.map