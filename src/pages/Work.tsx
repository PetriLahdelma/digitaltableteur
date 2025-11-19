import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import styles from "./Work.module.css";
import Ufo from "../assets/images/ufo.webp";
import sausage from "../assets/images/sausage.webp";
import fur from "../assets/images/fur.webp";
import blackletter from "../assets/images/blackletter.webp";
import Grid from "@dt/Grid";
import FlexBox from "@dt/FlexBox";

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
            <FlexBox
              gap="2rem"
              className={styles.worksGrid}
              style={{ flexWrap: "wrap", flexDirection: "row" }}
            >
              <a
                href="work/new-things-co"
                rel="noopener noreferrer"
                className={styles.workItem}
                aria-label="View New Things Co project details"
              >
                <img
                  src="/images/portfolio/new_things_co/new_things_co_item.webp"
                  alt="New Things Co project preview"
                />
                <span className="visuallyHidden">
                  View New Things Co project
                </span>
              </a>
              <div className={styles.workItem}>
                <a
                  href="work/illustrations"
                  rel="noopener noreferrer"
                  className={styles.workItem}
                  aria-label="View Illustrations project details"
                >
                  <img
                    src="/images/portfolio/illustrations/ice-cream.webp"
                    alt="Illustrations project preview"
                  />
                  <span className="visuallyHidden">
                    View Illustrations project
                  </span>
                </a>
              </div>
              <div className={styles.workItem}>
                <a
                  href="work/garage-junction"
                  rel="noopener noreferrer"
                  className={styles.workItem}
                  aria-label="View Garage Junction project details"
                >
                  <img
                    src="/images/portfolio/garage_junction/check_pattern@2x.webp"
                    alt="Garage Junction project preview"
                  />
                  <span className="visuallyHidden">
                    View Garage Junction project
                  </span>
                </a>
              </div>
            </FlexBox>
          </section>
        </div>
      </HelmetProvider>
    </>
  );
};

export default Work;
