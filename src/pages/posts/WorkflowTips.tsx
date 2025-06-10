import React from "react";
import styles from "../Article.module.css";
import Author from "../../components/Author/Author";
import VaultBoy from "../../assets/images/pete-vault-boy.jpg";

const WorkflowTips = () => (
  <article className={styles.article}>
    <header>
      <h1>Workflow Tips</h1>
      <Author name="Digitaltableteur" imageUrl={VaultBoy} size="32px" />
    </header>
    <div className={styles.video}>
      <iframe
        width="100%"
        height="315"
        src="https://www.youtube.com/embed/m0b_D2JgZgY?si=ssccfFHGfntt_CWQ"
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      ></iframe>
    </div>
    <p>
      We are preparing this article. Check back soon for insights into our
      day-to-day process.
    </p>
    <div className={styles.similar}>
      <h2>Similar reads</h2>
      <div className={styles["similar-list"]}>
        <a
          href="/blog/designing-in-2025"
          className={`${styles["similar-card"]} ${styles.teal}`}
        >
          Designing in 2025
        </a>
        <a
          href="/blog/digital-craftsmanship"
          className={`${styles["similar-card"]} ${styles.purple}`}
        >
          Digital Craftsmanship
        </a>
      </div>
    </div>
  </article>
);

export default WorkflowTips;
