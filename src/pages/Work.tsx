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
import { useTranslation } from "react-i18next";

const Work = () => {
  const { t } = useTranslation();

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>{t("workMetaTitle")}</title>
          <meta name="description" content={t("workMetaDescription")} />
          <meta property="og:title" content={t("workMetaTitle") as string} />
          <meta
            property="og:description"
            content={t("workMetaDescription") as string}
          />
          <meta property="og:image" content="/logo512.png" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={t("workMetaTitle") as string} />
          <meta
            name="twitter:description"
            content={t("workMetaDescription") as string}
          />
          <meta name="twitter:image" content="/logo512.png" />
        </Helmet>
        <div className={styles["workPage"]}>
          <section className={styles.works}>
            <FlexBox
              direction="row"
              wrap="wrap"
              gap="5rem"
              className={styles.worksGrid}
            >
              <div className={styles.workItem}>
                <img
                  className={styles.blueArrowImage}
                  src={IceCream}
                  alt={t("workAltIceCream")}
                />
              </div>
              <div className={styles.workItem}>
                <img
                  className={styles.blueArrowImage}
                  src={Sc5Icon}
                  alt={t("workAltSc5Icon")}
                />
              </div>
              <div className={styles.workItem}>
                <img
                  className={styles.blueArrowImage}
                  src={BlueArrow}
                  alt={t("workAltBlueArrow")}
                />
              </div>
            </FlexBox>
          </section>
        </div>
      </HelmetProvider>
    </>
  );
};

export default Work;
