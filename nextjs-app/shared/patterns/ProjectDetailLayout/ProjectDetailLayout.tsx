"use client";

import { type ReactNode, useState, useEffect, useRef } from "react";
import { cn } from "../../lib/cn";
import { WorkCTA } from "../WorkCTA/WorkCTA";
import styles from "./ProjectDetailLayout.module.css";

export interface ProjectDetailLayoutProps {
  /** Navigation slot (top) */
  nav?: ReactNode;
  /** Hero section slot */
  hero: ReactNode;
  /** Main content sections */
  children: ReactNode;
  /** Call-to-action section slot (between content and related projects). Renders WorkCTA by default. Pass null to suppress. */
  cta?: ReactNode | null;
  /** Related projects section slot */
  relatedProjects?: ReactNode;
  /** Show scroll progress indicator */
  showScrollProgress?: boolean;
  /** Custom className */
  className?: string;
  /** Donny site action target id for the project article */
  donnyTarget?: string;
  /** Language of the case-study content */
  lang?: string;
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(scrollPercent);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 z-50 bg-muted/30"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      <div
        className="h-full bg-primary transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export function ProjectDetailLayout({
  nav,
  hero,
  children,
  cta,
  relatedProjects,
  showScrollProgress = true,
  className,
  donnyTarget,
  lang = "en",
}: ProjectDetailLayoutProps) {
  const mainRef = useRef<HTMLElement>(null);

  return (
    <>
      {showScrollProgress && <ScrollProgress />}
      <article
        ref={mainRef}
        className={cn("min-h-screen", className)}
        data-donny-target={donnyTarget}
      >
        {/* Navigation - sticky below header */}
        {nav && (
          <div
            className={cn(
              "sticky top-20 z-30 border-b border-border flex items-center",
              styles.brandNav,
            )}
          >
            {nav}
          </div>
        )}

        {/* Hero */}
        <header className="relative" lang={lang}>
          {hero}
        </header>

        {/* Main content sections */}
        <div className="relative" lang={lang}>
          {children}
        </div>

        {/* CTA - render WorkCTA by default, or custom cta prop */}
        {cta !== null && <div>{cta || <WorkCTA />}</div>}

        {/* Related projects */}
        {relatedProjects && (
          <aside className="border-t border-border">{relatedProjects}</aside>
        )}
      </article>
    </>
  );
}

ProjectDetailLayout.displayName = "ProjectDetailLayout";
