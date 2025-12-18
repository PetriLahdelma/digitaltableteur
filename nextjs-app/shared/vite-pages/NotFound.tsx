import React from "react";
import styles from "./NotFound.module.css";
import notFoundImage from "../assets/images/404.webp";
import Button from "@dt/Button";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const { t } = useTranslation();
  const resolvedImageSrc =
    typeof notFoundImage === "string" ? notFoundImage : notFoundImage.src;
  return (
    <div className={styles.notFoundPage}>
      <img src={resolvedImageSrc} alt={t("notFoundAlt")} />
      <Button variant="secondary" onClick={() => (window.location.href = "/")}>
        {t("notFoundButton")}
      </Button>
    </div>
  );
};

export default NotFound;
