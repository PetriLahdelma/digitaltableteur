"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";

import { Title } from "@digitaltableteur/react";
import Grid from "@dt/Grid";
import WorkNav from "@dt/WorkNav";
import { ProjectDetailLayout } from "../../../../patterns/ProjectDetailLayout";
import styles from "./illustrations.module.css";

/**
 * Placement vocabulary for the asymmetric gallery grid. Each name maps to a
 * CSS Module class that positions the piece on the shared 12-column desktop
 * grid (6 columns below desktop). New works pick one of these formations —
 * see illustrations.module.css for the column math per breakpoint.
 */
type Placement =
  | "full"
  | "leadWide"
  | "trailTall"
  | "trioStart"
  | "trioMid"
  | "trioEnd"
  | "panelStart"
  | "panelMid"
  | "panelEnd"
  | "pairSmall"
  | "pairLarge"
  | "duoWide"
  | "duoCompact"
  | "sheetStart"
  | "sheetEnd"
  | "closerSmall"
  | "closerWide";

interface IllustrationWork {
  src: string;
  alt: string;
  /** Caption title — the only prose on the page besides the header. */
  title: string;
  /** Caption annotation: client, medium, or context. */
  note: string;
  /** Intrinsic pixel dimensions, required by next/image to prevent CLS. */
  width: number;
  height: number;
  placement: Placement;
  /** Show only the top of a stacked source asset as a square plate. */
  crop?: "square-top";
}

/** Approximate rendered widths per placement, for responsive image loading. */
const SIZES: Record<Placement, string> = {
  full: "(min-width: 1440px) 1344px, 100vw",
  leadWide: "(min-width: 1024px) 55vw, (min-width: 768px) 66vw, 100vw",
  trailTall: "(min-width: 1024px) 40vw, (min-width: 768px) 33vw, 66vw",
  trioStart: "(min-width: 1024px) 33vw, 100vw",
  trioMid: "(min-width: 1024px) 33vw, 100vw",
  trioEnd: "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 66vw",
  panelStart: "(min-width: 1024px) 33vw, 100vw",
  panelMid: "(min-width: 1024px) 33vw, 100vw",
  panelEnd: "(min-width: 1024px) 33vw, 100vw",
  pairSmall: "(min-width: 1024px) 33vw, 66vw",
  pairLarge: "(min-width: 1024px) 58vw, (min-width: 768px) 66vw, 100vw",
  duoWide: "(min-width: 1024px) 66vw, 100vw",
  duoCompact: "(min-width: 1024px) 33vw, 100vw",
  sheetStart: "(min-width: 1024px) 58vw, (min-width: 768px) 50vw, 100vw",
  sheetEnd: "(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 100vw",
  closerSmall: "(min-width: 1024px) 33vw, 66vw",
  closerWide: "(min-width: 1024px) 58vw, (min-width: 768px) 66vw, 100vw",
};

