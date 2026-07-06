"use client";

import React from "react";
import Button from "@dt/Button";
import styles from "./worknav.module.css";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import Icon from "@dt/Icon";

const workPages = [
  { path: "/work/helsinki-design-system" },
  { path: "/work/new-things-co" },
  { path: "/work/illustrations" },
  { path: "/work/garage-junction" },
];

export interface WorkNavProps {
  /**
   * Active route used to compute the prev/next disabled state. Defaults to the
   * current pathname from the router; stories and tests override it to show a
   * given position in the work sequence.
   */
  currentPath?: string;
}

/**
 * Work section sub-navigation: a back-to-index action plus previous/next
 * controls that step through the portfolio case-study sequence, disabling the
 * button at each edge. Rendered inside a labelled `nav` landmark.
 */
const WorkNav: React.FC<WorkNavProps> = ({ currentPath: currentPathProp }) => {
  const { t } = useTranslation();
  const pathname = usePathname() ?? "/";
  const currentPath = currentPathProp ?? pathname;
  const currentIndex = workPages.findIndex((p) => p.path === currentPath);
  const router = useRouter();
  return (
    <nav className={styles.workNavBar} aria-label={t("workNavLabel")}>
      <Button
        variant="tertiary"
        size="md"
        icon={<Icon name="briefcase" ariaLabel={t("workNavBackToWork")} />}
        onClick={() => router.push("/work")}
      >
        {t("workNavBackToWork")}
      </Button>
      <div className={styles.rightNavGroup}>
        <Button
          variant="tertiary"
          size="md"
          icon={<Icon name="arrow-left" ariaLabel={t("workNavPrev")} />}
          disabled={currentIndex <= 0}
          onClick={() => {
            if (currentIndex > 0) router.push(workPages[currentIndex - 1].path);
          }}
        >
          {t("workNavPrev")}
        </Button>
        <Button
          variant="tertiary"
          size="md"
          endIcon={<Icon name="arrow-right" ariaLabel={t("workNavNext")} />}
          disabled={currentIndex === workPages.length - 1}
          onClick={() => {
            if (currentIndex < workPages.length - 1)
              router.push(workPages[currentIndex + 1].path);
          }}
        >
          {t("workNavNext")}
        </Button>
      </div>
    </nav>
  );
};

export default WorkNav;
