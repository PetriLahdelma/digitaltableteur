import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import styles from "./Work.module.css";
import MoireBackground from "../components/MoireBackground";
import Ufo from "../assets/images/ufo.webp";
import sausage from "../assets/images/sausage.webp";
import fur from "../assets/images/fur.webp";
import blackletter from "../assets/images/blackletter.webp";
import projectData from "../data/workData.json";
import FlexBox from "../components/FlexBox/FlexBox";
import Grid from "../components/Grid/Grid";

const Work = () => {
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
            </Grid>
          </section>
        </div>
      </HelmetProvider>
    </>
  );
};

export default Work;
