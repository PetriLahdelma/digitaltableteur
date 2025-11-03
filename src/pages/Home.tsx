import React, { useEffect, useMemo, useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import Grid from "@dt/Grid";
import styles from "./Home.module.css";
import "../styles/variables.css";
import Title from "@dt/Title";
import Text from "@dt/Text";
import Link from "@dt/Link";
import { useTranslation } from "react-i18next";

const Home = () => {
  const { t } = useTranslation();
  const texts = useMemo(
    () => [
      t("homeCreativeDevelopment"),
      t("homeStrategyBranding"),
      t("homeIllustrationEditorial"),
    ],
    [t],
  );
  const [currentText, setCurrentText] = useState(texts[0]);

  useEffect(() => {
    setCurrentText(texts[0]); // Reset on language change
    const interval = setInterval(() => {
      setCurrentText((prevText) => {
        const currentIndex = texts.indexOf(prevText);
        const nextIndex = (currentIndex + 1) % texts.length;
        return texts[nextIndex];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [texts]);

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>{t("homeMetaTitle")}</title>
          <meta name="description" content={t("homeMetaDescription")} />
          <meta property="og:title" content={t("homeMetaTitle")} />
          <meta property="og:description" content={t("homeMetaDescription")} />
          <meta property="og:image" content="/logo512.png" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={t("homeMetaTitle")} />
          <meta name="twitter:description" content={t("homeMetaDescription")} />
          <meta name="twitter:image" content="/logo512.png" />
        </Helmet>
      </HelmetProvider>
      <div className={styles.home}>
        <section className={styles.hero}>
          <Grid columns={1} gap="1rem">
            <div
              style={{
                gridColumn: "1 / span 3",
                background: "var(--home-gradient)",
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
          <Title className={styles.gradientText} level={1} size="XL">
            {currentText}
          </Title>
          <Grid columns="repeat(auto-fit, minmax(280px, 1fr))" gap="1rem">
            <div className={styles["gridItemBlank"]}>
              <p className={styles.lead}>{t("homeAbout")}</p>
            </div>
          </Grid>
        </section>
        <section className={styles.cta}>
          <h2>{t("homeCtaTitle")}</h2>
          <Link className={styles.ctaLink} href="/contact">
            {t("homeCtaLink")}
          </Link>
        </section>
      </div>
    </>
  );
};

export default Home;
