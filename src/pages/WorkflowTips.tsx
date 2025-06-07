import React from "react";
import styles from "./Article.module.css";

const WorkflowTips = () => (
  <article className={styles.article}>
    <header>
      <h1>Workflow Tips</h1>
      <p className={styles.author}>By Digitaltableteur</p>
    </header>
    <p>
      We are preparing this article. Check back soon for insights into our
      day-to-day process.
    </p>
  </article>
);

export default WorkflowTips;
