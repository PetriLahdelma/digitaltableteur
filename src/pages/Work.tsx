import React from "react";
import { Helmet } from "react-helmet";
import styles from "./Work.module.css";
import MoireBackground from "../components/MoireBackground";
import Ufo from "../assets/images/ufo.webp";
import sausage from "../assets/images/sausage.webp";
import fur from "../assets/images/fur.webp";
import blackletter from "../assets/images/blackletter.webp";
import projectData from "../data/workData.json";

const Work = () => {
  return (
    <>
      <Helmet>
        <title>Work | Digitaltableteur</title>
        <meta
          name="description"
          content="Selected projects and experiments by Digitaltableteur"
        />
      </Helmet>
      <div className={styles["work-page"]}>
        <section className={styles.section1}>
          <ul>
            <li>Strategy</li>
            <li>Concept development</li>
            <li>Identity systems</li>
            <li>Content</li>
            <li>Experimental</li>
            <li>Development</li>
            <li>Impact and sustainability</li>
          </ul>
        </section>
        <section className={styles.section2}>Section 2</section>
        <section className={styles.section3}>
          <MoireBackground lineCount={800} lineSpacing={2} />
        </section>
        <section className={styles.section4}>Section 4</section>
        <section className={styles.section5}>
          <div className={styles.scrollableContainer}>
            <div className={styles.scrollableContent}>
              <div className={styles.scrollItem}>
                <img
                  src={blackletter}
                  alt="Blackletter"
                  style={{ width: "100%", height: "100%", objectFit: "fill" }}
                />
              </div>
              <div className={styles.scrollItem}>
                <img
                  src={sausage}
                  alt="Sausage"
                  style={{ width: "100%", height: "100%", objectFit: "fill" }}
                />
              </div>
              <div className={styles.scrollItem}>
                <img
                  src={fur}
                  alt="Fur"
                  style={{ width: "100%", height: "100%", objectFit: "fill" }}
                />
              </div>
            </div>
          </div>
        </section>
        <section className={styles.projectSection}>
          {projectData.slice(0, 6).map((project, idx) => (
            <div key={idx} className={styles.project}>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className={styles.year}>{project.year}</div>
            </div>
          ))}
        </section>
        <section className={styles.section6}>Section 6</section>
        <section className={styles.section7}>Section 7</section>
        <section className={styles.section8}>Section 8</section>
      </div>
    </>
  );
};

export default Work;
