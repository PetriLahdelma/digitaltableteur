import React from "react";
import Button from "../Button/Button";
import { MdArrowBack, MdArrowForward, MdWork } from "react-icons/md";
import styles from "./worknav.module.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const workPages = [
  { path: "/work/new-things-co", labelKey: "workNavNewThingsCo" },
  { path: "/work/illustrations", labelKey: "workNavIllustrations" },
];

const WorkNav: React.FC = () => {
  const { t } = useTranslation();
  const currentPath = window.location.pathname;
  const currentIndex = workPages.findIndex((p) => p.path === currentPath);
  const navigate = useNavigate();
  return (
    <>
      <div className={styles.workNavBar}>
        <Button
          variant="tertiary"
          size="m"
          icon={<MdWork />}
          onClick={() => navigate("/work")}
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
              if (currentIndex > 0) navigate(workPages[currentIndex - 1].path);
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
                navigate(workPages[currentIndex + 1].path);
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
