"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { createPortal } from "react-dom";
import Icon from "@dt/Icon";
import styles from "./Lightbox.module.css";

export interface LightboxImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface LightboxProps {
  images: LightboxImage[];
  initialIndex?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Lightbox({
  images,
  initialIndex = 0,
  open = false,
  onOpenChange,
}: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) setCurrentIndex(initialIndex);
  }, [open, initialIndex]);

  const close = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!open) return;

    previousActiveElement.current = document.activeElement as HTMLElement;

    const mainContent =
      document.getElementById("main-content") ||
      document.getElementById("__next") ||
      document.querySelector("main") ||
      document.body.firstElementChild;

    if (mainContent && mainContent !== document.body) {
      mainContent.setAttribute("inert", "");
    }

    const focusClose = () => {
      panelRef.current
        ?.querySelector<HTMLElement>("button")
        ?.focus();
    };
    requestAnimationFrame(focusClose);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (mainContent && mainContent !== document.body) {
        mainContent.removeAttribute("inert");
      }
      previousActiveElement.current?.focus();
    };
  }, [open, close, goNext, goPrev]);

  const currentImage = images[currentIndex];

  if (!images.length || !open) return null;

  const content = (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") close();
      }}
    >
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        /* || not ??: alt="" is a valid decorative-image value, but the
           dialog itself must always carry an accessible name. */
        aria-label={currentImage?.alt || "Image gallery"}
      >
        <button
          type="button"
          className={`${styles.navButton} ${styles.close}`}
          onClick={close}
          aria-label="Close"
        >
          <Icon name="x" decorative />
        </button>

        {images.length > 1 && (
          <>
            <button
              type="button"
              className={`${styles.navButton} ${styles.nav} ${styles.navPrev}`}
              onClick={goPrev}
              aria-label="Previous image"
            >
              <Icon name="arrow-left" size="lg" decorative />
            </button>
            <button
              type="button"
              className={`${styles.navButton} ${styles.nav} ${styles.navNext}`}
              onClick={goNext}
              aria-label="Next image"
            >
              <Icon name="arrow-right" size="lg" decorative />
            </button>
          </>
        )}

        <figure className={styles.figure}>
          <img
            src={currentImage?.src}
            alt={currentImage?.alt ?? ""}
            className={styles.image}
          />
          {currentImage?.caption && (
            <figcaption className={styles.caption}>
              {currentImage.caption}
            </figcaption>
          )}
        </figure>

        {images.length > 1 && (
          <div className={styles.counter} aria-live="polite">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(content, document.body);
  }

  return content;
}
