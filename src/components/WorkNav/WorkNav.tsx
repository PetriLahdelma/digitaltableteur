import React from "react";
import styles from "./worknav.module.css";
import Button from "@dt/Button";
import { MdArrowBack, MdArrowForward, MdWork } from "react-icons/md";
import { useTranslation } from "react-i18next";
import Link from "next/link";

const workPages = [
  { path: "/work/new-things-co", labelKey: "workNavNewThingsCo" },
  { path: "/work/illustrations", labelKey: "workNavIllustrations" },
  { path: "/work/garage-junction", labelKey: "workNavGarageJunction" },
];

const WorkNav: React.FC = () => {
  const { t } = useTranslation();
  const [currentPath, setCurrentPath] = React.useState("");
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);
    }
  }, []);
  const currentIndex = workPages.findIndex((p) => p.path === currentPath);
  return (
    <>
      <div className={styles.workNavBar}>
        <Link href="/work" passHref legacyBehavior>
          <Button variant="tertiary" size="m" icon={<MdWork />}>
            {t("workNavBackToWork")}
          </Button>
        </Link>
        <div className={styles.rightNavGroup}>
          <Button
            variant="tertiary"
            size="m"
            icon={<MdArrowBack />}
            disabled={currentIndex <= 0}
          >
            {t("workNavPrev")}
          </Button>
          <Button
            variant="tertiary"
            size="m"
            endIcon={<MdArrowForward />}
            disabled={currentIndex === workPages.length - 1}
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
