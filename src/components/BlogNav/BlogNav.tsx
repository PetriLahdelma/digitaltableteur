import React from "react";
import styles from "./BlogNav.module.css";
import Button from "@dt/Button";
import { MdDescription } from "react-icons/md";
import { useTranslation } from "react-i18next";
import Link from "next/link";

const blogPages = [
  { path: "/blog/figma-mcp-design-systems", labelKey: "blogNavFigmaMCP" },
  {
    path: "/blog/digital-craftsmanship",
    labelKey: "blogNavDigitalCraftsmanship",
  },
  { path: "/blog/designing-in-2025", labelKey: "blogNavDesigning2025" },
  { path: "/blog/workflow-tips", labelKey: "blogNavWorkflowTips" },
];

const BlogNav: React.FC = () => {
  const { t } = useTranslation();
  const [currentPath, setCurrentPath] = React.useState("");
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);
    }
  }, []);
  const currentIndex = blogPages.findIndex((p) => p.path === currentPath);
  return (
    <div className={styles.blogNavBar}>
      <Link href="/blog" passHref legacyBehavior>
        <Button variant="tertiary" size="m" icon={<MdDescription />}>
          {t("blogNavBackToArticles")}
        </Button>
      </Link>
      <div className={styles.rightNavGroup}>
        {/* Add next/prev navigation if needed, using Link */}
      </div>
    </div>
  );
};

export default BlogNav;
