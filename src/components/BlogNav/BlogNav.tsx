import React from "react";
import Button from "@dt/Button";
import { MdArrowBack, MdArrowForward, MdDescription } from "react-icons/md";
import styles from "./blognav.module.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import path from "path";

const blogPages = [
  { path: "/blog/petri-lahdelma-bio", labelKey: "blogNavPetriLahdelmaBio" },
  {
    path: "/blog/digital-craftsmanship",
    labelKey: "blogNavDigitalCraftsmanship",
  },
  { path: "/blog/figma-mcp-design-systems", labelKey: "blogNavFigmaMcp" },
  {
    path: "/blog/thoughts-on-future-branding",
    labelKey: "blogNavThoughtsOnFutureBranding",
  },
  { path: "/blog/designing-in-2025", labelKey: "blogNavDesigning2025" },
  { path: "/blog/workflow-tips", labelKey: "blogNavWorkflowTips" },
];

const BlogNav: React.FC = () => {
  const { t } = useTranslation();
  const currentPath = window.location.pathname;
  const currentIndex = blogPages.findIndex((p) => p.path === currentPath);
  const navigate = useNavigate();
  return (
    <>
      <div className={styles.blogNavBar}>
        <Button
          variant="tertiary"
          size="m"
          icon={<MdDescription />}
          onClick={() => navigate("/blog")}
        >
          {t("blogNavBackToArticles")}
        </Button>
        <div className={styles.rightNavGroup}>
          <Button
            variant="tertiary"
            size="m"
            icon={<MdArrowBack />}
            disabled={currentIndex <= 0}
            onClick={() => {
              if (currentIndex > 0) navigate(blogPages[currentIndex - 1].path);
            }}
          >
            {t("blogNavPrev")}
          </Button>
          <Button
            variant="tertiary"
            size="m"
            endIcon={<MdArrowForward />}
            disabled={currentIndex === blogPages.length - 1}
            onClick={() => {
              if (currentIndex < blogPages.length - 1)
                navigate(blogPages[currentIndex + 1].path);
            }}
          >
            {t("blogNavNext")}
          </Button>
        </div>
      </div>
      <hr className={styles.hrLine} />
    </>
  );
};

export default BlogNav;
