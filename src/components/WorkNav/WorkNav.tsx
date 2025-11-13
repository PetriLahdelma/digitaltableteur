import React from "react";
import Button from "@dt/Button";
import Icon from "@dt/Icon";
import styles from "./worknav.module.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const workPages = [
  { path: "/work/new-things-co", labelKey: "workNavNewThingsCo" },
  { path: "/work/illustrations", labelKey: "workNavIllustrations" },
  { path: "/work/garage-junction", labelKey: "workNavGarageJunction" },
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
          icon={<Icon name="briefcase" />}
          onClick={() => navigate("/work")}
        >
          {t("workNavBackToWork")}
        </Button>
        <div className={styles.rightNavGroup}>
          <Button
            variant="tertiary"
            size="m"
            icon={<Icon name="arrow-left" />}
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
            endIcon={<Icon name="arrow-right" />}
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
