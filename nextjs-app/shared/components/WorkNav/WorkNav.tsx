"use client";

import React from "react";
import Button from "@dt/Button";
import styles from "./worknav.module.css";
import {
  useNavigationPathname,
  useNavigationRouter,
} from "../../lib/navigation";
import { useTranslate } from "../../lib/translation";
import Icon from "@dt/Icon";

const defaultWorkPages = [
  { path: "/work/helsinki-design-system" },
  { path: "/work/new-things-co" },
  { path: "/work/illustrations" },
  { path: "/work/garage-junction" },
];

export interface WorkNavPage {
  /** Absolute application path for one case study in navigation order. */
  path: string;
}

export interface WorkNavProps {
  /**
   * Active route used to compute the prev/next disabled state. Defaults to the
   * current pathname from the router; stories and tests override it to show a
   * given position in the work sequence.
   */
  currentPath?: string;
  /** Ordered case-study paths. Defaults to the bundled legacy sequence. */
  pages?: readonly WorkNavPage[];
  /** Host navigation callback. Defaults to the configured navigation runtime. */
  onNavigate?: (path: string) => void;
  /** Disables every action while host navigation is pending. @default false */
  disabled?: boolean;
}

/**
 * Work section sub-navigation: a back-to-index action plus previous/next
 * controls that step through the portfolio case-study sequence, disabling the
 * button at each edge. Rendered inside a labelled `nav` landmark.
 */
const WorkNav: React.FC<WorkNavProps> = ({
  currentPath: currentPathProp,
  pages = defaultWorkPages,
  onNavigate,
  disabled = false,
}) => {
  const t = useTranslate();
  const pathname = useNavigationPathname() ?? "/";
  const currentPath = currentPathProp ?? pathname;
  const currentIndex = pages.findIndex((p) => p.path === currentPath);
  const isProjectRoute = currentIndex >= 0;
  const router = useNavigationRouter();
  const navigate = onNavigate ?? router.push;
  return (
    <nav className={styles.workNavBar} aria-label={t("workNavLabel")}>
      <Button
        variant="tertiary"
        size="md"
        icon={<Icon name="briefcase" ariaLabel={t("workNavBackToWork")} />}
        disabled={disabled}
        onClick={() => navigate("/work")}
      >
        {t("workNavBackToWork")}
      </Button>
      <div className={styles.rightNavGroup}>
        <Button
          variant="tertiary"
          size="md"
          icon={<Icon name="arrow-left" ariaLabel={t("workNavPrev")} />}
          disabled={disabled || !isProjectRoute || currentIndex <= 0}
          onClick={() => {
            if (currentIndex > 0) navigate(pages[currentIndex - 1].path);
          }}
        >
          {t("workNavPrev")}
        </Button>
        <Button
          variant="tertiary"
          size="md"
          endIcon={<Icon name="arrow-right" ariaLabel={t("workNavNext")} />}
          disabled={
            disabled || !isProjectRoute || currentIndex === pages.length - 1
          }
          onClick={() => {
            if (currentIndex < pages.length - 1)
              navigate(pages[currentIndex + 1].path);
          }}
        >
          {t("workNavNext")}
        </Button>
      </div>
    </nav>
  );
};

export default WorkNav;
