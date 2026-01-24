import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import styles from "./Composition.module.css";

export const DtMarkerRotation: React.FC = () => {
  return (
    <AbsoluteFill className={styles.stage}>
      <div className={styles.perspective}>
        <Img
          className={styles.marker}
          src={staticFile("dt-marker.svg")}
          alt="Digitaltableteur marker"
        />
      </div>
    </AbsoluteFill>
  );
};
