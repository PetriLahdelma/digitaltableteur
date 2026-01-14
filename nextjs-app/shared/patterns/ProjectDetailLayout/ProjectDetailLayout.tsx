"use client";

import { type ReactNode, useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface ProjectDetailLayoutProps {
  /** Navigation slot (top) */
  nav?: ReactNode;
  /** Hero section slot */
  hero: ReactNode;
  /** Main content sections */
  children: ReactNode;
  /** Related projects section slot */
  relatedProjects?: ReactNode;
  /** Show scroll progress indicator */
  showScrollProgress?: boolean;
  /** Custom className */
  className?: string;
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
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
  relatedProjects,
  showScrollProgress = true,
  className,
}: ProjectDetailLayoutProps) {
  const mainRef = useRef<HTMLElement>(null);

  return (
    <>
      {showScrollProgress && <ScrollProgress />}
      <main
        ref={mainRef}
        className={cn("min-h-screen", className)}
      >
        {/* Navigation */}
        {nav && (
          <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
            {nav}
          </div>
        )}

        {/* Hero */}
        <header className="relative">
          {hero}
        </header>

        {/* Main content sections */}
        <div className="relative">
          {children}
        </div>

        {/* Related projects */}
        {relatedProjects && (
          <aside className="border-t border-border mt-16">
            {relatedProjects}
          </aside>
        )}
      </main>
    </>
  );
}

ProjectDetailLayout.displayName = "ProjectDetailLayout";
