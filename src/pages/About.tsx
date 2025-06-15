import React from "react";
import { Helmet } from "react-helmet";
import styles from "./About.module.css";

const About = () => {
  return (
    <>
      <Helmet>
        <title>About | Digitaltableteur</title>
        <meta
          name="description"
          content="Learn about Digitaltableteur's approach to design and development."
        />
      </Helmet>
      <div className={styles.about}>
        <section className={styles.hero}>
          <h1>What we do</h1>
          <p>
            We craft digital experiences that help brands stand out and connect
            with their audience.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Design</h2>
          <p>
            From strategy to identity and interface, we focus on clarity and
            expression so every product feels considered and unique.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Development</h2>
          <p>
            We build websites and digital tools with care, combining modern
            technology and a deep attention to craft.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Collaboration</h2>
          <p>
            Working closely with clients, we turn ideas into memorable products
            that shape culture and create impact.
          </p>
        </section>
      </div>
    </>
  );
};

export default About;
