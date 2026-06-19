"use client";

import React from "react";
import Button from "@dt/Button";
import styles from "./worknav.module.css";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import Icon from "@dt/Icon";

const workPages = [
  {
    path: "/work/helsinki-design-system",
    labelKey: "workNavHelsinkiDesignSystem",
  },
  { path: "/work/new-things-co", labelKey: "workNavNewThingsCo" },
  { path: "/work/illustrations", labelKey: "workNavIllustrations" },
  { path: "/work/garage-junction", labelKey: "workNavGarageJunction" },
];

const WorkNav: React.FC = () => {
  const { t } = useTranslation();
  const currentPath = usePathname() ?? "/";
  const currentIndex = workPages.findIndex((p) => p.path === currentPath);
  const router = useRouter();
  return (
    <>
      <div className={styles.workNavBar}>
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
      </div>
    </>
  );
};

export default WorkNav;
