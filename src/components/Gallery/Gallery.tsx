import React, { useMemo } from "react";
import styles from "./Gallery.module.css";
import { motion } from "framer-motion";

export interface GalleryImage {
  src: string;
  fallback?: string;
  alt: string;
  caption?: string;
  srcSet?: string;
  sizes?: string;
  fallbackSrcSet?: string;
}

interface GalleryProps {
  images: GalleryImage[];
  minColumnWidth?: number;
  gutter?: number;
}

const computeResponsiveSizes = (columnCount: number, gap: number) => {
  const safeColumns = Math.max(columnCount, 1);
  const gapPx = Number.isFinite(gap) ? gap : 0;
  const sharedGap = Math.max(safeColumns - 1, 0) * gapPx;
  return [
    `(max-width: 600px) calc(100vw - ${gapPx}px)`,
    `(max-width: 900px) calc((100vw - ${gapPx}px) / 2)`,
    `(max-width: 1200px) calc((100vw - ${gapPx}px) / 3)`,
    `calc((min(100vw, 1200px) - ${sharedGap}px) / ${safeColumns})`,
  ].join(", ");
};

const Gallery: React.FC<GalleryProps> = ({
  images,
  minColumnWidth = 320,
  gutter = 32,
}) => {
  // Responsive column count
  const [columns, setColumns] = React.useState(4);

  React.useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      if (width < 600) setColumns(1);
      else if (width < 900) setColumns(2);
      else if (width < 1200) setColumns(3);
      else setColumns(4);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Split images into columns for masonry effect
  const columnImages = useMemo(() => {
    const cols: GalleryImage[][] = Array.from({ length: columns }, () => []);
    images.forEach((img, i) => {
      cols[i % columns].push(img);
    });
    return cols;
  }, [images, columns]);

  return (
    <div className={styles.gallery} style={{ gap: gutter }}>
      {columnImages.map((col, colIdx) => (
        <div
          className={styles.column}
          key={colIdx}
          style={{ minWidth: 0, flex: 1, gap: gutter }}
        >
          {col.map((img, idx) => {
            const responsiveSizes =
              img.sizes ?? computeResponsiveSizes(columns, gutter);
            const primarySrcSet = img.srcSet ?? `${img.src} 1x`;
            const fallbackSrcSet = img.fallbackSrcSet
              ? img.fallbackSrcSet
              : img.fallback
                ? `${img.fallback} 1x`
                : undefined;
            const imageNode = img.fallback ? (
              <picture>
                <source
                  srcSet={primarySrcSet}
                  sizes={responsiveSizes}
                  type="image/webp"
                />
                <img
                  src={img.fallback}
                  srcSet={fallbackSrcSet}
                  sizes={responsiveSizes}
                  alt={img.alt}
                  loading="lazy"
                  decoding="async"
                  className={styles.image}
                />
              </picture>
            ) : (
              <img
                src={img.src}
                srcSet={primarySrcSet}
                sizes={responsiveSizes}
                alt={img.alt}
                loading="lazy"
                decoding="async"
                className={styles.image}
              />
            );
            return (
              <motion.figure
                className={styles.item}
                key={img.src + idx}
                tabIndex={0}
                whileHover={{ scale: 1.03 }}
                whileFocus={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {imageNode}
                {img.caption && (
                  <figcaption className={styles.caption}>
                    {img.caption}
                  </figcaption>
                )}
              </motion.figure>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Gallery;
