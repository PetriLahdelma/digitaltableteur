import React from "react";
import { Canvas, Controls } from "@storybook/addon-docs/blocks";
import type { PreparedDocsStory } from "./docsStories";
import { Section } from "./Section";
import styles from "./PropsSection.module.css";

/**
 * The props table as a control panel: the Playground story's canvas with its
 * Controls bound underneath, so knob edits are visibly live (Astryx's
 * props-table-as-playground pattern via Storybook natives).
 */
export function PropsSection({
  playground,
  heading = "Props",
}: {
  playground: PreparedDocsStory | null;
  heading?: string;
}) {
  if (!playground) return null;
  return (
    <Section block="props" heading={heading}>
      <div className={styles.panel}>
        <Canvas of={playground.moduleExport} sourceState="none" />
        <Controls of={playground.moduleExport} />
      </div>
    </Section>
  );
}
