import React from "react";
import styles from "./Article.module.css";

const DigitalCraftsmanship = () => (
  <article className={styles.article}>
    <header>
      <h1>Digital Craftsmanship</h1>
      <p className={styles.author}>By Digitaltableteur</p>
    </header>
    <p>This story is coming soon. It will dive into how we maintain quality while moving fast.</p>
  </article>
);

export default DigitalCraftsmanship;
