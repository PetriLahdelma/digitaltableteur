import React from "react";
import styles from "./AppLoading.module.css";
import Spinner from "@dt/Spinner";
import { useTranslate } from "../../lib/translation";

/** Full-screen application loading overlay used as Suspense fallback */
const AppLoading: React.FC = () => {
  const t = useTranslate();
  const label = t("busyIndicator.loading", "Loading");
  return (
    <div className={styles.overlayRoot} data-testid="app-loading-overlay">
      <span className={styles.loading}>
        <Spinner size="lg" label={label} />
        <span aria-hidden="true" className={styles.label}>
          {label}
        </span>
      </span>
    </div>
  );
};

export default AppLoading;