const works: IllustrationWork[] = [
  {
    src: "/images/portfolio/illustrations/gallery/ice-cream.webp",
    alt: "Popsicle illustration",
    title: "Popsicle",
    note: "Personal, Vector",
    width: 1600,
    height: 1200,
    placement: "full",
  },
  {
    src: "/images/portfolio/illustrations/gallery/nitor_gods_of_atk.jpg",
    alt: "Fantasy illustration of warrior characters in Norse mythology style",
    title: "Gods of ATK",
    note: "Nitor, T-shirt design, Vector",
    width: 1076,
    height: 1076,
    placement: "leadWide",
  },
  {
    src: "/images/portfolio/illustrations/gallery/shadow@2x.png",
    alt: "Shadow from Donald Duck illustration",
    title: "The Shadow",
    note: "Character study, Vector",
    width: 500,
    height: 792,
    placement: "trailTall",
  },
  {
    src: "/images/portfolio/illustrations/gallery/ok_horns.jpg",
    alt: "OK Hand Horns illustration",
    title: "OK horns",
    note: "New Things Co Sticker, Vector",
    width: 1080,
    height: 1080,
    placement: "trioStart",
  },
  {
    src: "/images/portfolio/illustrations/gallery/polygon_woman.png",
    alt: "Polygon Woman illustration",
    title: "Polygon woman",
    note: "Low-poly portrait, Vector",
    width: 840,
    height: 882,
    placement: "trioMid",
  },
  {
    src: "/images/portfolio/illustrations/gallery/ottoboni_figures.jpg",
    alt: "Employee icons for Ottoboni",
    title: "Employee figures",
    note: "Ottoboni, Vector",
    width: 640,
    height: 640,
    placement: "trioEnd",
  },
  {
    src: "/images/portfolio/illustrations/gallery/salute.png",
    alt: "Army salute illustration",
    title: "Salute",
    note: "Character work, Personal",
    width: 1680,
    height: 2100,
    placement: "panelStart",
  },
  {
    src: "/images/portfolio/illustrations/gallery/concept_character.png",
    alt: "Vegas High Roller character illustration",
    title: "High roller",
    note: "Concept character, Personal",
    width: 1680,
    height: 2100,
    placement: "panelMid",
  },
  {
    src: "/images/portfolio/illustrations/gallery/newer_things_co.png",
    alt: "Newer Things Co illustration",
    title: "Newer Things Co",
    note: "New Things Co, Vector",
    width: 1680,
    height: 2100,
    placement: "panelEnd",
  },
  {
    src: "/images/portfolio/illustrations/gallery/react2@2x.png",
    alt: "React logo alternative illustration",
    title: "React, reimagined",
    note: "Nitor, Logo design for a meetup",
    width: 3622,
    height: 2002,
    placement: "full",
  },
  {
    src: "/images/portfolio/illustrations/gallery/mickey.png",
    alt: "Mickey Mouse inspired illustration",
    title: "Mickey in distress",
    note: "My Techno Weighs a Ton, Vector",
    width: 720,
    height: 850,
    placement: "pairSmall",
  },
  {
    src: "/images/portfolio/illustrations/gallery/garfield@2x.webp",
    alt: "Garfield on Acid illustration",
    title: "Garfield on acid",
    note: "Personal, Vector",
    width: 1231,
    height: 1230,
    placement: "pairLarge",
  },
  {
    src: "/images/portfolio/illustrations/gallery/version-control.avif",
    alt: "Version control editorial illustration",
    title: "Version control",
    note: "Nitor, Editorial illustration, iPad",
    width: 3200,
    height: 1600,
    placement: "duoWide",
  },
  {
    src: "/images/portfolio/home-remote/wordmark-clay.webp",
    alt: "Hand-modelled clay Home Remote wordmark",
    title: "Home Remote identity",
    note: "Home Remote, 3D",
    width: 1536,
    height: 1024,
    placement: "leadWide",
  },
  {
    src: "/images/portfolio/home-remote/illustrations-light.webp",
    alt: "Clay illustration of a man in a hoodie sitting in an armchair pointing a remote",
    title: "The boy",
    note: "Home Remote, 3D",
    width: 957,
    height: 1925,
    placement: "trailTall",
    crop: "square-top",
  },
  {
    src: "/images/portfolio/illustrations/gallery/power-low.avif",
    alt: "An editorial illustration of a low battery metaphor",
    title: "Power low",
    note: "Nitor, Editorial illustration",
    width: 3200,
    height: 1600,
    placement: "full",
  },
  {
    src: "/images/portfolio/illustrations/gallery/stickers_grid.png",
    alt: "Grid of sticker illustrations",
    title: "Sticker designs",
    note: "New Things Co, Vector",
    width: 1418,
    height: 1160,
    placement: "sheetStart",
  },
  {
    src: "/images/portfolio/illustrations/gallery/SC5_peeps.png",
    alt: "SC5 people character illustrations",
    title: "Peeps: Personalized illustrative icons",
    note: "SC5, Vector",
    width: 1456,
    height: 1424,
    placement: "sheetEnd",
  },
  {
    src: "/images/portfolio/illustrations/gallery/crisis-management.avif",
    alt: "Crisis management editorial illustration",
    title: "Crisis management editorial",
    note: "Nitor, iPad",
    width: 3200,
    height: 1600,
    placement: "closerSmall",
  },
  {
    src: "/images/portfolio/illustrations/gallery/nitor-metal@2x.png",
    alt: "Nitor metal logo illustration",
    title: "Nitor Gods of ATK -logo",
    note: "Nitor, Vector",
    width: 2049,
    height: 1537,
    placement: "closerWide",
  },
  {
    src: "/images/portfolio/illustrations/gallery/crisis-lifering.avif",
    alt: "Editorial illustration of liferings for crises",
    title: "Liferings",
    note: "Nitor, Editorial illustration, Vector",
    width: 3200,
    height: 1600,
    placement: "full",
  },
];

export function IllustrationsPage({ nav }: { nav?: React.ReactNode }) {
  const galleryRef = useRef<HTMLDivElement>(null);

  // Scroll reveal. IntersectionObserver instead of CSS scroll-driven
  // animations: the site's Lenis smooth scrolling leaves view() timelines
  // stale, and IO keeps the no-JS/reduced-motion fallback fully visible.
  useEffect(() => {
    const root = galleryRef.current;
    if (!root) return;
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const items = Array.from(root.querySelectorAll<HTMLElement>("figure"));
    // Items already on screen stay visible; arming must not blink them out.
    items.forEach((item) => {
      if (item.getBoundingClientRect().top < window.innerHeight) {
        item.classList.add(styles.shown);
      }
    });
    root.classList.add(styles.armed);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.shown);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    items.forEach((item) => {
      if (!item.classList.contains(styles.shown)) observer.observe(item);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <ProjectDetailLayout
      nav={nav ?? <WorkNav />}
      hero={<></>}
      showScrollProgress={false}
    >
      <div className={styles.page}>
        <header className={styles.header}>
          <Title level={1}>Illustrations</Title>
        </header>

        <div ref={galleryRef}>
          <Grid
            columns={6}
            desktopColumns={12}
            gap="var(--grid-gap-mobile)"
            tabletGap="var(--grid-gap-tablet)"
            desktopGap="var(--grid-gap-desktop)"
            align="end"
            className={styles.gallery}
          >
          {works.map((work, index) => (
            <figure
              key={work.src}
              className={`${styles.item} ${styles[work.placement]}`}
            >
              <div
                className={
                  work.crop === "square-top"
                    ? `${styles.plate} ${styles.plateSquareTop}`
                    : styles.plate
                }
              >
                <Image
                  src={work.src}
                  alt={work.alt}
                  width={work.width}
                  height={work.height}
                  sizes={SIZES[work.placement]}
                  priority={index < 2}
                  className={styles.image}
                />
              </div>
              <figcaption className={styles.caption}>
                <span className={styles.captionTitle}>{work.title}</span>
                <span className={styles.captionNote}>{work.note}</span>
              </figcaption>
            </figure>
          ))}
          </Grid>
        </div>
      </div>
    </ProjectDetailLayout>
  );
}
