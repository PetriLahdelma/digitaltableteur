import React, { useMemo } from "react";
import styles from "./Gallery.module.css";
import { motion } from "framer-motion";

export interface GalleryImage {
  src: string;
  fallback?: string;
  alt: string;
  caption?: string;
}

interface GalleryProps {
  images: GalleryImage[];
  minColumnWidth?: number;
  gutter?: number;
}

const Gallery: React.FC<GalleryProps> = ({
  images,
  minColumnWidth = 320,
  gutter = 32,
}) => {
  // Responsive column count
  const [columns, setColumns] = React.useState(4);

  React.useEffect(() => {
    function handleResize() {
      if (typeof window !== "undefined") {
        const width = window.innerWidth;
        if (width < 600) setColumns(1);
        else if (width < 900) setColumns(2);
        else if (width < 1200) setColumns(3);
        else setColumns(4);
      }
    }
    handleResize();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
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
          {col.map((img, idx) => (
            <motion.figure
              className={styles.item}
              key={img.src + idx}
              tabIndex={0}
              whileHover={{ scale: 1.03 }}
              whileFocus={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {img.fallback ? (
                <picture>
                  <source srcSet={img.src} type="image/webp" />
                  <img
                    src={img.fallback}
                    alt={img.alt}
                    loading="lazy"
                    className={styles.image}
                  />
                </picture>
              ) : (
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className={styles.image}
                />
              )}
              {img.caption && (
                <figcaption className={styles.caption}>
                  {img.caption}
                </figcaption>
              )}
            </motion.figure>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Gallery;
