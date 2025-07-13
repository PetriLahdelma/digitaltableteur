"use client";
import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import styles from "../../src/pages/Work.module.css";
import Ufo from "../../src/assets/images/ufo.webp";
import sausage from "../../src/assets/images/sausage.webp";
import fur from "../../src/assets/images/fur.webp";
import blackletter from "../../src/assets/images/blackletter.webp";
import Grid from "@dt/Grid";
import Header from "../../src/patterns/Header/Header";

const Work = () => {
  const { i18n } = useTranslation();
  if (!i18n.isInitialized) return null;
  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>Work | Digitaltableteur</title>
          <meta
            name="description"
            content="Selected projects and experiments by Digitaltableteur"
          />
          <meta property="og:title" content="Work | Digitaltableteur" />
          <meta
            property="og:description"
            content="Selected projects and experiments by Digitaltableteur"
          />
          <meta property="og:image" content="/logo512.png" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Work | Digitaltableteur" />
          <meta
            name="twitter:description"
            content="Selected projects and experiments by Digitaltableteur"
          />
          <meta name="twitter:image" content="/logo512.png" />
        </Helmet>
        <div className={styles["workPage"]}>
          <section className={styles.works}>
            <Grid columns={3} gap="2rem" className={styles.worksGrid}>
              <a
                href="work/new-things-co"
                rel="noopener noreferrer"
                className={styles.workItem}
              >
                <img
                  src="/images/portfolio/new_things_co/new_things_co_item.webp"
                  alt="New Things Co project link."
                />
              </a>
              <div className={styles.workItem}>
                <a
                  href="work/illustrations"
                  rel="noopener noreferrer"
                  className={styles.workItem}
                >
                  <img
                    src="/images/portfolio/illustrations/ice-cream.webp"
                    alt="Illustrations project link"
                  />
                </a>
              </div>
              <div className={styles.workItem}>
                <a
                  href="work/garage-junction"
                  rel="noopener noreferrer"
                  className={styles.workItem}
                >
                  <img
                    src="/images/portfolio/garage_junction/check_pattern@2x.webp"
                    alt="Garage Junction project link"
                  />
                </a>
              </div>
            </Grid>
          </section>
        </div>
      </HelmetProvider>
    </>
  );
};

export default Work;
