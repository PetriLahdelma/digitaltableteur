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
import Title from "@dt/Title";

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
        // Reveal on scroll WITHOUT pre-hiding the cards. The cards stay visible
        // (opacity:1 from the gsap.set above); the entrance only plays once the
        // section scrolls into view, via onEnter. Critically, if the trigger
        // never fires (mobile Safari can leave a dormant ScrollTrigger when the
        // dynamic toolbar resizes the viewport), the cards simply stay visible
        // instead of being stuck at opacity:0 forever. A previous version bound a
        // fromTo at timeline position 0, which rendered opacity:0 immediately and
        // left "Selected work" blank on devices where the trigger didn't fire.
        const entrance = ScrollTrigger.create({
          trigger: section,
          start: "top 85%",
          once: true,
          onEnter: () => {
            gsap.from(cards, {
              opacity: 0,
              y: 30,
              duration: 0.7,
              ease: "power2.out",
              stagger: 0.1,
            });
          },
        });

        return () => entrance.kill();
      });

      // --- Magnetic effect: only on hover-capable devices ---
      mm.add(
        "(hover: hover) and (prefers-reduced-motion: no-preference)",
        () => {
          // Create quickTo instances for buttery smooth interpolation
          const qx: gsap.QuickToFunc[] = [];
          const qy: gsap.QuickToFunc[] = [];
          const qrx: gsap.QuickToFunc[] = [];
          const qry: gsap.QuickToFunc[] = [];
          const qsx: gsap.QuickToFunc[] = [];
          const qsy: gsap.QuickToFunc[] = [];

          // Use GSAP's canonical transform property names. quickTo() relies on
          // resetTo(), which can only reset a property GSAP stores directly.
          // "scale" is a shorthand (split into scaleX/scaleY) and "rotateX/rotateY"
          // normalise to "rotationX/rotationY", so quickTo on those logged
          // "<prop> not eligible for reset" on every pointer move. scaleX/scaleY
          // and rotationX/rotationY are directly resettable.
          cards.forEach((card) => {
            qx.push(
              gsap.quickTo(card, "x", { duration: 0.6, ease: "power3.out" }),
            );
            qy.push(
              gsap.quickTo(card, "y", { duration: 0.6, ease: "power3.out" }),
            );
            qrx.push(
              gsap.quickTo(card, "rotationX", {
                duration: 0.6,
                ease: "power3.out",
              }),
            );
            qry.push(
              gsap.quickTo(card, "rotationY", {
                duration: 0.6,
                ease: "power3.out",
              }),
            );
            qsx.push(
              gsap.quickTo(card, "scaleX", {
                duration: 0.6,
                ease: "power3.out",
              }),
            );
            qsy.push(
              gsap.quickTo(card, "scaleY", {
                duration: 0.6,
                ease: "power3.out",
              }),
            );
          });

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
              const tx =
                (deltaX * (strength * MAX_DISPLACEMENT)) /
                Math.max(distance, 1);
              const ty =
                (deltaY * (strength * MAX_DISPLACEMENT)) /
                Math.max(distance, 1);

              // 3D rotation — tilt based on cursor offset from card center
              const rx = -(deltaY / rect.height) * MAX_ROTATION * strength;
              const ry = (deltaX / rect.width) * MAX_ROTATION * strength;

              // Scale — nearest card gets subtle boost
              const s = 1 + (MAX_SCALE - 1) * strength;

              qx[i](tx);
              qy[i](ty);
              qrx[i](rx);
              qry[i](ry);
              qsx[i](s);
              qsy[i](s);
            });
          };

          const handleMouseLeave = () => {
            // Animate all cards back to rest
            cards.forEach((_, i) => {
              qx[i](0);
              qy[i](0);
              qrx[i](0);
              qry[i](0);
              qsx[i](1);
              qsy[i](1);
            });
          };

          section.addEventListener("mousemove", handleMouseMove);
          section.addEventListener("mouseleave", handleMouseLeave);

          // Cleanup within matchMedia context
          return () => {
            section.removeEventListener("mousemove", handleMouseMove);
            section.removeEventListener("mouseleave", handleMouseLeave);
          };
        },
      );

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
            <Title
              level={2}
              id={`${id}-title`}
              className={cn(
                styles.title,
                "font-display font-bold text-3xl tablet:text-4xl desktop:text-5xl text-foreground",
              )}
            >
              {title}
            </Title>
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
