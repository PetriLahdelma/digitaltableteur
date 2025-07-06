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
import BlueArrow from "../assets/images/portfolio/blue_arrow/bluearrow@2x.webp";
import Sc5Icon from "../assets/images/portfolio/sc5/sc5_icon@2x.webp";
import IceCream from "../assets/images/portfolio/illustration/ice-cream.webp";
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
                  className={styles.newthingsImage}
                  src="/images/portfolio/new_things_co/gallery/logo@2x.webp"
                  alt="A UFO with a glowing light beam, hovering above a field."
                />
              </a>
              <div className={styles.workItem}>
                <img
                  className={styles.blueArrowImage}
                  src={IceCream}
                  alt="A colorful scoop of ice cream in a cone, melting slightly."
                />
              </div>
              <div className={styles.workItem}>
                <img
                  className={styles.blueArrowImage}
                  src={Sc5Icon}
                  alt="The image features a stylized icon labeled 'Sc5.'"
                />
              </div>
              <div className={styles.workItem}>
                <img
                  className={styles.blueArrowImage}
                  src={BlueArrow}
                  alt="A vibrant blue arrow pointing right against a contrasting background."
                />
              </div>
            </Grid>
          </section>
        </div>
      </HelmetProvider>
    </>
  );
};

export default Work;
