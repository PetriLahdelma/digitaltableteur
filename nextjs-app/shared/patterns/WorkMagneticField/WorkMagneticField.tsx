"use client";

import { useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { gsap, useGSAP, ScrollTrigger } from "../../lib/gsap";
import { Container } from "../../components/Container";
import { Section } from "../../components/Section";
import { EnhancedProjectCard } from "../../components/EnhancedProjectCard";
import { cn } from "@/lib/utils";
import type { ProjectItem } from "../WorkPreviewSection/WorkPreviewSection";
import styles from "./WorkMagneticField.module.css";

export interface WorkMagneticFieldProps {
  /** Section title */
  title?: string;
  /** Array of projects to display */
  projects: ProjectItem[];
  /** Show "View all work" link */
  showViewAll?: boolean;
  /** Custom className */
  className?: string;
  /** Section ID for navigation */
  id?: string;
  /** Donny site action target id */
  donnyTarget?: string;
}

/** Maximum pixel displacement toward cursor */
const MAX_DISPLACEMENT = 15;
/** Maximum 3D tilt in degrees */
const MAX_ROTATION = 4;
/** Maximum scale boost for nearest card */
const MAX_SCALE = 1.03;
/** Distance (px) at which magnetic effect reaches full strength */
const EFFECT_RADIUS = 400;

/**
 * WorkMagneticField component.
 */
export function WorkMagneticField({
  title,
  projects,
  showViewAll = true,
  className,
  id = "work",
  donnyTarget = "home.work",
}: WorkMagneticFieldProps) {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const quickToRefs = useRef<{
    x: gsap.QuickToFunc[];
    y: gsap.QuickToFunc[];
    rotateX: gsap.QuickToFunc[];
    rotateY: gsap.QuickToFunc[];
    scale: gsap.QuickToFunc[];
  }>({ x: [], y: [], rotateX: [], rotateY: [], scale: [] });

  const setCardRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      cardRefs.current[index] = el;
    },
    [],
  );

  const displayedProjects = projects.slice(0, 3);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];

      if (!section || cards.length === 0) return;

      // Pre-set the resting state synchronously so axe never observes the
      // initial opacity:0 state. gsap.matchMedia callbacks below still adjust
      // things async, but this guarantees the cards are visible from frame 1.
      gsap.set(cards, { opacity: 1, y: 0 });

      const mm = gsap.matchMedia();

      // --- Reduced motion: show immediately, no interactions ---
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(cards, { opacity: 1, y: 0 });
      });

      // --- Normal motion ---
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Entrance animation — staggered fade-in
        const entranceTl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            once: true,
          },
        });

        entranceTl.fromTo(
          cards,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            stagger: 0.1,
          },
        );
      });

      // --- Magnetic effect: only on hover-capable devices ---
      mm.add("(hover: hover) and (prefers-reduced-motion: no-preference)", () => {
        // Create quickTo instances for buttery smooth interpolation
        const qx: gsap.QuickToFunc[] = [];
        const qy: gsap.QuickToFunc[] = [];
        const qrx: gsap.QuickToFunc[] = [];
        const qry: gsap.QuickToFunc[] = [];
        const qs: gsap.QuickToFunc[] = [];

        cards.forEach((card) => {
          qx.push(gsap.quickTo(card, "x", { duration: 0.6, ease: "power3.out" }));
          qy.push(gsap.quickTo(card, "y", { duration: 0.6, ease: "power3.out" }));
          qrx.push(gsap.quickTo(card, "rotateX", { duration: 0.6, ease: "power3.out" }));
          qry.push(gsap.quickTo(card, "rotateY", { duration: 0.6, ease: "power3.out" }));
          qs.push(gsap.quickTo(card, "scale", { duration: 0.6, ease: "power3.out" }));
        });

        quickToRefs.current = {
          x: qx,
          y: qy,
          rotateX: qrx,
          rotateY: qry,
          scale: qs,
        };

        const handleMouseMove = (e: MouseEvent) => {
          const mouseX = e.clientX;
          const mouseY = e.clientY;

          cards.forEach((card, i) => {
            const rect = card.getBoundingClientRect();
            const cardCenterX = rect.left + rect.width / 2;
            const cardCenterY = rect.top + rect.height / 2;

            // Vector from card center to cursor
            const deltaX = mouseX - cardCenterX;
            const deltaY = mouseY - cardCenterY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            // Map distance to strength: closer = stronger (1.0 at 0, 0.0 at EFFECT_RADIUS+)
            const strength = gsap.utils.clamp(
              0,
              1,
              gsap.utils.mapRange(EFFECT_RADIUS, 0, 0, 1, distance),
            );

            // Translation — pull card toward cursor
            const tx = deltaX * (strength * MAX_DISPLACEMENT) / Math.max(distance, 1);
            const ty = deltaY * (strength * MAX_DISPLACEMENT) / Math.max(distance, 1);

            // 3D rotation — tilt based on cursor offset from card center
            const rx = -(deltaY / rect.height) * MAX_ROTATION * strength;
            const ry = (deltaX / rect.width) * MAX_ROTATION * strength;

            // Scale — nearest card gets subtle boost
            const s = 1 + (MAX_SCALE - 1) * strength;

            qx[i](tx);
            qy[i](ty);
            qrx[i](rx);
            qry[i](ry);
            qs[i](s);
          });
        };

        const handleMouseLeave = () => {
          // Animate all cards back to rest
          cards.forEach((_, i) => {
            qx[i](0);
            qy[i](0);
            qrx[i](0);
            qry[i](0);
            qs[i](1);
          });
        };

        section.addEventListener("mousemove", handleMouseMove);
        section.addEventListener("mouseleave", handleMouseLeave);

        // Cleanup within matchMedia context
        return () => {
          section.removeEventListener("mousemove", handleMouseMove);
          section.removeEventListener("mouseleave", handleMouseLeave);
        };
      });

      // matchMedia cleanup is automatic via useGSAP
    },
    { scope: sectionRef },
  );

  return (
    <Section
      ref={sectionRef}
      id={id}
      donnyTarget={donnyTarget}
      className={cn(styles.section, className)}
      spacing="none"
      aria-labelledby={title ? `${id}-title` : undefined}
    >
      <Container size="lg">
        {/* Section Header */}
        <div className={styles.header}>
          {title && (
            <h2
              id={`${id}-title`}
              className={cn(
                styles.title,
                "font-display font-bold text-3xl tablet:text-4xl desktop:text-5xl text-foreground",
              )}
            >
              {title}
            </h2>
          )}
          {showViewAll && (
            <Link href="/work" className={cn(styles.viewAllLink, "group")}>
              {t("homeWorkViewAll", "View all work")}
              <ChevronRight className={styles.viewAllIcon} aria-hidden="true" />
            </Link>
          )}
        </div>

        {/* Magnetic Grid */}
        <div ref={gridRef} className={styles.grid} role="list">
          {displayedProjects.map((project, index) => (
            <div
              key={project.slug}
              ref={setCardRef(index)}
              className={styles.cardWrapper}
              role="listitem"
              aria-label={project.title}
            >
              <div className={styles.cardContainer}>
                <EnhancedProjectCard
                  title={project.title}
                  slug={project.slug}
                  thumbnail={project.thumbnail}
                  category={project.category}
                  tags={project.tags}
                  aspectRatio="landscape"
                  showCategory={true}
                  showDescription={false}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Mobile View All Link */}
        {showViewAll && (
          <Link href="/work" className={styles.mobileViewAll}>
            {t("homeWorkViewAll", "View all work")}
            <ChevronRight className={styles.viewAllIcon} aria-hidden="true" />
          </Link>
        )}
      </Container>
    </Section>
  );
}

WorkMagneticField.displayName = "WorkMagneticField";
