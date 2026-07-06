"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Briefcase } from "@phosphor-icons/react";
import { getProjectNavigation } from "../../data/projects";
import { Container } from "../Container";

export interface ProjectNavProps {
  /** Current project slug */
  currentSlug: string;
  /** Custom className */
  className?: string;
}

/**
 * Previous/next navigation between case studies for the foot of work detail
 * pages, with a back-to-work action. Targets come from the project ordering
 * via `getProjectNavigation`; the control at each sequence edge is disabled.
 * Rendered inside a labelled `nav` landmark.
 */
export function ProjectNav({ currentSlug, className }: ProjectNavProps) {
  const { t } = useTranslation();
  const { previous, next } = getProjectNavigation(currentSlug);

  return (
    <nav
      className={cn("py-3", className)}
      aria-label={t("projectNavLabel", "Project navigation")}
    >
      <Container size="lg">
        <div className="flex items-center justify-between gap-4">
          {/* Back to work */}
          <Link
            href="/work"
            className={cn(
              "inline-flex items-center gap-2 px-3 py-2 -ml-3",
              "text-sm font-medium text-muted-foreground",
              "hover:text-foreground transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
            )}
          >
            <Briefcase className="size-4" weight="bold" />
            <span className="hidden tablet:inline">
              {t("projectBackToWork", "Back to work")}
            </span>
            <span className="tablet:hidden">
              {t("workNavBackToWork", "Work")}
            </span>
          </Link>

          {/* Previous / Next */}
          <div className="flex items-center gap-2">
            {/* Previous */}
            {previous ? (
              <Link
                href={`/work/${previous.slug}`}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-2",
                  "text-sm font-medium text-muted-foreground",
                  "hover:text-foreground transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
                )}
                aria-label={`${t("projectPrevious", "Previous project")}: ${previous.title}`}
              >
                <ArrowLeft className="size-4" weight="bold" />
                <span className="hidden tablet:inline">
                  {t("workNavPrev", "Prev")}
                </span>
              </Link>
            ) : (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-2",
                  "text-sm font-medium text-muted-foreground/40",
                  "cursor-not-allowed"
                )}
                aria-disabled="true"
              >
                <ArrowLeft className="size-4" weight="bold" />
                <span className="hidden tablet:inline">
                  {t("workNavPrev", "Prev")}
                </span>
              </span>
            )}

            {/* Next */}
            {next ? (
              <Link
                href={`/work/${next.slug}`}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-2",
                  "text-sm font-medium text-muted-foreground",
                  "hover:text-foreground transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
                )}
                aria-label={`${t("projectNext", "Next project")}: ${next.title}`}
              >
                <span className="hidden tablet:inline">
                  {t("workNavNext", "Next")}
                </span>
                <ArrowRight className="size-4" weight="bold" />
              </Link>
            ) : (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-2",
                  "text-sm font-medium text-muted-foreground/40",
                  "cursor-not-allowed"
                )}
                aria-disabled="true"
              >
                <span className="hidden tablet:inline">
                  {t("workNavNext", "Next")}
                </span>
                <ArrowRight className="size-4" weight="bold" />
              </span>
            )}
          </div>
        </div>
      </Container>
    </nav>
  );
}

ProjectNav.displayName = "ProjectNav";
