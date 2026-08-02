"use client";

import React, { useState, useCallback } from "react";

import { Badge, FlexBox, Title } from "@digitaltableteur/react";
import { ProjectDetailLayout } from "../../../../patterns/ProjectDetailLayout";
import WorkNav from "@dt/WorkNav";
import styles from "./illustrations.module.css";

type InteractionMode = "none" | "drag" | "resize" | "rotate";
type ResizeCorner = "nw" | "ne" | "sw" | "se";

// Gallery images with grid area assignments for interesting desktop layout
// rotation: degrees of rotation (0 for no rotation)
const galleryImages = [
  {
    src: "/images/portfolio/illustrations/gallery/nitor_gods_of_atk.jpg",
    alt: "Fantasy illustration of warrior characters in Norse mythology style",
    area: "a",
    sharp: true,
    rotation: 0,
  },
  {
    src: "/images/portfolio/illustrations/gallery/ice-cream.webp",
    alt: "Popsicle illustration",
    area: "b",
    sharp: false,
    rotation: 0,
  },
  {
    src: "/images/portfolio/illustrations/gallery/polygon_woman.png",
    alt: "Polygon Woman illustration",
    area: "c",
    sharp: false,
    rotation: 0,
  },
  {
    src: "/images/portfolio/illustrations/gallery/react2@2x.png",
    alt: "React logo alternative illustration",
    area: "d",
    sharp: true,
    rotation: 5,
  },
  {
    src: "/images/portfolio/illustrations/gallery/stickers_grid.png",
    alt: "Grid of sticker illustrations",
    area: "e",
    sharp: false,
    rotation: 0,
  },
  {
    src: "/images/portfolio/illustrations/gallery/crisis-management.avif",
    alt: "Crisis management editorial illustration",
    area: "f",
    sharp: true,
    rotation: 0,
  },
  {
    src: "/images/portfolio/illustrations/gallery/garfield@2x.webp",
    alt: "Garfield on Acid illustration",
    area: "g",
    sharp: false,
    rotation: 0,
  },
  {
    src: "/images/portfolio/illustrations/gallery/shadow@2x.png",
    alt: "Shadow from Donald Duck illustration",
    area: "h",
    sharp: false,
    rotation: 10,
  },
  {
    src: "/images/portfolio/illustrations/gallery/power-low.avif",
    alt: "An editorial illustration of a low battery metaphor",
    area: "i",
    sharp: true,
    rotation: 0,
  },
  {
    src: "/images/portfolio/illustrations/gallery/ok_horns.jpg",
    alt: "OK Hand Horns illustration",
    area: "j",
    sharp: false,
    rotation: 0,
  },
  {
    src: "/images/portfolio/illustrations/gallery/SC5_peeps.png",
    alt: "SC5 people character illustrations",
    area: "k",
    sharp: true,
    rotation: 0,
  },
  {
    src: "/images/portfolio/illustrations/gallery/mickey.png",
    alt: "Mickey Mouse inspired illustration",
    area: "l",
    sharp: false,
    rotation: 15,
  },
  {
    src: "/images/portfolio/illustrations/gallery/jigsaw.jpg",
    alt: "An editorial illustration of juggling with dependencies",
    area: "m",
    sharp: false,
    rotation: 0,
  },
  {
    src: "/images/portfolio/illustrations/gallery/salute.png",
    alt: "Army salute illustration",
    area: "n",
    sharp: true,
    rotation: 0,
  },
  {
    src: "/images/portfolio/illustrations/gallery/concept_character.png",
    alt: "Vegas High Roller character illustration",
    area: "o",
    sharp: false,
    rotation: 0,
  },
  {
    src: "/images/portfolio/illustrations/gallery/crisis-lifering.avif",
    alt: "Editorial illustration of liferings for crises",
    area: "p",
    sharp: true,
    rotation: 0,
  },
  {
    src: "/images/portfolio/illustrations/gallery/ottoboni_figures.jpg",
    alt: "Employee icons for Ottoboni",
    area: "q",
    sharp: false,
    rotation: 0,
  },
  {
    src: "/images/portfolio/illustrations/gallery/version-control.avif",
    alt: "Version control editorial illustration",
    area: "r",
    sharp: false,
    rotation: 20,
  },
  {
    src: "/images/portfolio/illustrations/gallery/newer_things_co.png",
    alt: "Newer Things Co illustration",
    area: "s",
    sharp: true,
    rotation: 0,
  },
  {
    src: "/images/portfolio/illustrations/gallery/nitor-metal@2x.png",
    alt: "Nitor metal logo illustration",
    area: "t",
    sharp: false,
    rotation: 0,
  },
];

