import React from "react";
import { Helmet } from "react-helmet";
import styles from "./About.module.css";
import Title from "../components/Title/Title";
import Text from "../components/Text/Text";

const About = () => {
  return (
    <>
      <Helmet>
        <title>About | Digitaltableteur</title>
        <meta
          name="description"
          content="Learn about Digitaltableteur's approach to design and development."
        />
        <meta property="og:title" content="About | Digitaltableteur" />
        <meta
          property="og:description"
          content="Learn about Digitaltableteur's approach to design and development."
        />
        <meta property="og:image" content="/logo512.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About | Digitaltableteur" />
        <meta
          name="twitter:description"
          content="Learn about Digitaltableteur's approach to design and development."
        />
        <meta name="twitter:image" content="/logo512.png" />
      </Helmet>
      <div className={styles.about}>
        <section className={styles.hero}>
          <Title size="L">What we do</Title>
          <Text>
            We craft digital experiences that help brands stand out and connect
            with their audience.
          </Text>
        </section>

        <section className={styles.section}>
          <Title size="M">Design</Title>
          <Text>
            From strategy to identity and interface, we focus on clarity and
            expression so every product feels considered and unique.
          </Text>
        </section>

        <section className={styles.section}>
          <Title size="M">Development</Title>
          <Text>
            We build websites and digital tools with care, combining modern
            technology and a deep attention to craft.
          </Text>
        </section>

        <section className={styles.section}>
          <Title size="M">Collaboration</Title>
          <Text>
            Working closely with clients, we turn ideas into memorable products
            that shape culture and create impact.
          </Text>
        </section>
      </div>
    </>
  );
};

export default About;
