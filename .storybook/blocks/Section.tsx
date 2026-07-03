import React from "react";
import Title from "@dt/Title";
import styles from "./Section.module.css";

/**
 * Shared docs-frame section chrome: anchor-friendly heading plus consistent
 * vertical rhythm. `block` becomes the `data-doc-block` hook the docs smoke
 * gate counts.
 */
export function Section({
  block,
  heading,
  children,
}: {
  block: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.section} data-doc-block={block}>
      <Title as="h2" size="xs" className={styles.heading}>
        {heading}
      </Title>
      {children}
    </section>
  );
}