export function IllustrationsPage({ nav }: { nav?: React.ReactNode }) {
  const [positions, setPositions] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [scales, setScales] = useState<Record<string, number>>({});
  const [rotations, setRotations] = useState<Record<string, number>>(() => {
    // Initialize with default rotations from galleryImages
    const initial: Record<string, number> = {};
    galleryImages.forEach((img) => {
      initial[img.area] = img.rotation;
    });
    return initial;
  });

  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [interactionMode, setInteractionMode] =
    useState<InteractionMode>("none");
  const [dragStart, setDragStart] = useState<{
    x: number;
    y: number;
    origX: number;
    origY: number;
  } | null>(null);
  const [resizeStart, setResizeStart] = useState<{
    x: number;
    y: number;
    origScale: number;
    corner: ResizeCorner;
  } | null>(null);
  const [rotateStart, setRotateStart] = useState<{
    angle: number;
    origRotation: number;
    centerX: number;
    centerY: number;
  } | null>(null);

  const [highestZ, setHighestZ] = useState(20);
  const [lowestZ, setLowestZ] = useState(1);
  const [zIndices, setZIndices] = useState<Record<string, number>>({});

  const bringToFront = useCallback(
    (area: string) => {
      const newZ = Math.min(highestZ + 1, 30); // Cap at 30 to stay below nav elements
      setHighestZ(newZ);
      setZIndices((prev) => ({ ...prev, [area]: newZ }));
    },
    [highestZ],
  );

  const sendToBack = useCallback(
    (area: string) => {
      const newZ = Math.max(lowestZ - 1, 1);
      setLowestZ(newZ);
      setZIndices((prev) => ({ ...prev, [area]: newZ }));
    },
    [lowestZ],
  );

  // Scroll wheel to control z-index (scroll up = forward, scroll down = backward)
  const handleWheel = useCallback(
    (e: React.WheelEvent, area: string) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.deltaY < 0) {
        // Scroll up - bring forward
        bringToFront(area);
      } else if (e.deltaY > 0) {
        // Scroll down - send backward
        sendToBack(area);
      }
    },
    [bringToFront, sendToBack],
  );

  // Drag handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, area: string) => {
      e.preventDefault();
      e.stopPropagation();
      const currentPos = positions[area] || { x: 0, y: 0 };
      setActiveItem(area);
      setInteractionMode("drag");
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        origX: currentPos.x,
        origY: currentPos.y,
      });
      bringToFront(area);
    },
    [positions, bringToFront],
  );

  // Resize handlers
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, area: string, corner: ResizeCorner) => {
      e.preventDefault();
      e.stopPropagation();
      const currentScale = scales[area] || 1;
      setActiveItem(area);
      setInteractionMode("resize");
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        origScale: currentScale,
        corner,
      });
      bringToFront(area);
    },
    [scales, bringToFront],
  );

  // Rotate handlers
  const handleRotateStart = useCallback(
    (e: React.MouseEvent, area: string, element: HTMLElement) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const angle =
        Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
      const currentRotation = rotations[area] || 0;
      setActiveItem(area);
      setInteractionMode("rotate");
      setRotateStart({
        angle,
        origRotation: currentRotation,
        centerX,
        centerY,
      });
      bringToFront(area);
    },
    [rotations, bringToFront],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!activeItem) return;

      if (interactionMode === "drag" && dragStart) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        setPositions((prev) => ({
          ...prev,
          [activeItem]: {
            x: dragStart.origX + deltaX,
            y: dragStart.origY + deltaY,
          },
        }));
      } else if (interactionMode === "resize" && resizeStart) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        // Use the larger delta for uniform scaling
        const delta =
          Math.max(Math.abs(deltaX), Math.abs(deltaY)) *
          Math.sign(deltaX + deltaY);
        const scaleFactor = delta / 200; // Sensitivity
        const newScale = Math.max(
          0.3,
          Math.min(2.5, resizeStart.origScale + scaleFactor),
        );
        setScales((prev) => ({ ...prev, [activeItem]: newScale }));
      } else if (interactionMode === "rotate" && rotateStart) {
        const currentAngle =
          Math.atan2(
            e.clientY - rotateStart.centerY,
            e.clientX - rotateStart.centerX,
          ) *
          (180 / Math.PI);
        const deltaAngle = currentAngle - rotateStart.angle;
        setRotations((prev) => ({
          ...prev,
          [activeItem]: rotateStart.origRotation + deltaAngle,
        }));
      }
    },
    [activeItem, interactionMode, dragStart, resizeStart, rotateStart],
  );

  const handleMouseUp = useCallback(() => {
    setActiveItem(null);
    setInteractionMode("none");
    setDragStart(null);
    setResizeStart(null);
    setRotateStart(null);
  }, []);

  // Touch handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent, area: string) => {
      const touch = e.touches[0];
      const currentPos = positions[area] || { x: 0, y: 0 };
      setActiveItem(area);
      setInteractionMode("drag");
      setDragStart({
        x: touch.clientX,
        y: touch.clientY,
        origX: currentPos.x,
        origY: currentPos.y,
      });
      bringToFront(area);
    },
    [positions, bringToFront],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!activeItem || interactionMode !== "drag" || !dragStart) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStart.x;
      const deltaY = touch.clientY - dragStart.y;
      setPositions((prev) => ({
        ...prev,
        [activeItem]: {
          x: dragStart.origX + deltaX,
          y: dragStart.origY + deltaY,
        },
      }));
    },
    [activeItem, interactionMode, dragStart],
  );

  const handleTouchEnd = useCallback(() => {
    setActiveItem(null);
    setInteractionMode("none");
    setDragStart(null);
  }, []);

  return (
    <ProjectDetailLayout
      nav={nav ?? <WorkNav />}
      hero={<></>}
      showScrollProgress={false}
    >
      <main className={styles.page}>
        <header className={styles.header}>
          <Title level={1} className={styles.title}>
            Illustrations
          </Title>
          <FlexBox className={styles.badges} gap={8} justify="center" wrap="wrap">
            <Badge size="sm" variant="secondary">
              Pencil & Paper
            </Badge>
            <Badge size="sm" variant="secondary">
              Brush & Paint
            </Badge>
            <Badge size="sm" variant="secondary">
              Vector
            </Badge>
            <Badge size="sm" variant="secondary">
              Pixel
            </Badge>
          </FlexBox>
          <p className={styles.dragHint}>
            Drag to move • Scroll to layer • Corner to resize • Edge to rotate
          </p>
        </header>

        <div
          className={styles.gallery}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {galleryImages.map((image, index) => {
            const pos = positions[image.area] || { x: 0, y: 0 };
            const zIndex = zIndices[image.area] || index + 1;
            const scale = scales[image.area] || 1;
            const rotation = rotations[image.area] || 0;
            const itemClass = image.sharp
              ? styles.galleryItemSharp
              : styles.galleryItem;
            const isActive = activeItem === image.area;

            // Counter-scaled offset to keep handles at constant distance from edge
            const offset = 8 / scale;

            return (
              <div
                key={index}
                className={`${itemClass} ${styles[`area${image.area.toUpperCase()}`]} ${isActive ? styles.dragging : ""}`}
                style={{
                  transform: `translate(${pos.x}px, ${pos.y}px) rotate(${rotation}deg) scale(${scale})`,
                  zIndex,
                  cursor:
                    interactionMode === "drag" && isActive
                      ? "grabbing"
                      : "grab",
                }}
                onMouseDown={(e) => handleMouseDown(e, image.area)}
                onWheel={(e) => handleWheel(e, image.area)}
                onTouchStart={(e) => handleTouchStart(e, image.area)}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className={styles.galleryImage}
                  loading={index < 4 ? "eager" : "lazy"}
                  draggable={false}
                />
                {/* Resize handle - bottom right corner only */}
                <div
                  className={`${styles.handle} ${styles.handleSE}`}
                  style={{
                    bottom: offset,
                    right: offset,
                    transform: `scale(${1 / scale})`,
                    transformOrigin: "bottom right",
                  }}
                  onMouseDown={(e) => handleResizeStart(e, image.area, "se")}
                />
                {/* Rotate handle - right edge only */}
                <div
                  className={`${styles.handle} ${styles.handleRotateE}`}
                  style={{
                    right: offset,
                    transform: `translateY(-50%) scale(${1 / scale})`,
                    transformOrigin: "center right",
                  }}
                  onMouseDown={(e) => {
                    const parent = e.currentTarget.parentElement;
                    if (parent) handleRotateStart(e, image.area, parent);
                  }}
                />
              </div>
            );
          })}
        </div>
      </main>
    </ProjectDetailLayout>
  );
}
