import React, { useState, useEffect } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import Grid from "../components/Grid/Grid";
import styles from "./Home.module.css";
import "../styles/variables.css";
import Title from "../components/Title/Title";
import Text from "../components/Text/Text";
import Link from "../components/Link/Link";

const Home = () => {
  const [currentText, setCurrentText] = useState("Creative & Development");
  const texts = [
    "Creative & Development",
    "Strategy & Branding",
    "Illustration & Editorial Design",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText((prevText) => {
        const currentIndex = texts.indexOf(prevText);
        const nextIndex = (currentIndex + 1) % texts.length;
        return texts[nextIndex];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>Digitaltableteur - Creative & Development</title>
          <meta
            name="description"
            content="Design-led digital studio delivering strategy, branding and development."
          />
          <meta
            property="og:title"
            content="Digitaltableteur - Creative & Development"
          />
          <meta
            property="og:description"
            content="Design-led digital studio delivering strategy, branding and development."
          />
          <meta property="og:image" content="/logo512.png" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta
            name="twitter:title"
            content="Digitaltableteur - Creative & Development"
          />
          <meta
            name="twitter:description"
            content="Design-led digital studio delivering strategy, branding and development."
          />
          <meta name="twitter:image" content="/logo512.png" />
        </Helmet>
      </HelmetProvider>
      <div className={styles.home}>
        <section className={styles.hero}>
          <Grid columns={1} gap="1rem">
            <div
              style={{
                gridColumn: "1 / span 3",
                background:
                  "linear-gradient(120deg, #007cf0 0%, #ff0080 50%, #fff200 100%)",
                backgroundSize: "200% 200%",
                animation: "gradientMove 4s ease-in-out infinite",
                height: "75vh",
              }}
            ></div>
            <style>
              {`
                @keyframes gradientMove {
                  0% {
                    background-position: 0% 50%;
                  }
                  50% {
                    background-position: 100% 50%;
                  }
                  100% {
                    background-position: 0% 50%;
                  }
                }
              `}
            </style>
          </Grid>
        </section>
        <section className={styles.about}>
          <Title level={1} size="XL">
            {currentText}
          </Title>
          <Grid columns={3} gap="1rem">
            <div
              className={styles["grid-item-blank"]}
              style={{ gridColumn: "2 / span 2" }}
            >
              <p className={styles.lead}>
                That&apos;s what makes Digitaltableteur — a design-led
                development studio. Based online, working globally. Helping
                individuals rethink, simplify, and stand out. Whether it’s
                strategy, identity, interface, or experience — DT cuts through
                the noise to deliver clarity, presence, and expression. Well
                known for obsession to craft, systems, and a little bit of
                chaos.
              </p>
            </div>
          </Grid>
        </section>
        <section className={styles.cta}>
          <h2>Ready to create something extraordinary?</h2>
          <Link className={styles.ctaLink} href="/contact">
            Let&apos;s talk
          </Link>
        </section>
      </div>
    </>
  );
};

export default Home;
