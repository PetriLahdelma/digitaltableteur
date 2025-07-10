import React from "react";
import Button from "@dt/Button";
import { MdArrowBack, MdArrowForward, MdWork } from "react-icons/md";
import styles from "./worknav.module.css";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

const workPages = [
  { path: "/work/new-things-co", labelKey: "workNavNewThingsCo" },
  { path: "/work/illustrations", labelKey: "workNavIllustrations" },
  { path: "/work/garage-junction", labelKey: "workNavGarageJunction" },
];

const WorkNav: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const currentPath =
    router.pathname === "/work/[project]" ? router.asPath : router.pathname;
  const currentIndex = workPages.findIndex((p) => p.path === currentPath);
  return (
    <>
      <div className={styles.workNavBar}>
        <Button
          variant="tertiary"
          size="m"
          icon={<MdWork />}
          onClick={() => router.push("/work")}
        >
          {t("workNavBackToWork")}
        </Button>
        <div className={styles.rightNavGroup}>
          <Button
            variant="tertiary"
            size="m"
            icon={<MdArrowBack />}
            disabled={currentIndex <= 0}
            onClick={() => {
              if (currentIndex > 0)
                router.push(workPages[currentIndex - 1].path);
            }}
          >
            {t("workNavPrev")}
          </Button>
          <Button
            variant="tertiary"
            size="m"
            endIcon={<MdArrowForward />}
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
      <hr className={styles.hrLine} />
    </>
  );
};

export default WorkNav;
