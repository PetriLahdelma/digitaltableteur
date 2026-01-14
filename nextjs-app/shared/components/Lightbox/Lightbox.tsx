"use client";

import { useEffect, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { X, CaretLeft, CaretRight } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";

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
  open,
  onOpenChange,
}: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (open) setCurrentIndex(initialIndex);
  }, [open, initialIndex]);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, goNext, goPrev]);

  const currentImage = images[currentIndex];

  if (!images.length) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none"
        showCloseButton={false}
        size="full"
      >
        <div className="relative flex items-center justify-center min-h-[60vh]">
          {/* Close button */}
          <DialogClose className="absolute top-4 right-4 z-10 p-2 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10">
            <X className="size-6" />
            <span className="sr-only">Close</span>
          </DialogClose>

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-4 z-10 p-3 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10"
                aria-label="Previous image"
              >
                <CaretLeft className="size-8" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-4 z-10 p-3 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10"
                aria-label="Next image"
              >
                <CaretRight className="size-8" />
              </button>
            </>
          )}

          {/* Image */}
          <figure className="flex flex-col items-center px-16">
            <img
              src={currentImage?.src}
              alt={currentImage?.alt ?? ""}
              className="max-w-full max-h-[80vh] object-contain rounded"
            />
            {currentImage?.caption && (
              <figcaption className="mt-4 text-white/70 font-body text-sm text-center max-w-2xl px-4">
                {currentImage.caption}
              </figcaption>
            )}
          </figure>

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 font-body text-xs">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
