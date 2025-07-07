import React from "react";
import Button from "../Button/Button";
import { MdArrowBack, MdArrowForward, MdWork } from "react-icons/md";
import styles from "./worknav.module.css";

const workPages = [
  { path: "/work/new-things-co", label: "New Things Co" },
  { path: "/work/nitor", label: "Nitor" },
  { path: "/work/illustrations", label: "Illustrations" },
];

const WorkNav: React.FC = () => {
  const currentPath = window.location.pathname;
  const currentIndex = workPages.findIndex((p) => p.path === currentPath);
  return (
    <>
      <div className={styles.workNavBar}>
        <Button
          variant="tertiary"
          size="m"
          icon={<MdWork />}
          onClick={() => (window.location.href = "/work")}
        >
          Back to Work
        </Button>
        <div className={styles.rightNavGroup}>
          <Button
            variant="tertiary"
            size="m"
            icon={<MdArrowBack />}
            disabled={currentIndex <= 0}
            onClick={() => {
              if (currentIndex > 0)
                window.location.href = workPages[currentIndex - 1].path;
            }}
          >
            Prev
          </Button>
          <Button
            variant="tertiary"
            size="m"
            endIcon={<MdArrowForward />}
            disabled={currentIndex === workPages.length - 1}
            onClick={() => {
              if (currentIndex < workPages.length - 1)
                window.location.href = workPages[currentIndex + 1].path;
            }}
          >
            Next
          </Button>
        </div>
      </div>
      <hr className={styles.hrLine} />
    </>
  );
};

export default WorkNav;
