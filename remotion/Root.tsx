import React from "react";
import { Composition } from "remotion";
import "../nextjs-app/shared/styles/variables.css";
import { DtMarkerRotation } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DtMarkerRotation"
        component={DtMarkerRotation}
        durationInFrames={180}
        fps={30}
        width={1080}
        height={1080}
      />
    </>
  );
};
