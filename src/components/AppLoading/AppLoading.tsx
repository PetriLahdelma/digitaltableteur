import React from "react";
import styles from "./AppLoading.module.css";
import BusyIndicator from "../BusyIndicator/BusyIndicator";

/** Full-screen application loading overlay used as Suspense fallback */
const AppLoading: React.FC = () => {
  return (
    <div className={styles.overlayRoot} data-testid="app-loading-overlay">
      <BusyIndicator variant="overlay" />
    </div>
  );
};

export default AppLoading;
